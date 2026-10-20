"""One-off reconciliation of existing named places, not a catalog synchronizer."""
import json, re, unicodedata, math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
def read(path): return json.loads(path.read_text(encoding="utf8"))
def norm(text):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower())

rows = read(ROOT / "src/data/maps/locations.json")
areas = read(ROOT / "src/data/maps/regions.json")
proof = []
aliases = {"Djebel Rahmani Trail": "Djebel Rahmani Ascent", "Tunnel to the Aures Mountain": "Tunnel to the Aurès Mountains"}
for slug, rawslug, country, layer in [
    ("emerald-lake", "emerald-lake", "canada", 836),
    ("gimli-ridge", "gimli-ridge", "canada", 837),
    ("asgard-mountain", "asgard-mountain", "canada", 838),
    ("tassili-najjer-desert", "tassili-n-ajjer-desert", "algeria", 839),
    ("aures-mountains", "aures-mountains", "algeria", 840),
]:
    data = read(HERE / f"{rawslug}.json")
    assert data["mapSize"]["x"] == data["mapSize"]["z"] == 4000
    candidates = [(group["label"], data["refs"][mark["ref"]["id"]], mark) for group in data["markerLayers"]
        if group["label"] in ["Cabin", "Scenic Point", "Challenge trail", "Mechanic", "Portal"]
        for mark in group["markers"] if not mark["ref"].get("order")]
    gg = [f["properties"] for f in read(ROOT / f"docs/research/review-2026-10-19/{country}-markers.json")["markers"]["features"] if layer in f["properties"]["layerIds"]]
    evidence = []
    for row in rows:
        if row.get("areaSlug") != slug or row["verificationStatus"] != "confirmed": continue
        title = aliases.get(row["title"], row["title"])
        matches = [(label, ref, mark) for label, ref, mark in candidates if norm(ref["name"]) == norm(title) or row["category"] == "Mechanic" and label == "Mechanic"]
        assert len(matches) == 1, (row["id"], title, len(matches))
        label, ref, mark = matches[0]
        g = [f for f in gg if norm(f.get("displayTitle", "")) == norm(row["title"]) or str(f.get("item", {}).get("id")) == row["id"].split("-")[-1] or row["category"] == "Mechanic" and "gunther" in norm(f.get("displayTitle", ""))]
        assert len(g) == 1, (row["id"], "independent match", len(g))
        pos = mark["position"]
        row.update(x=round((pos["x"] + 2000) / 4000, 7), y=round((2000 - pos["z"]) / 4000, 7), elevation=pos["y"], coordinateSourceUrl=f"https://www.maprunner.info/overthehill/{rawslug}", coordinateCheckedAt="2026-10-19")
        assert 0 <= row["x"] <= 1 and 0 <= row["y"] <= 1
        evidence.append({"id": row["id"], "world": pos, "reference": mark["ref"]["id"], "independentMarkerId": g[0]["id"], "independentPixel": g[0]["origPoints"][0]})
    # Independently curated manual pins must agree spatially with game positions.
    def fit(axis, coord):
        xs = [e["world"][axis] for e in evidence]; ys = [e["independentPixel"][coord] for e in evidence]
        mx = sum(xs)/len(xs); my = sum(ys)/len(ys)
        scale = sum((x-mx)*(y-my) for x,y in zip(xs,ys))/sum((x-mx)**2 for x in xs)
        offset = my-scale*mx
        return scale, offset
    sx, ox = fit("x", 0); sz, oz = fit("z", 1)
    assert sx > 0 and sz < 0
    for e in evidence:
        e["crossCheckErrorMetres"] = round(math.hypot((e["independentPixel"][0]-ox)/sx-e["world"]["x"], (e["independentPixel"][1]-oz)/sz-e["world"]["z"]), 2)
    print(slug, len(evidence), "max discrepancy (m)", max(e["crossCheckErrorMetres"] for e in evidence))
    proof.append({"areaSlug": slug, "worldSize": 4000, "projection": {"x": "(world.x + 2000) / 4000", "y": "(2000 - world.z) / 4000"}, "independentProjection": {"scaleX": sx, "offsetX": ox, "scaleZ": sz, "offsetZ": oz}, "locations": evidence})

(HERE / "coordinate-verification.json").write_text(json.dumps(proof, ensure_ascii=False, indent=2)+"\n", encoding="utf8")
(ROOT / "src/data/maps/locations.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2)+"\n", encoding="utf8")
