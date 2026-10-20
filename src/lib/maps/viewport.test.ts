import test from "node:test";
import assert from "node:assert/strict";
import {
  constrainView,
  initialView,
  mapSide,
  readProgress,
  zoomAt,
} from "./viewport";
import { locations, regions } from "../data/catalog";

test("zoom keeps a location under the cursor and constrains the image", () => {
  const size = { width: 900, height: 560 };
  const cursor = { x: 510, y: 300 };
  const previous = { ...initialView, zoom: 2 };
  const next = zoomAt(previous, size, 4, cursor.x, cursor.y);
  for (const [key, length] of [
    ["x", size.width],
    ["y", size.height],
  ] as const) {
    const before =
      previous[key] + (cursor[key] - length / 2) / mapSide(size, previous.zoom);
    const after =
      next[key] + (cursor[key] - length / 2) / mapSide(size, next.zoom);
    assert.ok(Math.abs(before - after) < 1e-10);
  }
  assert.deepEqual(
    constrainView({ x: -100, y: 200, zoom: 0 }, size),
    initialView,
  );
  const edge = constrainView({ x: -10, y: 20, zoom: 100 }, size);
  assert.equal(edge.zoom, 6);
  assert.ok(edge.x > 0 && edge.y < 1);
});

test("all published pins have calibrated coordinates on their own real area map", () => {
  const areas = regions.filter((area) => area.category === "Area");
  assert.equal(areas.length, 5);
  assert.equal(locations.length, 117);
  for (const place of locations) {
    assert.ok(areas.some((area) => area.slug === place.areaSlug));
    assert.ok(
      typeof place.x === "number" && place.x >= 0 && place.x <= 1,
      place.id,
    );
    assert.ok(
      typeof place.y === "number" && place.y >= 0 && place.y <= 1,
      place.id,
    );
    assert.ok(place.coordinateSourceUrl && place.coordinateCheckedAt);
  }
  const pavilion = locations.find(
    (place) => place.title === "Pavilion Lake Cabin",
  )!;
  assert.equal(pavilion.x, 0.23875);
  assert.equal(pavilion.y, 0.609375);
});

test("progress rejects corrupt and incompatible storage without inventing discoveries", () => {
  const allowed = new Set(["cabin", "trail"]);
  for (const value of [
    "",
    "broken",
    "null",
    '{"version":2,"found":["cabin"]}',
    '{"version":1,"found":{}}',
  ])
    assert.equal(readProgress(value, allowed).size, 0);
  assert.deepEqual(
    [
      ...readProgress(
        '{"version":1,"found":["cabin","unknown",3,"cabin","trail"]}',
        allowed,
      ),
    ],
    ["cabin", "trail"],
  );
});
