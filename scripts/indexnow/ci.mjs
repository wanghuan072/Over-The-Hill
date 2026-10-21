import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
import {
  eligibleEvent,
  matchesDeployment,
  validateManifest,
  sendChanges,
  diffManifest,
  checkpointPrefix,
} from "./core.mjs";

const config = JSON.parse(
  readFileSync(
    new URL("../../src/config/indexnow.json", import.meta.url),
    "utf8",
  ),
);
const origin = config.siteUrl;
const directory = ".indexnow";
const context = {
  actions: process.env.GITHUB_ACTIONS === "true",
  eventName: process.env.GITHUB_EVENT_NAME,
  repository: process.env.GITHUB_REPOSITORY,
  ref: process.env.GITHUB_REF,
};
const event = process.env.GITHUB_EVENT_PATH
  ? JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"))
  : null;

async function publicManifest() {
  const response = await fetch(origin + config.manifestPath, {
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  assert.ok(
    response.ok,
    `Production manifest HTTP ${response.status}; no submission`,
  );
  return validateManifest(await response.json(), origin);
}
function output(key, value) {
  assert.ok(!String(value).includes("\n"));
  if (process.env.GITHUB_OUTPUT)
    writeFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`, {
      flag: "a",
    });
}
async function github(path) {
  assert.ok(
    process.env.GH_TOKEN,
    "Use the workflow's short-lived github.token",
  );
  const response = await fetch(
    `https://api.github.com/repos/${context.repository}/${path}`,
    {
      redirect: "error",
      signal: AbortSignal.timeout(20000),
      headers: {
        Authorization: `Bearer ${process.env.GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  assert.ok(
    response.ok,
    `GitHub artifact lookup HTTP ${response.status}; history must not be silently discarded`,
  );
  return response.json();
}
async function latestCheckpoint(prefix, branch) {
  const candidates = [];
  for (let page = 1; ; page++) {
    assert.ok(
      page <= 20,
      "Too many artifact pages; inspect history before retrying",
    );
    const result = await github(`actions/artifacts?per_page=100&page=${page}`);
    candidates.push(
      ...result.artifacts.filter(
        (item) => !item.expired && item.name.startsWith(prefix),
      ),
    );
    if (result.artifacts.length < 100) break;
  }
  candidates.sort((a, b) => b.created_at.localeCompare(a.created_at));
  for (const artifact of candidates) {
    const run = await github(`actions/runs/${artifact.workflow_run.id}`);
    if (
      run.path !== ".github/workflows/indexnow.yml" ||
      run.head_branch !== branch ||
      run.status !== "completed" ||
      run.conclusion !== "success"
    )
      continue;
    return { name: artifact.name, runId: run.id };
  }
  return null;
}

async function prepare() {
  if (!eligibleEvent(event, context)) {
    output("ready", "false");
    console.log("Skipped: not a successful production event.");
    return;
  }
  const manifest = await publicManifest();
  if (
    !matchesDeployment(
      manifest,
      context.eventName === "repository_dispatch" ? event : {},
      context.repository,
    )
  ) {
    output("ready", "false");
    console.log(
      "Skipped: Preview, unrelated project or a deployment superseded on the fixed production domain.",
    );
    return;
  }
  const prefix = checkpointPrefix(manifest.deployment.projectId, origin);
  const checkpoint = await latestCheckpoint(
    prefix,
    event.repository.default_branch,
  );
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    `${directory}/current.json`,
    JSON.stringify(manifest, null, 2) + "\n",
  );
  output("ready", "true");
  output(
    "artifact",
    `${prefix}${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`,
  );
  output("previous_name", checkpoint?.name || "");
  output("previous_run", checkpoint?.runId || "");
  if (!checkpoint)
    console.log(
      "No retained successful checkpoint: full submission plus retained deletion events; sitemap dates are unchanged.",
    );
}

async function notify() {
  assert.ok(eligibleEvent(event, context), "Not an eligible production event");
  const current = validateManifest(
    JSON.parse(readFileSync(`${directory}/current.json`, "utf8")),
    origin,
  );
  assert.ok(
    matchesDeployment(
      current,
      context.eventName === "repository_dispatch" ? event : {},
      context.repository,
    ),
  );
  const checkpointFile = `${directory}/previous/checkpoint.json`;
  const checkpoint = existsSync(checkpointFile)
    ? JSON.parse(readFileSync(checkpointFile, "utf8")).manifest
    : null;
  if (checkpoint)
    assert.equal(
      checkpoint.deployment.projectId,
      current.deployment.projectId,
      "Foreign project checkpoint",
    );
  const stillCurrent = async () => {
    const live = await publicManifest();
    return (
      matchesDeployment(live, {}, context.repository) &&
      live.deployment.buildId === current.deployment.buildId &&
      live.deployment.id === current.deployment.id
    );
  };
  assert.ok(
    await stillCurrent(),
    "Production was superseded before notification",
  );
  const verification = await fetch(`${origin}/${config.key}.txt`, {
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(
    verification.status,
    200,
    "Publish the verification file before submitting",
  );
  assert.match(verification.headers.get("content-type") || "", /^text\/plain/i);
  assert.equal(await verification.text(), config.key, "Published key mismatch");
  // Validate retired addresses on the fixed canonical origin without following redirects.
  const retired = diffManifest(current, checkpoint).deleted;
  for (const url of retired) {
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    if ([404, 410].includes(response.status)) continue;
    if (
      [301, 308].includes(response.status) &&
      response.headers.get("location")
    )
      continue;
    if (
      response.status === 200 &&
      (/noindex/i.test(response.headers.get("x-robots-tag") || "") ||
        /<meta[^>]+(?:name=["']robots["'][^>]+content=["'][^"']*noindex|content=["'][^"']*noindex[^>]+name=["']robots["'])/i.test(
          await response.text(),
        ))
    )
      continue;
    throw new Error(
      `Retired URL is not 404/410, permanently redirected or noindex: ${url}`,
    );
  }
  const receipt = await sendChanges({
    manifest: current,
    checkpoint,
    key: config.key,
    endpoint: config.endpoint,
    stillCurrent,
  });
  writeFileSync(
    `${directory}/checkpoint.json`,
    JSON.stringify(receipt, null, 2) + "\n",
  );
  console.log(
    `IndexNow accepted ${receipt.submitted} changed URLs. 200/202 acknowledge receipt, not indexing.`,
  );
}

if (process.argv[2] === "prepare") await prepare();
else if (process.argv[2] === "notify") await notify();
else if (process.argv[2] === "dry-run") {
  const { diffManifest } = await import("./core.mjs");
  const current = JSON.parse(
    readFileSync(`public${config.manifestPath}`, "utf8"),
  );
  console.log(
    JSON.stringify(
      {
        dryRun: true,
        productionEligible: current.deployment.indexable,
        changes: diffManifest(current, null),
        note: "No network request sent. Preview/local builds never submit.",
      },
      null,
      2,
    ),
  );
} else throw new Error("Use prepare, notify or dry-run");
