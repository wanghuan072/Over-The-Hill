import test from "node:test";
import assert from "node:assert/strict";
import { vehicles, entries, regions, searchIndex, guides } from "./catalog";
import { existsSync } from "node:fs";
import atlas from "@/data/maps/atlas.json";

test("release identity replaces conflicting Demo slot attributes without inventing performance", () => {
  const protector = vehicles.find((vehicle) => vehicle.slug === "protector");
  const roamer = vehicles.find((vehicle) => vehicle.slug === "roamer");
  assert.equal(protector?.specifications?.["Class"], "Trail");
  assert.equal(roamer?.specifications?.["Class"], "Wagon");
  assert.equal(roamer?.specifications?.["Country"], "United States");
  assert.equal(roamer?.specifications?.["Horsepower"], undefined);
});

test("three replacement guides use distinct illustrated topics and internal reading links", () => {
  assert.deepEqual(
    guides.map((g) => g.slug),
    ["pebbles-upgrade-order", "emerald-lake-trail-guide", "sasquatch-location"],
  );
  const figurePaths = guides.flatMap((g) =>
    g.sections.flatMap((s) => (s.image ? [s.image.src] : [])),
  );
  assert.equal(figurePaths.length, 9);
  assert.equal(new Set(figurePaths).size, 9);
  for (const path of figurePaths) assert.ok(existsSync(`public${path}`));
  for (const guide of guides) {
    assert.ok(guide.sections.length >= 8);
    assert.ok(guide.questions?.length);
    assert.ok(guide.readingMinutes);
    for (const section of guide.sections) {
      assert.ok(!JSON.stringify(section).includes("https://"));
      for (const link of section.links || [])
        assert.ok(link.href.startsWith("/"));
    }
  }
  for (const retired of [
    "beginners-guide",
    "how-to-use-the-winch",
    "multiplayer-guide",
  ])
    assert.ok(!searchIndex.some((item) => item.href === `/guides/${retired}`));
});

test("trail advice keeps Kayaks separate from the two vehicle unlocks and uses current repeat rewards", () => {
  const guide = guides.find((g) => g.slug === "emerald-lake-trail-guide")!;
  const rows = guide.sections[0].table!.rows;
  assert.equal(rows.length, 3);
  for (const trail of atlas.trails.filter(
    (t) => t.areaSlug === "emerald-lake",
  )) {
    const row = rows.find((r) => r[0] === trail.title)!;
    assert.equal(Number(row[1]), trail.points.length);
    const detail = atlas.details[trail.placeId as keyof typeof atlas.details];
    assert.equal(
      Number(row[3]),
      "repeatRewards" in detail ? detail.repeatRewards[0].count : undefined,
    );
    for (const reward of detail.rewards)
      assert.ok(row[2].includes(reward.name));
  }
  const sasquatch = guides.find((g) => g.slug === "sasquatch-location")!;
  const checks = sasquatch.sections.find((s) => s.table)!.table!.rows;
  assert.deepEqual(
    checks.find((r) => r[0] === "Weather"),
    ["Weather", "Dry"],
  );
  assert.deepEqual(
    checks.find((r) => r[0] === "Time"),
    ["Time", "Night"],
  );
});
test("the garage keeps the full roster and distinct model images", () => {
  assert.equal(vehicles.length, 21);
  for (const slug of [
    "protector",
    "burro",
    "trail-burner",
    "trailrat",
    "polyana",
  ])
    assert.ok(vehicles.some((vehicle) => vehicle.slug === slug));
  assert.equal(
    vehicles.find((vehicle) => vehicle.slug === "timberbox")?.category,
    "Workhorse",
  );
  assert.equal(
    vehicles.find((vehicle) => vehicle.slug === "burro")?.unlock,
    "Complete Hermit Trail",
  );
  const photos = vehicles.filter(
    (vehicle) =>
      vehicle.image &&
      (!vehicle.imageKind || vehicle.imageKind === "game-screenshot"),
  );
  assert.equal(photos.length, 21);
  assert.equal(
    vehicles.filter((vehicle) => vehicle.imageKind === "game-screenshot")
      .length,
    18,
  );
  assert.equal(
    vehicles.filter((vehicle) => vehicle.imageKind === "game-icon").length,
    0,
  );
  assert.equal(
    new Set(vehicles.map((vehicle) => vehicle.image)).size,
    vehicles.length,
  );
});

test("vehicle rows distinguish stock configuration from the two engine upgrades", () => {
  for (const vehicle of vehicles) {
    assert.equal(vehicle.engineStages?.length, 3);
    assert.ok(vehicle.referenceImage?.startsWith("/images/vehicles/stock/"));
    const engines = vehicle.engineStages!;
    assert.equal(engines[0].stage, "Stock");
    assert.ok(
      engines[0].torque < engines[1].torque &&
        engines[1].torque < engines[2].torque,
    );
    assert.equal(
      vehicle.specifications?.["Stock torque"],
      `${engines[0].torque} N·m`,
    );
  }
  const protector = vehicles.find((vehicle) => vehicle.slug === "protector")!;
  assert.deepEqual(
    protector.engineStages?.map((engine) => engine.torque),
    [100, 106, 112],
  );
});

test("wildlife keeps corrected area, weather and activity constraints", () => {
  const field = (slug: string, label: string) =>
    entries
      .find((entry) => entry.slug === slug)
      ?.displayFacts?.find((fact) => fact.label === label)?.value;
  assert.equal(field("flamingo", "Documented areas"), "Aurès Mountains");
  assert.equal(
    entries.find((entry) => entry.slug === "flamingo")?.listGroup,
    "Bird",
  );
  assert.equal(
    field("gray-wolf", "Documented areas"),
    "Emerald Lake · Asgard Mountain",
  );
  assert.equal(field("gray-wolf", "Active time"), "Night");
  assert.equal(field("canada-goose", "Weather"), "Dry");
  assert.equal(field("fennec-fox", "Active time"), "Daytime, Night");
});

test("upgrade budget includes every purchased tier and grip remains a coefficient", () => {
  const tiers = entries.filter(
    (entry) => entry.category === "upgrades" && entry.imageKind === "game-icon",
  );
  assert.equal(tiers.length, 16);
  assert.equal(
    tiers.reduce(
      (total, entry) =>
        total +
        Number(
          entry.displayFacts
            ?.find((fact) => fact.label === "Release menu price")
            ?.value.split(" ")[0],
        ),
      0,
    ),
    675,
  );
  assert.equal(
    entries
      .find((entry) => entry.slug === "tyres-stage-2")
      ?.displayFacts?.find((fact) => fact.label === "Grip coefficient")?.value,
    "+0.08",
  );
});

test("achievement list has 62 unique goals, six hidden entries and no item routes", () => {
  const achievements = entries.filter(
    (entry) => entry.category === "achievements",
  );
  assert.equal(achievements.length, 62);
  assert.equal(achievements.filter((entry) => entry.hidden).length, 6);
  assert.equal(new Set(achievements.map((entry) => entry.image)).size, 62);
  assert.ok(
    searchIndex.some(
      (item) => item.href === "/wiki/achievements#law-of-the-land",
    ),
  );
});
test("release conflicts retain evidence boundaries and list-only routes", () => {
  for (const slug of ["suspension-level-2", "tyres-stage-2"]) {
    const item = entries.find((entry) => entry.slug === slug);
    assert.ok(
      item?.displayFacts?.some(
        (fact) =>
          fact.label === "Release menu price" && fact.value === "25 Pebbles",
      ),
    );
    assert.ok(
      item?.playerNotes?.some(
        (note) => note.includes("June Demo") && note.includes("20 Pebbles"),
      ),
    );
  }
  assert.ok(
    !vehicles.some((vehicle) =>
      ["overlord", "buzz-wagon"].includes(vehicle.slug),
    ),
  );
  assert.equal(
    regions.filter((region) => region.category === "Area").length,
    5,
  );
  for (const [slug, cabins, trails, viewpoints] of [
    ["emerald-lake", 6, 3, 2],
    ["gimli-ridge", 9, 5, 8],
    ["asgard-mountain", 9, 5, 8],
    ["tassili-najjer-desert", 10, 5, 14],
    ["aures-mountains", 9, 5, 8],
  ] as const) {
    const area = regions.find((region) => region.slug === slug);
    assert.equal(area?.places?.length, cabins, `${slug}: cabins`);
    assert.equal(area?.trails?.length, trails, `${slug}: trails`);
    assert.equal(area?.viewpoints?.length, viewpoints, `${slug}: viewpoints`);
  }
  assert.equal(
    entries.filter((entry) => entry.imageKind === "game-model").length,
    27,
  );
  assert.ok(
    !entries.some((entry) =>
      ["balinese-tiger", "hoary-marmot"].includes(entry.slug),
    ),
  );
  assert.equal(
    entries.filter(
      (entry) =>
        entry.category === "upgrades" && entry.imageKind === "game-icon",
    ).length,
    16,
  );
  assert.equal(vehicles.filter((vehicle) => vehicle.unlock).length, 18);
  assert.equal(
    vehicles.filter((vehicle) =>
      vehicle.displayFacts?.some((fact) => fact.value === "Starting vehicle"),
    ).length,
    3,
  );
  assert.ok(
    entries
      .find((entry) => entry.slug === "black-bear")
      ?.displayFacts?.some(
        (fact) =>
          fact.label === "Documented areas" &&
          fact.value.includes("Emerald Lake"),
      ),
  );
  assert.ok(
    searchIndex.some(
      (item) =>
        item.href === "/update#october-16-update" &&
        item.searchText?.includes("meteorite"),
    ),
  );
  assert.equal(
    searchIndex.filter((item) => item.href.startsWith("/update/")).length,
    0,
  );
});
