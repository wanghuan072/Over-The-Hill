import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import vehicleImages from "../../docs/vehicle-image-evidence.json";
import releaseAssets from "../../docs/research/launch-2026-10-16/asset-candidates.json";
import reviewedAssets from "../../docs/research/review-2026-10-19/assets.json";
import gameplayPhotos from "../../docs/research/vehicle-photos-2026-10-19/images.json";
import catalogAssets from "../../docs/research/catalog-2026-10-19/assets.json";
import assert from "node:assert/strict";
import {
  guides,
  entries,
  regions,
  updates,
  vehicles,
  vehicleReference,
  releaseNotes,
  locations,
  searchIndex,
} from "../../src/lib/data/catalog";
import { indexablePaths } from "../../src/seo/sitemap";
import { sources, recordSources } from "../../src/lib/data/sources";
const records = [
  ...guides,
  ...entries,
  ...regions,
  ...updates,
  ...vehicles,
  vehicleReference,
  releaseNotes,
];
assert.equal(
  guides.length,
  3,
  "The editorial scope retains exactly three guides",
);
assert.equal(
  new Set(sources.map((source) => source.id)).size,
  sources.length,
  "Duplicate source ID",
);
assert.equal(
  new Set(records.map((record) => record.id)).size,
  records.length,
  "Duplicate content ID",
);
assert.equal(
  new Set(records.map((record) => record.seo.title)).size,
  records.length,
  "Duplicate detail title",
);
assert.equal(
  new Set(records.map((record) => record.seo.description)).size,
  records.length,
  "Duplicate detail description",
);
const routes = new Set([...indexablePaths, "/search"]);
assert.equal(catalogAssets.length, 110);
assert.equal(new Set(catalogAssets.map((asset) => asset.path)).size, 110);
assert.equal(new Set(catalogAssets.map((asset) => asset.sha256)).size, 110);
for (const asset of catalogAssets) {
  assert.ok(asset.width >= 256 && asset.height >= 256);
  assert.equal(
    createHash("sha256")
      .update(readFileSync(`public${asset.path}`))
      .digest("hex"),
    asset.sha256,
    asset.path,
  );
}
for (const vehicle of vehicles) {
  assert.ok(
    catalogAssets.some(
      (asset) =>
        asset.kind === "vehicles" && asset.path === vehicle.referenceImage,
    ),
  );
}
assert.equal(
  new Set(searchIndex.map((i) => i.href)).size,
  searchIndex.length,
  "Duplicate public URL",
);
for (const record of records) {
  assert.ok(record.title && record.description && record.sections.length);
  assert.equal(record.verificationStatus, "confirmed");
  assert.ok(/^https:\/\//.test(record.sourceUrl));
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(record.lastVerifiedAt));
  if (record.image) {
    assert.ok(
      existsSync(`public${record.image}`),
      `Missing image ${record.image}`,
    );
    assert.ok(record.imageAlt);
  } else {
    assert.ok(
      [...vehicles, ...entries].some((item) => item.id === record.id),
      `Unexpected missing page image: ${record.slug}`,
    );
    assert.equal(record.imageAlt, "");
  }
  for (const fact of record.facts || []) {
    assert.ok(
      (record.sourceIds || []).includes(fact.sourceId),
      `Unlisted fact source ${record.slug}: ${fact.sourceId}`,
    );
    const source = sources.find((source) => source.id === fact.sourceId);
    assert.ok(source);
    if (fact.timestampSeconds !== undefined)
      assert.ok(
        fact.timestampSeconds >= 0 &&
          fact.timestampSeconds < (source.durationSeconds || Infinity),
        `Invalid source moment ${record.slug}`,
      );
  }
  const sourceIds = new Set(record.sourceIds || []);
  for (const id of sourceIds)
    assert.ok(
      sources.some((source) => source.id === id),
      `Unknown source ${id}`,
    );
  for (const section of record.sections) {
    if (section.image) {
      assert.ok(section.image.src.startsWith("/images/"));
      assert.ok(existsSync(`public${section.image.src}`), section.image.src);
      assert.ok(section.image.alt && section.image.caption);
    }
    for (const link of section.links || []) {
      assert.ok(link.href.startsWith("/"), "Guide links stay on site");
      assert.ok(
        routes.has(new URL(link.href, "https://overthehillhub.com").pathname),
        `Broken section link ${link.href}`,
      );
    }
    for (const id of section.sourceIds || [])
      assert.ok(
        sourceIds.has(id),
        `Unlisted section source ${id} in ${record.slug}`,
      );
    if (section.table) {
      assert.ok(section.table.headers.length >= 2);
      for (const row of section.table.rows)
        assert.equal(
          row.length,
          section.table.headers.length,
          `Malformed table ${record.slug}`,
        );
    }
  }
  assert.ok(recordSources(record).length);
  for (const href of record.related)
    assert.ok(routes.has(href.split("#")[0]), `Broken relation ${href}`);
}
for (const record of [...vehicles, ...entries, ...regions]) {
  assert.ok(
    Array.isArray(record.playerNotes),
    `Missing notes field: ${record.slug}`,
  );
  if (record.image)
    assert.ok(/^\/images\/(game|vehicles|wiki|maps)\//.test(record.image));
  if (
    record.imageKind === "game-icon" ||
    record.imageKind === "game-model" ||
    record.image.startsWith("/images/maps/release/")
  ) {
    const evidence = [
      ...releaseAssets,
      ...reviewedAssets,
      ...catalogAssets,
    ].find((image) => image.path === record.image);
    assert.ok(evidence, `Missing release image evidence: ${record.id}`);
    assert.equal(
      createHash("sha256")
        .update(readFileSync(`public${record.image}`))
        .digest("hex"),
      evidence.sha256,
    );
  }
  if (record.imageKind === "garage-icon") {
    const evidence = vehicleImages.find(
      (image) => image.vehicleId === record.id,
    );
    assert.ok(evidence, `Missing image identity evidence: ${record.id}`);
    assert.equal(record.image, evidence.path);
    assert.ok(record.sourceIds?.includes(evidence.sourceId));
    assert.equal(record.imageLabel, "Garage icon");
    assert.equal(
      createHash("sha256")
        .update(readFileSync(`public${record.image}`))
        .digest("hex"),
      evidence.sha256,
    );
  }
  if (record.imageKind === "game-screenshot") {
    const evidence = gameplayPhotos.find(
      (photo) => photo.vehicleId === record.id,
    );
    assert.ok(evidence, `Missing gameplay identity evidence: ${record.id}`);
    assert.equal(record.image, evidence.path);
    assert.ok(record.sourceIds?.includes(evidence.sourceId));
    assert.ok(
      evidence.originalSize[0] >= 640 && evidence.originalSize[1] >= 360,
    );
    assert.ok(
      evidence.size[0] <= evidence.originalSize[0],
      "Do not upscale player screenshots",
    );
    assert.equal(
      createHash("sha256")
        .update(readFileSync(`public${record.image}`))
        .digest("hex"),
      evidence.sha256,
    );
  }
}
for (const field of ["sha256", "sourceSha256", "dhash"] as const) {
  assert.equal(
    new Set(gameplayPhotos.map((photo) => photo[field])).size,
    gameplayPhotos.length,
    `Repeated gameplay image: ${field}`,
  );
}
assert.equal(
  new Set(vehicleImages.map((image) => image.sha256)).size,
  vehicleImages.length,
  "Duplicate vehicle capture bytes",
);
assert.equal(
  vehicles.find((vehicle) => vehicle.id === "mammoth")?.category,
  "Expedition",
  "Mammoth belongs to the release Expedition section",
);
for (const collection of [vehicles, entries]) {
  const photos = collection.map((record) => record.image).filter(Boolean);
  assert.equal(new Set(photos).size, photos.length, "Repeated catalog image");
}
for (const p of locations) {
  if (p.x !== undefined || p.y !== undefined)
    assert.ok(
      typeof p.x === "number" &&
        typeof p.y === "number" &&
        p.x >= 0 &&
        p.x <= 1 &&
        p.y >= 0 &&
        p.y <= 1,
      `Invalid normalized position ${p.id}`,
    );
  assert.ok(regions.some((r) => r.slug === p.region));
  assert.ok(routes.has(p.href.split("#")[0]));
  assert.ok(p.sourceUrl);
}
assert.equal(
  new Set(locations.map((p) => p.id)).size,
  locations.length,
  "Duplicate discovery IDs",
);
console.log(
  `Content audit passed: ${records.length} records, ${routes.size} routes, ${locations.length} verified locations.`,
);
