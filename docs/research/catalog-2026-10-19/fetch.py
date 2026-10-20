"""Read-only evidence capture. Never evaluates downloaded JavaScript."""
import concurrent.futures, json, re, urllib.request
from pathlib import Path
HERE = Path(__file__).resolve().parent
def fetch(pair):
    name, url = pair
    try:
        output = HERE / (name + '.json')
        if output.exists(): return name, 'cached'
        raw = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=35).read()
        (HERE / (name + '.html')).write_bytes(raw)
        match = re.search(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>', raw.decode('utf8'))
        if not match: return name, 'HTML only'
        array = json.loads(match.group(1))
        def decode(index):
            if index < 0: return None
            value = array[index]
            if isinstance(value, dict): return {key: decode(i) for key, i in value.items()}
            if isinstance(value, list):
                if value and isinstance(value[0], str): return decode(value[1]) if len(value)>1 and isinstance(value[1], int) else value
                return [decode(i) for i in value]
            return value
        data = decode(0)['data']
        output.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf8')
        return name, 'saved'
    except Exception as error: return name, str(error)
jobs=[]
for kind in ['vehicles', 'animals']:
    data=json.loads((HERE/(kind+'.json')).read_text(encoding='utf8'))['oth-'+kind+'-en']
    jobs += [(kind+'-'+row['slug'], 'https://www.maprunner.info/overthehill/'+kind+'/'+row['slug']) for row in data]
with concurrent.futures.ThreadPoolExecutor(5) as pool:
    for result in pool.map(fetch, jobs): print(*result, flush=True)
