import { test } from "node:test";
import assert from "node:assert/strict";
import { tdk } from "./tdk";
import { guides, updates } from "../lib/data/catalog";
import dates from "./page-dates.json";
import { indexablePaths } from "./sitemap";
test("published titles and descriptions meet editorial targets and are unique", () => {
  const records = [
    ...Object.values(tdk),
    ...guides.map((r) => r.seo),
    ...updates.map((r) => r.seo),
  ];
  assert.equal(new Set(records.map((r) => r.title)).size, records.length);
  assert.equal(new Set(records.map((r) => r.description)).size, records.length);
  for (const item of records) {
    assert.ok(
      item.title.length >= 40 && item.title.length <= 60,
      `${item.title}: ${item.title.length}`,
    );
    assert.ok(
      item.description.length >= 140 && item.description.length <= 160,
      `${item.title}: description ${item.description.length}`,
    );
    assert.match(item.title, /Over The Hill/);
  }
});
test("sitemap has persistent dates for every real page and no catalog detail URLs", () => {
  assert.deepEqual(Object.keys(dates).sort(), [...indexablePaths].sort());
  assert.ok(indexablePaths.includes("/guides/pebbles-upgrade-order"));
  assert.ok(indexablePaths.includes("/update"));
  assert.ok(
    indexablePaths.every(
      (path) => !path.startsWith("/updates") && !path.startsWith("/update/"),
    ),
  );
  assert.ok(
    indexablePaths.every(
      (path) =>
        !path.startsWith("/tools") &&
        !path.startsWith("/vehicles/") &&
        !path.startsWith("/maps/"),
    ),
  );
});
