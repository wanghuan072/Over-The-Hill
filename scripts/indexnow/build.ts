import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID, createHash } from "node:crypto";
import config from "../../src/config/indexnow.json";
import dates from "../../src/seo/page-dates.json";
import { indexablePaths } from "../../src/seo/sitemap";
import { site } from "../../src/config/site";
import { makeManifest, validateManifest } from "./core.mjs";
import type { DateManifest } from "../content-dates";

async function main() {
  const origin = config.siteUrl;
  if (!/^[A-Za-z0-9-]{8,128}$/.test(config.key))
    throw new Error("Invalid IndexNow key format");
  if (site.url !== origin)
    throw new Error("IndexNow canonical origin differs from SITE_URL");
  if (readFileSync(`public/${config.key}.txt`, "utf8") !== config.key)
    throw new Error(
      "IndexNow verification file does not match the configured key",
    );
  const production = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";
  let previous;
  if (production && process.env.INDEXNOW_BOOTSTRAP !== "true") {
    // A fixed origin, no credentials and no redirects: never fetch an event-supplied URL.
    const response = await fetch(origin + config.manifestPath, {
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 404)
      console.log(
        "IndexNow: first manifest deployment; retaining the existing committed content dates.",
      );
    else {
      if (!response.ok)
        throw new Error(
          `Cannot inherit production history: HTTP ${response.status}`,
        );
      previous = validateManifest(await response.json(), origin);
      if (previous.deployment?.projectId !== process.env.VERCEL_PROJECT_ID)
        throw new Error("Previous manifest belongs to another Vercel project");
    }
  } else if (production)
    console.warn(
      "IndexNow: explicit first-deployment bootstrap; remove INDEXNOW_BOOTSTRAP after the first successful release.",
    );
  const manifest = makeManifest({
    origin,
    fingerprintVersion: config.fingerprintVersion,
    generatedAt: new Date().toISOString(),
    previous,
    deployment: {
      provider: process.env.VERCEL === "1" ? "vercel" : "local",
      environment: process.env.VERCEL_ENV || "local",
      indexable: production && site.indexable,
      id: process.env.VERCEL_DEPLOYMENT_ID || null,
      projectId: process.env.VERCEL_PROJECT_ID || null,
      commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
      repository:
        process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
          ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
          : null,
      buildId: randomUUID(),
    },
    entries: indexablePaths.map((path) => {
      const entry = (dates as DateManifest)[path];
      if (!entry) throw new Error(`Missing content fingerprint: ${path}`);
      return {
        path,
        canonicalUrl: origin + path,
        indexable: site.indexable,
        contentFingerprint: `sha256:${createHash("sha256")
          .update(entry.fingerprint + ":" + (entry.sharedFingerprint || ""))
          .digest("hex")}`,
        lastModified: new Date(entry.updatedAt).toISOString(),
      };
    }),
  });
  for (const entry of manifest.entries) {
    (dates as DateManifest)[entry.path].updatedAt = entry.lastModified.slice(
      0,
      10,
    );
  }
  writeFileSync(
    "src/seo/page-dates.json",
    JSON.stringify(dates, null, 2) + "\n",
  );
  writeFileSync(
    `public${config.manifestPath}`,
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(
    `IndexNow manifest: ${manifest.entries.length} routes; ${manifest.deletedUrls.length} retained deletion events; no notifications during build.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
