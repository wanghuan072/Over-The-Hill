import assert from "node:assert/strict";
import sitemap from "../../src/app/sitemap";
import robots from "../../src/app/robots";
import { site } from "../../src/config/site";
import { indexablePaths } from "../../src/seo/sitemap";
import { NextRequest } from "next/server";
import { proxy } from "../../src/proxy";
import { tdk } from "../../src/seo/tdk";
import { guides } from "../../src/lib/data/catalog";

const map = sitemap();
if (site.indexable) {
  assert.equal(map.length, indexablePaths.length);
  assert.equal(
    map.length,
    Object.keys(tdk).filter((path) => path !== "/search").length +
      guides.length,
  );
  for (const item of map) {
    assert.ok(item.url.startsWith("https://overthehillhub.org/"));
    assert.match(String(item.lastModified), /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!item.url.includes("#"));
    assert.ok(
      ["weekly", "monthly", "yearly"].includes(item.changeFrequency || ""),
    );
    assert.ok(
      typeof item.priority === "number" &&
        item.priority >= 0 &&
        item.priority <= 1,
    );
  }
  assert.equal(robots().sitemap, "https://overthehillhub.org/sitemap.xml");
} else {
  assert.equal(map.length, 0);
  assert.deepEqual(robots().rules, { userAgent: "*", disallow: "/" });
}
for (const path of [
  "/guides/missing",
  "/wiki/missing",
  "/vehicles/protector",
  "/maps/canada",
  "/legal/missing",
  "/updates",
  "/updates/t-shirts-and-vinyl",
  "/update/t-shirts-and-vinyl",
]) {
  const response = proxy(new NextRequest("https://overthehillhub.org" + path));
  assert.equal(response.status, 404);
}
for (const path of indexablePaths)
  assert.notEqual(
    proxy(new NextRequest("https://overthehillhub.org" + path)).status,
    404,
  );
console.log(
  `${site.indexable ? "Production" : "Preview"} sitemap, robots, dates and unknown content route checks passed.`,
);
