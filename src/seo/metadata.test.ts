import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { staticMetadata } from "./metadata";
import { tdk } from "./tdk";

test("every published page has metadata and Update uses the singular canonical URL", () => {
  for (const path of Object.keys(tdk) as (keyof typeof tdk)[]) {
    const result = staticMetadata(path);
    assert.equal(result.title, tdk[path].title);
    assert.equal(result.alternates?.canonical, path);
  }
  assert.equal(staticMetadata("/update").alternates?.canonical, "/update");
  assert.throws(
    () => staticMetadata("/updates" as keyof typeof tdk),
    /Missing SEO configuration for page: \/updates/,
  );
});
function readSite(env: Record<string, string>) {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--eval",
      "import('./src/config/site.ts').then(m=>console.log(JSON.stringify((m.default||m).site)))",
    ],
    { encoding: "utf8", env: { ...process.env, ...env } },
  );
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout) as {
    url: string;
    email: string;
    indexable: boolean;
  };
}
test("the default canonical origin, support email and IndexNow origin use the corrected domain", async () => {
  const config = readSite({ SITE_URL: "", CONTACT_EMAIL: "" });
  const indexnow = await import("../config/indexnow.json");
  assert.equal(config.url, "https://overthehillhub.org");
  assert.equal(config.email, "support@overthehillhub.org");
  assert.equal(indexnow.default.siteUrl, config.url);
});
test("indexing requires production origin and explicit opt-in; preview is always blocked", () => {
  assert.equal(
    readSite({
      SITE_URL: "https://overthehillhub.org",
      SITE_INDEXABLE: "true",
      VERCEL_ENV: "",
      NODE_ENV: "development",
    }).indexable,
    false,
  );
  assert.equal(
    readSite({ SITE_URL: "", SITE_INDEXABLE: "true", VERCEL_ENV: "" })
      .indexable,
    false,
  );
  assert.equal(
    readSite({
      SITE_URL: "https://wiki.example.com",
      SITE_INDEXABLE: "true",
      VERCEL_ENV: "production",
    }).indexable,
    true,
  );
  assert.equal(
    readSite({
      SITE_URL: "https://wiki.example.com",
      SITE_INDEXABLE: "true",
      VERCEL_ENV: "preview",
    }).indexable,
    false,
  );
  assert.equal(
    readSite({
      SITE_URL: "https://wiki.example.com",
      SITE_INDEXABLE: "false",
      VERCEL_ENV: "production",
    }).indexable,
    false,
  );
});
