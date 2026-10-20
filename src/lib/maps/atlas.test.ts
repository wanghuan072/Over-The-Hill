import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { atlasPlaces, atlasTrails, atlasSpecies } from "./atlas";
import {
  clusterSpawns,
  progressIds,
  readNotes,
  measurement,
} from "./atlas-interaction";
import presentation from "@/data/maps/presentation.json";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { locations } from "../data/catalog";
import { readProgress } from "./viewport";

test("expanded atlas preserves original discoveries and separates random spawns from completion", () => {
  assert.equal(atlasPlaces.length, 1159);
  assert.equal(new Set(atlasPlaces.map((p) => p.id)).size, 1159);
  const counts = Object.fromEntries(
    ["Crate", "Recovery", "Wildlife", "Meteorite"].map((c) => [
      c,
      atlasPlaces.filter((p) => p.category === c).length,
    ]),
  );
  assert.deepEqual(counts, {
    Crate: 86,
    Recovery: 14,
    Wildlife: 730,
    Meteorite: 212,
  });
  const ids = progressIds(atlasPlaces);
  assert.equal(ids.size, 244); // 217 fixed stops + 27 species, not 1159 completion targets.
  const original = locations.map((p) => p.id);
  assert.deepEqual(
    [...readProgress(JSON.stringify({ version: 1, found: original }), ids)],
    original,
  );
  for (const p of atlasPlaces) {
    assert.ok(p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1, p.id);
    if (p.category === "Meteorite") assert.equal(p.progressId, undefined);
    if (p.speciesId) {
      assert.ok(atlasSpecies[p.speciesId]);
      assert.equal(p.progressId, `species-${p.speciesId}`);
    }
  }
  for (const a of Object.values(atlasSpecies))
    assert.ok(existsSync(`public${a.image}`), a.title);
  const elk = atlasPlaces.filter((p) => p.speciesId === "elk");
  assert.ok(elk.length > 1);
  const found = readProgress('{"version":1,"found":["species-elk"]}', ids);
  assert.ok(elk.every((p) => found.has(p.progressId!)));
});

test("every challenge has a complete ordered checkpoint sequence on its own map", () => {
  assert.equal(atlasTrails.length, 23);
  assert.equal(
    atlasTrails.reduce((n, t) => n + t.points.length, 0),
    404,
  );
  for (const t of atlasTrails) {
    const start = atlasPlaces.find((p) => p.id === t.placeId)!;
    assert.ok(start);
    assert.equal(t.areaSlug, start.areaSlug);
    assert.ok(Math.abs(t.points[0].x - start.x) < 0.001);
    assert.ok(Math.abs(t.points[0].y - start.y) < 0.001);
    for (const p of t.points)
      assert.ok(p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1);
  }
});

test("spawn clusters preserve every point and leave named stops and selection selectable", () => {
  const places = atlasPlaces.filter((p) => p.areaSlug === "emerald-lake");
  const selected = places.find((p) => p.speciesId)!;
  const groups = clusterSpawns(places, 560, 1, selected.id);
  assert.equal(
    groups.reduce((n, g) => n + g.points.length, 0),
    places.length,
  );
  assert.ok(groups.length < places.length);
  assert.equal(
    groups.find((g) => g.points.some((p) => p.id === selected.id))!.points
      .length,
    1,
  );
  for (const g of groups.filter((g) => g.points.length > 1))
    assert.ok(
      g.points.every(
        (p) =>
          p.category === g.points[0].category &&
          ["Wildlife", "Meteorite"].includes(p.category),
      ),
    );
  assert.equal(clusterSpawns(places, 3360, 6, null).length, places.length);
  for (const group of groups)
    assert.equal(new Set(group.points.map((p) => p.speciesId)).size, 1);
});

test("all five maps have unique local terrain renders and only their documented overlays", () => {
  assert.equal(presentation.length, 5);
  const images = new Set<string>();
  for (const area of presentation) {
    assert.ok(existsSync(`public${area.satellite}`));
    images.add(
      createHash("sha256")
        .update(readFileSync(`public${area.satellite}`))
        .digest("hex"),
    );
    assert.equal(
      area.hazards.length,
      ["tassili-najjer-desert", "aures-mountains"].includes(area.slug) ? 2 : 5,
    );
    for (const layer of area.hazards)
      assert.ok(existsSync(`public${layer.image}`));
  }
  assert.equal(images.size, 5);
});

test("personal notes reject invalid coordinates and duplicates; measurement uses the game's 4km area width", () => {
  const allowed = new Set(["emerald-lake"]);
  const note = {
    id: "my-note",
    areaSlug: "emerald-lake",
    x: 0.2,
    y: 0.3,
    label: "Try the lake crossing",
  };
  const payload = JSON.stringify({
    version: 1,
    notes: [
      null,
      note,
      note,
      { ...note, id: "off-map", x: 1.1 },
      { ...note, id: "unknown", areaSlug: "missing" },
    ],
  });
  assert.deepEqual(readNotes(payload, allowed), [note]);
  assert.deepEqual(readNotes('{"version":2,"notes":[]}', allowed), []);
  assert.deepEqual(readNotes("unavailable", allowed), []);
  assert.equal(measurement([]), 0);
  assert.equal(
    measurement([
      { x: 0, y: 0 },
      { x: 0.3, y: 0.4 },
    ]),
    2000,
  );
  assert.equal(
    measurement([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ]),
    8000,
  );
});
