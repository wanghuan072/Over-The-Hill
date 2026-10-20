import { test } from "node:test";
import assert from "node:assert/strict";
import { reconcileDates, editorialText } from "./content-dates";
test("dates persist; checks do not refresh dates; only changed and new pages advance", () => {
  const input = {
    "/maps": {
      title: "Maps",
      lastVerifiedAt: "2026-10-10",
      checkedAt: "2026-10-10",
      sources: ["https://evidence.test/old"],
    },
    "/vehicles": { title: "Vehicles" },
  };
  const initial = reconcileDates({}, input, "2026-10-10");
  assert.deepEqual(reconcileDates(initial, input, "2026-10-15"), initial);
  assert.deepEqual(
    reconcileDates(
      initial,
      {
        ...input,
        "/maps": {
          ...input["/maps"],
          lastVerifiedAt: "2026-10-15",
          checkedAt: "2026-10-15",
          sources: ["https://evidence.test/new"],
        },
      },
      "2026-10-15",
    ),
    initial,
  );
  const changed = reconcileDates(
    initial,
    {
      ...input,
      "/maps": { title: "Canada and Algeria" },
      "/new": { title: "New" },
    },
    "2026-10-15",
  );
  assert.equal(changed["/vehicles"].updatedAt, "2026-10-10");
  assert.equal(changed["/maps"].updatedAt, "2026-10-15");
  assert.equal(changed["/new"].updatedAt, "2026-10-15");
});
test("formatting and CSS class changes do not count as editorial updates", () => {
  assert.deepEqual(
    editorialText("<h1 className={s.old}>Canada and Algeria</h1>"),
    editorialText("<h1 className={s.new}> Canada and Algeria </h1>"),
  );
  assert.notDeepEqual(
    editorialText("<h1>Canada</h1>"),
    editorialText("<h1>Canada and Algeria</h1>"),
  );
});

test("shared-content baseline preserves existing dates; later shared edits update affected pages", () => {
  const inputs = { "/": { title: "Home" }, "/guides": { title: "Guides" } };
  const old = reconcileDates({}, inputs, "2026-10-01");
  const baseline = reconcileDates(old, inputs, "2026-10-20", "shared-v1");
  assert.equal(baseline["/"].updatedAt, "2026-10-01");
  assert.deepEqual(
    reconcileDates(baseline, inputs, "2026-10-21", "shared-v1"),
    baseline,
  );
  const changed = reconcileDates(baseline, inputs, "2026-10-22", "shared-v2");
  assert.equal(changed["/"].updatedAt, "2026-10-22");
  assert.equal(changed["/guides"].updatedAt, "2026-10-22");
});
test("optional illustration copy only affects articles that render it", () => {
  const plain = "<section><h2>Story</h2><p>Existing text</p></section>";
  const enhanced = plain.replace(
    "</section>",
    "{section.image && <figure><figcaption>Image note</figcaption></figure>}</section>",
  );
  assert.deepEqual(
    editorialText(enhanced, ["section.image"]),
    editorialText(plain),
  );
  assert.notDeepEqual(editorialText(enhanced), editorialText(plain));
});
