import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  makeManifest,
  diffManifest,
  validateManifest,
  eligibleEvent,
  matchesDeployment,
  sendChanges,
} from "./core.mjs";

const origin = "https://overthehillhub.com";
const deployment = {
  provider: "vercel",
  environment: "production",
  indexable: true,
  projectId: "prj_test",
  id: "dpl_test",
  commit: "abc",
  repository: "owner/site",
  buildId: "v1",
};
const time = (day) => `2026-10-${String(day).padStart(2, "0")}T12:00:00.000Z`;
const entry = (path, fingerprint = "a", date = 1, indexable = true) => ({
  path,
  canonicalUrl: origin + path,
  indexable,
  contentFingerprint: fingerprint,
  lastModified: time(date),
});
const build = (entries, previous, day = 10) =>
  makeManifest({
    origin,
    fingerprintVersion: "site-editorial-v1",
    entries,
    previous,
    deployment,
    generatedAt: time(day),
  });
const context = {
  actions: true,
  eventName: "repository_dispatch",
  repository: "owner/site",
  ref: "refs/heads/trunk",
};
const event = () => ({
  repository: { full_name: "owner/site", default_branch: "trunk" },
  sender: { login: "vercel[bot]", type: "Bot" },
  action: "vercel.deployment.success",
  client_payload: {
    environment: "production",
    state: { type: "success" },
    id: "dpl_test",
    project: { id: "prj_test" },
    git: { sha: "abc" },
    url: "https://untrusted.invalid",
  },
});

test("first publication, unchanged dates, independent edit, rename and noindex", () => {
  const a = build([entry("/"), entry("/guides")]);
  assert.deepEqual(diffManifest(a, null).added, [
    origin + "/",
    origin + "/guides",
  ]);
  const b = build(
    [entry("/", "a", 11), entry("/guides", "b", 11), entry("/new", "c", 11)],
    a,
    11,
  );
  assert.equal(
    b.entries[0].lastModified,
    time(1),
    "Unchanged content keeps published lastmod",
  );
  assert.deepEqual(diffManifest(b, a), {
    added: [origin + "/new"],
    updated: [origin + "/guides"],
    deleted: [],
  });
  const c = build(
    [entry("/"), entry("/renamed", "b", 12), entry("/new", "c", 11, false)],
    b,
    12,
  );
  assert.deepEqual(diffManifest(c, b).deleted, [
    origin + "/guides",
    origin + "/new",
  ]);
  assert.ok(!c.deletedUrls.includes(origin + "/"));
});

test("published-but-unacknowledged add then delete survives later unchanged builds", () => {
  const checkpoint = build([entry("/")]);
  const added = build([entry("/"), entry("/brief", "b", 11)], checkpoint, 11);
  const deleted = build([entry("/")], added, 12);
  const later = build([entry("/")], deleted, 13);
  assert.deepEqual(diffManifest(later, checkpoint).deleted, [
    origin + "/brief",
  ]);
  assert.equal(later.deletedAt[origin + "/brief"], time(12));
});

test("restoration removes old deletion; deleting the same URL again creates a fresh event", () => {
  const first = build([entry("/"), entry("/again")]);
  const removed = build([entry("/")], first, 11);
  const restored = build([entry("/"), entry("/again")], removed, 12);
  assert.equal(restored.deletedAt[origin + "/again"], undefined);
  assert.deepEqual(diffManifest(restored, removed).deleted, []);
  const removedAgain = build([entry("/")], restored, 13);
  assert.deepEqual(diffManifest(removedAgain, removed).deleted, [
    origin + "/again",
  ]);
  assert.equal(removedAgain.deletedAt[origin + "/again"], time(13));
});

test("expired checkpoints re-submit current pages and retained deletions without changing dates", () => {
  const first = build([entry("/"), entry("/old")]);
  const current = build([entry("/")], first, 11);
  assert.deepEqual(diffManifest(current, null), {
    added: [origin + "/"],
    updated: [],
    deleted: [origin + "/old"],
  });
  assert.equal(current.entries[0].lastModified, time(1));
});

test("same-day edits are detected from fingerprints, preserving existing day-precision lastmod", () => {
  const first = build([entry("/", "a", 1)]);
  const edited = build([entry("/", "b", 1)], first, 11);
  assert.deepEqual(diffManifest(edited, first).updated, [origin + "/"]);
});

test("foreign URLs, future dates, stale history, versions and conflicting deletions are rejected", () => {
  const current = build([entry("/")]);
  assert.throws(() =>
    validateManifest(
      {
        ...current,
        entries: [
          { ...entry("/"), canonicalUrl: "https://elsewhere.invalid/" },
        ],
      },
      origin,
    ),
  );
  assert.throws(() => build([entry("/", "a", 20)], null));
  assert.throws(() => build([entry("/")], current, 9));
  assert.throws(() =>
    makeManifest({
      origin,
      fingerprintVersion: "other",
      entries: [],
      previous: current,
      deployment,
      generatedAt: time(11),
    }),
  );
  assert.throws(() =>
    validateManifest(
      {
        ...current,
        deletedUrls: [origin + "/"],
        deletedAt: { [origin + "/"]: time(2) },
      },
      origin,
    ),
  );
  assert.throws(
    () => diffManifest(current, build([entry("/")], current, 11)),
    /Historical promotion/,
  );
});

test("only trusted production success/promoted events or default-branch manual retries qualify", () => {
  assert.equal(eligibleEvent(event(), context), true);
  assert.equal(
    eligibleEvent(
      { ...event(), action: "vercel.deployment.promoted" },
      context,
    ),
    true,
  );
  assert.equal(
    eligibleEvent({ ...event(), action: "vercel.deployment.error" }, context),
    false,
  );
  const preview = event();
  preview.client_payload.environment = "preview";
  assert.equal(eligibleEvent(preview, context), false);
  const failed = event();
  failed.client_payload.state.type = "error";
  assert.equal(eligibleEvent(failed, context), false);
  assert.throws(() => eligibleEvent(event(), { ...context, actions: false }));
  assert.throws(() =>
    eligibleEvent(
      { ...event(), sender: { login: "someone", type: "User" } },
      context,
    ),
  );
  assert.throws(() =>
    eligibleEvent(event(), { ...context, repository: "other/site" }),
  );
  assert.throws(() =>
    eligibleEvent(event(), { ...context, ref: "refs/heads/other" }),
  );
  assert.equal(
    eligibleEvent(event(), { ...context, eventName: "workflow_dispatch" }),
    true,
  );
});

test("deployment identity is checked against the fixed published manifest, never payload URL", () => {
  const current = build([entry("/")]);
  assert.equal(matchesDeployment(current, event(), "owner/site"), true);
  const other = event();
  other.client_payload.id = "dpl_older";
  assert.equal(matchesDeployment(current, other, "owner/site"), false);
  assert.equal(matchesDeployment(current, event(), "other/site"), false);
  assert.equal(
    matchesDeployment(
      { ...current, deployment: { ...deployment, indexable: false } },
      event(),
      "owner/site",
    ),
    false,
  );
});

test("all batches must succeed; partial failure leaves the old checkpoint intact and retries every change", async () => {
  const current = build([entry("/"), entry("/a"), entry("/b")]);
  const before = JSON.stringify(current);
  const requests = [];
  await assert.rejects(
    sendChanges({
      manifest: current,
      checkpoint: null,
      key: "a".repeat(32),
      endpoint: "https://api.indexnow.org/indexnow",
      batchSize: 2,
      fetcher: async (_, options) => {
        requests.push(JSON.parse(options.body));
        return new Response(null, {
          status: requests.length === 1 ? 200 : 500,
        });
      },
    }),
    /HTTP 500/,
  );
  assert.equal(JSON.stringify(current), before);
  const retry = [];
  const receipt = await sendChanges({
    manifest: current,
    checkpoint: null,
    key: "a".repeat(32),
    endpoint: "https://api.indexnow.org/indexnow",
    batchSize: 2,
    fetcher: async (_, options) => {
      retry.push(JSON.parse(options.body));
      return new Response(null, { status: 202 });
    },
  });
  assert.equal(receipt.submitted, 3);
  assert.equal(retry[0].keyLocation, origin + "/" + "a".repeat(32) + ".txt");
  assert.equal(retry.flatMap((batch) => batch.urlList).length, 3);
});

test("429 retries are bounded; other failures and superseded deployments cannot confirm a receipt", async () => {
  const current = build([entry("/")]);
  let calls = 0;
  const waits = [];
  await assert.rejects(
    sendChanges({
      manifest: current,
      checkpoint: null,
      key: "a".repeat(32),
      endpoint: "mock",
      wait: async (ms) => waits.push(ms),
      fetcher: async () => {
        calls++;
        return new Response(null, {
          status: 429,
          headers: { "retry-after": "999" },
        });
      },
    }),
    /HTTP 429/,
  );
  assert.equal(calls, 3);
  assert.deepEqual(waits, [30000, 30000]);
  let checks = 0;
  await assert.rejects(
    sendChanges({
      manifest: current,
      checkpoint: null,
      key: "a".repeat(32),
      endpoint: "mock",
      stillCurrent: async () => ++checks === 1,
      fetcher: async () => new Response(null, { status: 200 }),
    }),
    /Production changed/,
  );
});

test("local setup has one stable UTF-8 key file and safe workflow triggers without custom Secrets", () => {
  const config = JSON.parse(readFileSync("src/config/indexnow.json", "utf8"));
  assert.match(config.key, /^[a-z0-9-]{8,128}$/i);
  assert.equal(readFileSync(`public/${config.key}.txt`, "utf8"), config.key);
  const workflow = readFileSync(".github/workflows/indexnow.yml", "utf8");
  assert.ok(!workflow.includes("secrets."));
  assert.ok(!workflow.includes("postbuild"));
  assert.ok(workflow.includes("cancel-in-progress: false"));
  assert.ok(workflow.includes("retention-days: 90"));
});
