"""Code-native editorial figures using checked game assets and map coordinates."""
import base64
import hashlib
import html
import io
import json
import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / "public/images/guides"
OUT.mkdir(exist_ok=True)
atlas = json.loads((ROOT / "src/data/maps/atlas.json").read_text(encoding="utf-8"))
entries = json.loads((ROOT / "src/data/wiki/entries.json").read_text(encoding="utf-8"))
background = Image.open(ROOT / "public/images/maps/atlas/emerald-lake-satellite.webp")
manifest = []


def uri(image):
    data = io.BytesIO()
    image.save(data, "WEBP", quality=88)
    return "data:image/webp;base64," + base64.b64encode(data.getvalue()).decode()


def native(path):
    return uri(Image.open(ROOT / ("public" + path)).convert("RGBA"))


def text(x, y, value, size=23, colour="#f9efd8", weight="normal"):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{colour}" font-weight="{weight}">{html.escape(value)}</text>'


def frame(title, subtitle, body, height=1000):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="{height}" viewBox="0 0 1200 {height}" role="img"><title>{html.escape(title)}</title><rect width="1200" height="{height}" fill="#203c30"/><g font-family="Arial,sans-serif">' + text(35, 43, "OVER THE HILL / FIELD NOTES", 14, "#d9ac70", "bold") + text(35, 88, title, 32, weight="bold") + text(35, 122, subtitle, 18, "#c5ceb6") + body + '</g></svg>'


def save(name, content, description, inputs):
    file = OUT / name
    file.write_text(content, encoding="utf-8")
    manifest.append({"file": "/images/guides/" + name, "description": description,
                     "inputs": inputs, "sha256": hashlib.sha256(file.read_bytes()).hexdigest()})


def map_figure(name, title, bounds, trails=None, points=None):
    x0, y0, x1, y1 = bounds
    crop = background.crop(tuple(round(v * 4096) for v in bounds))
    crop.thumbnail((1080, 1080))
    side = 750
    body = f'<image x="30" y="158" width="{side}" height="{side}" preserveAspectRatio="none" href="{uri(crop)}"/>'
    def project(p):
        return 30 + (p["x"]-x0)/(x1-x0)*side, 158 + (p["y"]-y0)/(y1-y0)*side
    colours = ["#efb94d", "#ec8aba", "#7dc3d6"]
    if trails:
        for index, trail in enumerate(trails):
            colour = colours[index]
            coords = [project(p) for p in trail["points"]]
            points_string = " ".join(f'{x:.2f},{y:.2f}' for x,y in coords)
            body += f'<polyline points="{points_string}" fill="none" stroke="#172b23" stroke-width="6"/><polyline points="{points_string}" fill="none" stroke="{colour}" stroke-width="3" stroke-dasharray="7 4"/>'
            for i,(x,y) in enumerate(coords):
                radius = 9 if i in [0,len(coords)-1] else 5
                body += f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{colour}" stroke="#fff5de" stroke-width="2"/>'
                if i in [0,len(coords)-1]:
                    body += f'<text x="{x}" y="{y-16}" font-size="18" font-weight="bold" text-anchor="middle" fill="#183025" stroke="#fff2d3" stroke-width="4" paint-order="stroke">{"START" if i==0 else "FINISH"}</text>'
            y = 210 + index * 185
            body += text(812,y,trail["title"],22,colour,"bold") + text(812,y+38,f'{len(coords)} ordered checkpoints',18)
            body += text(812,y+68,"Start at the named pin.",17,"#c5ceb6")
            rewards = atlas["details"][trail["placeId"]]["rewards"]
            for k,reward in enumerate(rewards):
                body += text(812,y+101+k*27, f'{reward["count"]} Pebbles' if reward["name"]=="Pebbles" else reward["name"],18)
    if points:
        for i,(label,point) in enumerate(points):
            x,y = project(point)
            body += f'<circle cx="{x}" cy="{y}" r="17" fill="{colours[i]}" stroke="#fff3d9" stroke-width="3"/>'
            body += f'<text x="{x}" y="{y+6}" text-anchor="middle" font-size="18" fill="#173124" font-weight="bold">{i+1}</text>'
            body += text(812,220+i*135,f'{i+1:02} / {label}',22,colours[i],"bold")
        body += text(812,660,"Night + Dry",30,"#e6bb7a","bold") + text(812,707,"First photo: 100 Pebbles",21)
        body += text(812,752,"One possible spawn.",18,"#c5ceb6") + text(812,783,"Search the nearby forest.",18,"#c5ceb6")
    body += text(47,193,"N ↑",21,"#173124","bold")
    body += text(35,955,"Checkpoint joins show order; choose your driving line between them." if trails else "A possible spawn position. Search nearby during dry weather at night.",17,"#c5ceb6")
    save(name,frame(title,"Real terrain view / Emerald Lake, Canada",body),title,["/images/maps/atlas/emerald-lake-satellite.webp", "src/data/maps/atlas.json"])


trails = [t for t in atlas["trails"] if t["areaSlug"]=="emerald-lake"]
map_figure("emerald-trails.svg","Three trails. Two vehicle unlocks.",(0,0,1,1),trails=trails)
for key,title in [("windy-joe","Windy Joe Trail"),("hermit","Hermit Trail")]:
    trail=next(t for t in trails if t["title"]==title)
    xs=[p["x"] for p in trail["points"]];ys=[p["y"] for p in trail["points"]]
    cx=(min(xs)+max(xs))/2;cy=(min(ys)+max(ys))/2;r=max(max(xs)-min(xs),max(ys)-min(ys))*.7+.025
    map_figure(key+"-checkpoints.svg",title+" / checkpoint order",(cx-r,cy-r,cx+r,cy+r),trails=[trail])
sas=next(p for p in atlas["points"] if p.get("speciesId")=="sasquatch")
train=next(p for p in atlas["points"] if p["id"]=="crate-1302162358")
camp=next(p for p in atlas["points"] if p["id"]=="crate-1301202979")
map_figure("sasquatch-search-area.svg","Sasquatch / the northern forest",(.43,.12,.72,.41),points=[("Sasquatch search",sas),("Train Horn crate",train),("Camping Gear crate",camp)])

# Seven upgrade tracks; all symbols are actual game icons, not invented garage UI.
body=""
for i,(system,price,total) in enumerate([("Engine","25 + 50",75),("Tires","25 + 50",75),("Suspension","25 + 50",75),("Protection","25 + 50",75),("Water Resistance","25 + 50",75),("Winch","25 + 50 + 75",150),("Inventory","25 + 50 + 75",150)]):
    x=35+(i%4)*292;y=175+(i//4)*255
    item=next(e for e in entries if e["category"]=="upgrades" and any(f["label"]=="System" and f["value"]==system for f in e.get("displayFacts",[])))
    body+=f'<rect x="{x}" y="{y}" width="270" height="230" rx="8" fill="#f1efdf"/><image x="{x+15}" y="{y+10}" width="90" height="90" href="{native(item["image"])}"/>'
    body+=text(x+18,y+130,"Tool slots" if system=="Inventory" else system,23,"#294632","bold")
    body+=text(x+18,y+169,price+" Pebbles",21,"#6a715c")+text(x+18,y+204,f'Total {total}',22,"#a55e32","bold")
body+=text(910,500,"675",58,"#e5b16e","bold")+text(910,542,"PEBBLES",20,"#e5b16e","bold")+text(910,578,"16 purchases",18)+text(35,737,"Sequential purchase costs from stock. Each vehicle has its own upgrade budget.",19,"#c5ceb6")
save("upgrade-budget.svg",frame("The full upgrade budget","Buy the system that solves your next obstacle.",body,780),"Original budget diagram with game upgrade icons",["src/data/wiki/entries.json"])

def equipment_figure(name,title,items,lines):
    body=""
    for i,(slug,label) in enumerate(items):
        item=next(e for e in entries if e["slug"]==slug)
        x=35+i*580
        body+=f'<rect x="{x}" y="165" width="550" height="255" rx="8" fill="#e9ebdc"/><image x="{x+30}" y="180" width="190" height="190" href="{native(item["image"])}"/>'
        body+=text(x+235,255,label[0],26,"#294632","bold")+text(x+235,298,label[1],20,"#617153")
    for i,line in enumerate(lines):body+=text(40,485+i*50,f'{i+1:02}  /  {line}',23)
    save(name,frame(title,"Pack for the job, then check the conditions.",body,700),title,[next(e["image"] for e in entries if e["slug"]==slug) for slug,_ in items])
equipment_figure("meteorite-loadout.svg","Find it. Set up the pull. Recover it.",[("meteorite-radar",("Meteorite Radar","Find a direction")),("repair-kit",("Repair Kit","Back-up for damage"))],["Find the orange glow or follow the radar direction.","Leave a clear line to drive away from the rock.","Attach the rear winch directly to the meteorite.","Apply throttle and winch pull together."])
equipment_figure("sasquatch-preparation.svg","Get the conditions right before searching.",[("camp",("Camp Tool","Let time pass")),("cloud-clearing-bell",("Cloud Clearing Bell","Clear bad weather temporarily"))],["Locate the northern forest while you can read the terrain.","Wait for night; recheck the actual weather.","Look for a clear view of the subject among the trees.","Confirm the Safari Camera registration before leaving."])
(pathlib.Path(__file__).parent/"illustrations.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
print("Built",len(manifest),"original data illustrations using real game assets.")
