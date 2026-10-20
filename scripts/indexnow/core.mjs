import assert from "node:assert/strict";

export function validateManifest(manifest, origin) {
  assert.equal(manifest.schemaVersion, 1, "Unsupported SEO manifest");
  assert.ok(
    typeof manifest.fingerprintVersion === "string" &&
      manifest.fingerprintVersion,
  );
  assert.equal(manifest.siteUrl, origin, "Manifest origin mismatch");
  assert.ok(
    Number.isFinite(Date.parse(manifest.generatedAt)),
    "Invalid manifest date",
  );
  assert.ok(Array.isArray(manifest.entries));
  const active = new Set();
  const seen = new Set();
  for (const entry of manifest.entries) {
    const url = new URL(entry.canonicalUrl);
    assert.equal(url.origin, origin, "Foreign canonical URL");
    assert.ok(!url.search && !url.hash && !url.username && !url.password);
    assert.equal(url.pathname, entry.path);
    assert.ok(!seen.has(url.href), "Duplicate canonical URL");
    seen.add(url.href);
    assert.equal(typeof entry.indexable, "boolean");
    assert.ok(
      entry.contentFingerprint &&
        Number.isFinite(Date.parse(entry.lastModified)),
    );
    assert.ok(
      Date.parse(entry.lastModified) <= Date.parse(manifest.generatedAt),
    );
    if (entry.indexable) active.add(url.href);
  }
  const deleted = new Set(manifest.deletedUrls || []);
  assert.equal(deleted.size, (manifest.deletedUrls || []).length);
  for (const url of deleted) {
    const parsed = new URL(url);
    assert.equal(parsed.origin, origin);
    assert.ok(
      !parsed.hash && !parsed.search && !parsed.username && !parsed.password,
    );
    assert.ok(!active.has(url), "Restored page still carries deletion");
    assert.ok(
      Number.isFinite(Date.parse(manifest.deletedAt?.[url])),
      "Missing deletion version",
    );
    assert.ok(
      Date.parse(manifest.deletedAt[url]) <= Date.parse(manifest.generatedAt),
    );
  }
  assert.deepEqual(
    Object.keys(manifest.deletedAt || {}).sort(),
    [...deleted].sort(),
  );
  return manifest;
}

// Previous means the last published production manifest, never the notification checkpoint.
export function makeManifest({
  origin,
  fingerprintVersion,
  entries,
  previous,
  deployment,
  generatedAt,
}) {
  if (previous) {
    validateManifest(previous, origin);
    assert.equal(
      previous.fingerprintVersion,
      fingerprintVersion,
      "Fingerprint migration requires an explicit baseline",
    );
    assert.ok(
      Date.parse(generatedAt) > Date.parse(previous.generatedAt),
      "A stale build cannot replace newer production history",
    );
  }
  const prior = new Map(
    (previous?.entries || []).map((entry) => [entry.canonicalUrl, entry]),
  );
  const normalized = entries
    .map((entry) => {
      const old = prior.get(entry.canonicalUrl);
      return {
        ...entry,
        lastModified:
          old?.contentFingerprint === entry.contentFingerprint
            ? old.lastModified
            : entry.lastModified,
      };
    })
    .sort((a, b) =>
      a.canonicalUrl < b.canonicalUrl
        ? -1
        : a.canonicalUrl > b.canonicalUrl
          ? 1
          : 0,
    );
  const active = new Set(
    normalized
      .filter((entry) => entry.indexable)
      .map((entry) => entry.canonicalUrl),
  );
  const deletedAt = { ...(previous?.deletedAt || {}) };
  for (const entry of previous?.entries || []) {
    if (
      entry.indexable &&
      !active.has(entry.canonicalUrl) &&
      !deletedAt[entry.canonicalUrl]
    )
      deletedAt[entry.canonicalUrl] = generatedAt;
  }
  for (const url of active) delete deletedAt[url];
  return validateManifest(
    {
      schemaVersion: 1,
      fingerprintVersion,
      siteUrl: origin,
      generatedAt,
      deployment,
      entries: normalized,
      deletedUrls: Object.keys(deletedAt).sort(),
      deletedAt,
    },
    origin,
  );
}

export function diffManifest(current, checkpoint) {
  validateManifest(current, current.siteUrl);
  if (checkpoint) {
    validateManifest(checkpoint, current.siteUrl);
    assert.equal(
      current.fingerprintVersion,
      checkpoint.fingerprintVersion,
      "Checkpoint fingerprint version mismatch",
    );
    assert.ok(
      Date.parse(current.generatedAt) >= Date.parse(checkpoint.generatedAt),
      "Historical promotion: rebuild before notifying",
    );
  }
  const old = new Map(
    (checkpoint?.entries || [])
      .filter((entry) => entry.indexable)
      .map((entry) => [entry.canonicalUrl, entry]),
  );
  const active = current.entries.filter((entry) => entry.indexable);
  const activeUrls = new Set(active.map((entry) => entry.canonicalUrl));
  const added = [],
    updated = [],
    deleted = new Set([...old.keys()].filter((url) => !activeUrls.has(url)));
  for (const entry of active) {
    const prior = old.get(entry.canonicalUrl);
    if (!prior) added.push(entry.canonicalUrl);
    else if (prior.contentFingerprint !== entry.contentFingerprint)
      updated.push(entry.canonicalUrl);
  }
  for (const [url, version] of Object.entries(current.deletedAt)) {
    if (!activeUrls.has(url) && checkpoint?.deletedAt?.[url] !== version)
      deleted.add(url);
  }
  return {
    added: added.sort(),
    updated: updated.sort(),
    deleted: [...deleted].sort(),
  };
}

export function eligibleEvent(event, context) {
  assert.ok(
    context.actions && context.repository && context.ref,
    "Submission requires the prepared GitHub workflow",
  );
  assert.equal(
    event.repository?.full_name?.toLowerCase(),
    context.repository.toLowerCase(),
    "Event repository mismatch",
  );
  assert.equal(
    context.ref,
    `refs/heads/${event.repository.default_branch}`,
    "Use the trusted default-branch workflow",
  );
  if (context.eventName === "workflow_dispatch") return true;
  assert.equal(context.eventName, "repository_dispatch");
  assert.equal(event.sender?.login, "vercel[bot]", "Untrusted event sender");
  assert.equal(event.sender?.type, "Bot");
  if (
    !["vercel.deployment.success", "vercel.deployment.promoted"].includes(
      event.action,
    )
  )
    return false;
  return (
    event.client_payload?.environment === "production" &&
    event.client_payload?.state?.type === "success"
  );
}

export function matchesDeployment(manifest, event, repository) {
  const d = manifest.deployment;
  if (
    !d?.indexable ||
    d.environment !== "production" ||
    d.provider !== "vercel" ||
    !d.id ||
    !d.projectId ||
    !d.commit
  )
    return false;
  if (d.repository?.toLowerCase() !== repository.toLowerCase()) return false;
  if (event.action) {
    const payload = event.client_payload;
    return (
      d.id === payload?.id &&
      d.projectId === payload?.project?.id &&
      d.commit === payload?.git?.sha
    );
  }
  return true;
}

export async function sendChanges({
  manifest,
  checkpoint,
  key,
  endpoint,
  fetcher = fetch,
  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  stillCurrent = async () => true,
  batchSize = 10000,
}) {
  const changes = diffManifest(manifest, checkpoint);
  const urls = [
    ...new Set([...changes.added, ...changes.updated, ...changes.deleted]),
  ];
  assert.ok(batchSize > 0 && batchSize <= 10000);
  for (let offset = 0; offset < urls.length; offset += batchSize) {
    assert.ok(
      await stillCurrent(),
      "Production changed; checkpoint not advanced",
    );
    let accepted = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetcher(endpoint, {
        method: "POST",
        redirect: "error",
        signal: AbortSignal.timeout(20000),
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: new URL(manifest.siteUrl).host,
          key,
          keyLocation: `${manifest.siteUrl}/${key}.txt`,
          urlList: urls.slice(offset, offset + batchSize),
        }),
      });
      if ([200, 202].includes(response.status)) {
        accepted = true;
        break;
      }
      if (response.status !== 429 || attempt === 2)
        throw new Error(
          `IndexNow HTTP ${response.status}; checkpoint unchanged`,
        );
      const seconds = Number(response.headers.get("retry-after"));
      await wait(
        Math.min(
          30000,
          Math.max(
            1000,
            Number.isFinite(seconds) ? seconds * 1000 : 1000 * 2 ** attempt,
          ),
        ),
      );
    }
    assert.ok(accepted);
  }
  assert.ok(
    await stillCurrent(),
    "Production changed; checkpoint not advanced",
  );
  // Caller persists this receipt only after ALL batches and the final version check succeed.
  return { manifest, changes, submitted: urls.length };
}
