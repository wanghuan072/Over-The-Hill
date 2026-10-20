import test from "node:test";
import assert from "node:assert/strict";
import { searchIndex } from "../data/catalog";
import { indexablePaths } from "../../seo/sitemap";
import { filterContent } from "./search-content";

test("search discovers body-only equipment and vehicle-system terms", () => {
  assert.ok(
    filterContent(searchIndex, "reposition", "All").some(
      (item) => item.href === "/wiki/equipment#jack",
    ),
  );
  assert.ok(
    filterContent(searchIndex, "differential", "All").some(
      (item) => item.href === "/vehicles",
    ),
  );
});
test("all query terms and category must match; clearing restores the collection", () => {
  const results = filterContent(
    searchIndex,
    "  PEBBLES upgrade ",
    "collectibles",
  );
  assert.ok(results.length > 0);
  assert.ok(results.every((item) => item.category === "collectibles"));
  assert.equal(
    filterContent(searchIndex, "impossible-no-match-123", "All").length,
    0,
  );
  assert.equal(
    filterContent(searchIndex, "", "All").length,
    searchIndex.length,
  );
});
test("catalog search uses category anchors and sitemap contains only page URLs", () => {
  const items = searchIndex.filter((item) =>
    /^\/(wiki|vehicles|maps)(?:\/|#|$)/.test(item.href),
  );
  assert.ok(items.length > 30);
  assert.ok(
    items.every((item) =>
      /^(?:\/wiki\/(equipment|collectibles|upgrades|wildlife|achievements)|\/(vehicles|maps))(?:#[a-z0-9-]+)?$/.test(
        item.href,
      ),
    ),
  );
  assert.ok(indexablePaths.every((path) => !path.includes("#")));
  assert.ok(indexablePaths.every((path) => !/^\/(vehicles|maps)\//.test(path)));
  assert.deepEqual(
    indexablePaths.filter((path) => path.startsWith("/wiki/")).sort(),
    [
      "/wiki/achievements",
      "/wiki/collectibles",
      "/wiki/equipment",
      "/wiki/upgrades",
      "/wiki/wildlife",
    ],
  );
});
