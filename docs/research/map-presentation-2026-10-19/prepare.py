"""Cache the five published terrain-render mosaics and sparse hazard overlays.

Only image assets and literal JSON indexes are read. No downloaded code runs.
"""
import concurrent.futures
import hashlib
import io
import json
import pathlib
import time
import urllib.request

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[3]
HERE = pathlib.Path(__file__).resolve().parent
CACHE = HERE / "tiles"
OUTPUT = ROOT / "public/images/maps/atlas"
CACHE.mkdir(exist_ok=True)
OUTPUT.mkdir(parents=True, exist_ok=True)
HEADERS = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.maprunner.info/"}
sources = ["emerald-lake", "gimli-ridge", "asgard-mountain", "tassili-n-ajjer-desert", "aures-mountains"]
labels = {"ground": "Terrain hazards", "snow": "Deep snow", "ice": "Ice", "soft": "Soft ground", "water": "Water"}


def get(url, target):
    if target.exists():
        return target.read_bytes()
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=35) as response:
                data = response.read()
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            return data
        except Exception:
            if attempt == 3:
                raise
            time.sleep(attempt + 1)


def mosaic(slug, config, zoom, tiles):
    version = config["v"]
    base = "https://cdn3.maprunner.info/" + config["dir"]
    directory = CACHE / slug / config["dir"].split("/")[-1]
    def tile(key):
        z, x, y = map(int, key.split("/"))
        raw = get(f"{base}/{key}.webp?v={version}", directory / (key.replace("/", "-") + ".webp"))
        image = Image.open(io.BytesIO(raw)).convert("RGBA")
        assert image.size == (256, 256)
        return x, y, image
    canvas = Image.new("RGBA", (256 * 2 ** zoom, 256 * 2 ** zoom))
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        for x, y, image in executor.map(tile, tiles):
            canvas.paste(image, (x * 256, y * 256))
    return canvas


manifest = []
for name in sources:
    slug = name.replace("tassili-n-ajjer", "tassili-najjer")
    data = json.loads((HERE.parent / "map-expanded-2026-10-19" / (name + ".json")).read_text(encoding="utf-8"))
    config = next(layer for layer in data["layers"] if layer["label"] == "Satellite")
    image = mosaic(slug, config, 4, [f"4/{x}/{y}" for x in range(16) for y in range(16)])
    assert image.getextrema()[3] == (255, 255), "Incomplete satellite mosaic"
    file = OUTPUT / (slug + "-satellite.webp")
    image.convert("RGB").save(file, "WEBP", quality=88, method=5)
    record = {"slug": slug, "satellite": "/images/maps/atlas/" + file.name,
              "width": 4096, "height": 4096, "source": "https://www.maprunner.info/overthehill/" + name,
              "renderVersion": config["v"], "sha256": hashlib.sha256(file.read_bytes()).hexdigest(),
              "hazards": []}
    print(slug + ": 4096px satellite ready", flush=True)
    for overlay in data["overlays"]:
        url = "https://cdn3.maprunner.info/" + overlay["dir"] + "/tiles.json?v=" + overlay["v"]
        index = json.loads(get(url, CACHE / slug / (overlay["kind"] + "-index.json")))
        keys = [key for key in index if key.startswith("3/")]
        if not keys:
            continue
        image = mosaic(slug, overlay, 3, keys)
        file = OUTPUT / (slug + "-" + overlay["kind"] + ".webp")
        image.save(file, "WEBP", lossless=True, method=5)
        record["hazards"].append({"key": overlay["kind"], "label": labels[overlay["kind"]],
            "image": "/images/maps/atlas/" + file.name, "version": overlay["v"],
            "sha256": hashlib.sha256(file.read_bytes()).hexdigest()})
    manifest.append(record)
    print(slug + ": " + str(len(record["hazards"])) + " hazard layers ready", flush=True)
(HERE / "assets.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
(ROOT / "src/data/maps/presentation.json").write_text(json.dumps([
    {"slug": item["slug"], "satellite": item["satellite"],
     "hazards": [{"key": h["key"], "label": h["label"], "image": h["image"]} for h in item["hazards"]]}
    for item in manifest], indent=2) + "\n", encoding="utf-8")
print("All five maps ready.", flush=True)
