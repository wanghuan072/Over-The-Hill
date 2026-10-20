"""Curate cached public map data; never evaluate downloaded JavaScript."""
import collections
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[3]
HERE = pathlib.Path(__file__).resolve().parent


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def position(p):
    return {"x": round((p["x"] + 2000) / 4000, 7),
            "y": round((2000 - p["z"]) / 4000, 7), "elevation": p["y"]}


areas = ["emerald-lake", "gimli-ridge", "asgard-mountain",
         "tassili-n-ajjer-desert", "aures-mountains"]
db_indices = [4, 3, 2, 0, 1]
base = [p for p in load(ROOT / "src/data/maps/locations.json")
        if p["verificationStatus"] == "confirmed"]
animals = [a for a in load(ROOT / "src/data/wiki/entries.json")
           if a["category"] == "wildlife" and a["image"]]
out = {"checkedAt": "2026-10-19", "gameBuild": "25992246",
       "sources": ["https://www.maprunner.info/overthehill/emerald-lake",
                   "https://overthehilldb.com/map"],
       "points": [], "details": {}, "trails": [], "species": {}}
audit = []
reward_catalog = load(ROOT / "docs/research/catalog-2026-10-19/db-data-8.json")
matched_rewards = set()


def verify_rewards(ref):
    key = ref["poiKey"].removeprefix("mission_generic_").removeprefix("mission_recovery_")
    area, name = key.split("_", 1)
    expected_id = area + "_Reward_" + name
    normalize = lambda s: re.sub(r"[ _]", "", s).lower()
    record = next(r for r in reward_catalog if normalize(r["id"]) == normalize(expected_id))
    assert sorted((r["key"], r["count"]) for r in ref["rewards"] if not r.get("hidden")) == sorted((r["item"], r["count"]) for r in record["rewards"])
    matched_rewards.add(expected_id)


def rewards(ref):
    return [{"name": r["name"], "count": r["count"]}
            for r in ref.get("rewards", []) if not r.get("hidden")]


for source_slug, db_index in zip(areas, db_indices):
    slug = source_slug.replace("tassili-n-ajjer", "tassili-najjer")
    data = load(HERE / (source_slug + ".json"))
    db = load(HERE / f"map_areas-BnnpDztH.js-{db_index}.json")
    local = [p for p in base if p["areaSlug"] == slug]
    groups = collections.defaultdict(list)
    for layer in data["markerLayers"]:
        for marker in layer["markers"]:
            ref = data["refs"][marker["ref"]["id"]]
            kind = ref["type"]
            if kind in ["crate", "recovery"]:
                verify_rewards(ref)
            pos = position(marker["position"])
            if kind == "trail_checkpoint":
                groups[marker["ref"]["id"]].append(marker)
                continue
            if kind in ["crate", "animal"]:
                types = ["Crate"] if kind == "crate" else ["AnimalSpawner", "AlwaysAirborneAnimalSpawner"]
                assert any(m["type"] in types and
                           abs(m["pos"]["x"] - marker["position"]["x"]) < .16 and
                           abs(m["pos"]["z"] - marker["position"]["z"]) < .16
                           for m in db["markers"]), marker
            if kind in ["crate", "recovery", "animal"]:
                category = {"crate": "Crate", "recovery": "Recovery", "animal": "Wildlife"}[kind]
                point = {"id": f'{kind}-{marker["key"]}', "title": ref["name"],
                         "areaSlug": slug, "category": category, **pos}
                if kind == "animal":
                    animal = next(a for a in animals if a["title"] == ref["name"])
                    sid = animal["slug"]
                    point.update(speciesId=sid, progressId="species-" + sid)
                    out["species"][sid] = {"title": animal["title"], "image": animal["image"],
                        "rarity": ref["rarity"], "habitat": ref["habitat"],
                        "time": ref["timeOfDay"], "weather": ref["weather"],
                        "description": animal["description"], "rewards": rewards(ref)}
                else:
                    point.update(progressId=point["id"], rewards=rewards(ref))
                    if kind == "recovery":
                        point["repeatRewards"] = [{"name": r["name"], "count": r["count"]}
                                                  for r in ref.get("repeatRewards", [])]
                out["points"].append(point)
            elif kind != "meteorite":
                close = sorted(local, key=lambda p: (p["x"] - pos["x"])**2 + (p["y"] - pos["y"])**2)
                if close and abs(close[0]["x"] - pos["x"]) < .001 and abs(close[0]["y"] - pos["y"]) < .001:
                    out["details"][close[0]["id"]] = {"rewards": rewards(ref)}
    for key, markers in groups.items():
        ref = data["refs"][key]
        ordered = sorted(markers, key=lambda m: m["ref"]["order"])
        assert [m["ref"]["order"] for m in ordered] == list(range(ref["totalCheckpoints"]))
        start = position(ordered[0]["position"])
        place = min((p for p in local if p["category"] == "Challenge Trail"),
                    key=lambda p: (p["x"] - start["x"])**2 + (p["y"] - start["y"])**2)
        assert abs(place["x"] - start["x"]) < .001 and abs(place["y"] - start["y"]) < .001
        out["trails"].append({"placeId": place["id"], "areaSlug": slug,
                             "title": ref["name"], "points": [position(m["position"]) for m in ordered]})
        out["details"][place["id"]] = {"rewards": rewards(ref),
            "repeatRewards": [{"name": r["name"], "count": r["count"]} for r in ref.get("repeatRewards", [])]}
    # The dated post-patch DB import includes four additional Asgard spawn records.
    meteors = [m for m in db["markers"] if m["type"] == "MeteoriteSpawnPoint"]
    mr_meteors = [m for layer in data["markerLayers"] if layer["label"] == "Meteorite" for m in layer["markers"]]
    matched = sum(any(abs(m["pos"]["x"] - old["position"]["x"]) < .16 and
                      abs(m["pos"]["z"] - old["position"]["z"]) < .16 for m in meteors) for old in mr_meteors)
    assert matched == len(mr_meteors)
    for marker in meteors:
        out["points"].append({"id": f'meteorite-{slug}-{marker["meteoriteIndex"]}',
            "title": f'Meteorite spawn {marker["meteoriteIndex"]}', "category": "Meteorite",
            "areaSlug": slug, **position(marker["pos"])})
    audit.append({"area": slug, "meteorites": len(meteors), "independentlyMatched": matched})

assert len(out["points"]) == 1042
assert len(out["trails"]) == 23
assert len(out["species"]) == 27
assert len(matched_rewards) == 100
assert len({p["id"] for p in out["points"]}) == len(out["points"])
(ROOT / "src/data/maps/atlas.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(HERE / "verification.json").write_text(json.dumps({"meteorites": audit,
    "counts": dict(collections.Counter(p["category"] for p in out["points"])),
    "trailCheckpoints": sum(len(t["points"]) for t in out["trails"]),
    "independentlyMatchedRewardTables": len(matched_rewards)}, indent=2) + "\n", encoding="utf-8")
print("Curated", len(out["points"]), "additional pins and", len(out["trails"]), "checkpoint sequences.")
