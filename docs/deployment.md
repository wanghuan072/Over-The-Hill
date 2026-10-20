# Local preview and Vercel release

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` if needed. Use `SITE_URL=https://overthehillhub.com` for canonical URLs and keep `SITE_INDEXABLE=false` while reviewing.
3. Start a local server only when explicitly wanted. This revision was verified without starting one.
4. Run `npm run check`, `npm test`, `npm run build`, and the offline browser audits described in `docs/content-and-seo.md`. The separate `test:e2e` command can start a server.

Vercel configuration: Next.js framework preset, build command `npm run build`, default Next.js output directory. No database, authentication, API keys or background service is required. This work does not create a remote repository or deploy the site.

Set `SITE_URL` to your real HTTPS production origin without a path, set `CONTACT_EMAIL` to the operator's address, and set `SITE_INDEXABLE=true` only after reviewing content, imagery and availability. These settings are evaluated at build time: rebuild after changing them. Never enter an illustrative domain or developer support email as your own identity.

Vercel preview deployments are always noindex and robots-blocked, even if production environment values are inherited. With indexing disabled, sitemap.xml contains no public entries. With indexing enabled, sitemap.xml lists substantive published pages only; search and preparing tools remain excluded. Production metadata uses SITE_URL for canonical and social URLs. robots.txt points to the production sitemap. A localhost URL never enables indexing.

Check the deployed homepage, one guide, all menu destinations, static images, an invalid detail URL (404), canonical URLs, sitemap.xml and robots.txt. There is no analytics or advertisement integration, so those integrations have not been tested. The site uses original illustrations, publisher press images and third-party game models/map renders. Check docs/assets.md and the image manifests; third-party provenance does not establish redistribution permission. Confirm reuse rights before public launch.

Production values: `SITE_URL=https://overthehillhub.com`, `CONTACT_EMAIL=support@overthehillhub.com`, and `SITE_INDEXABLE=true` on the production deployment only. Preserve `src/seo/page-dates.json` across builds. Run `npm run content:dates` after editorial edits; the build runs it automatically as well. See `docs/content-and-seo.md` for date dependencies, policy maintenance and verification.


## IndexNow after publication

The local integration is prepared for a GitHub-connected Vercel project. This checkout currently has no Git repository, remote, Vercel project link or observed production deployment event. No workflow has been uploaded or enabled remotely. Do not describe the first real submission as verified until an actual production publication completes.

`src/config/indexnow.json` contains the fixed canonical origin and one generated public IndexNow key. Its matching root-level UTF-8 file is in `public/`. Neither value is a Bing API credential, and no custom Actions Secret is required. Keep the configured key and file together; do not generate a fresh key on each build.

`npm run build` first preserves content dates and generates `public/seo-manifest.json`. This file is a build artifact, not a second route database: its page list comes from `indexablePaths`, including the three published guide slugs. It contains content fingerprints, original page dates, public Vercel deployment identifiers and retained deletion events. The manifest and key are noindex infrastructure files, not sitemap entries. No IndexNow request is made by the build, a Preview or a local command.

The production builder reads the previous manifest only from `https://overthehillhub.com/seo-manifest.json`, without credentials or redirects. A 404 is a first-integration baseline and preserves the existing committed dates. Other HTTP failures, invalid JSON, a foreign project or a network failure stop inheritance rather than silently discarding history. If the domain does not resolve before the very first deployment, `INDEXNOW_BOOTSTRAP=true` is an explicit one-time bootstrap option; use it only after establishing that there is no prior production history, then remove it. It is not a retry workaround for an existing site's outage.

The prepared `.github/workflows/indexnow.yml` runs from trusted default-branch code after `vercel.deployment.success` or `vercel.deployment.promoted`, or through a no-argument manual retry. It checks GitHub's event sender and repository, then matches the event project, deployment ID and commit against the fixed canonical site's public manifest. It never requests the payload's deployment URL. Only the official `vercel[bot]` sender is accepted automatically; the actual integration sender remains to be verified on first publication. No branch name or project ID has been guessed in configuration.

The workflow uses only GitHub's built-in short-lived token to read its own successful checkpoint artifacts. The checkpoint is uploaded after every batch and the final current-version check have succeeded, with 90-day retention. Any failure leaves the previous successful checkpoint unchanged. A missing or expired checkpoint results in a full submission plus still-retained deletion events; it does not change sitemap dates. The workflow's concurrency group serializes notifications and does not cancel a running submission.

### Publication ordering boundary

The inherited deletion ledger requires ordered production builds/publications for this site. Before activating the workflow, verify the Vercel Git production branch queue and that queue-skipping builds, independent CLI deployments or interleaved manual promotions do not bypass that order. No existing platform configuration was available to verify or modify here. Notification concurrency alone cannot recover a URL that briefly existed in a superseded concurrent build when later builds never inherited it. If those release paths are needed, first put them through one ordered publication process or retain every published version in existing durable infrastructure. This integration does not claim that an unknown concurrent release setup is covered.

A restored URL loses its old deletion event; deleting it later creates a fresh event. Retired addresses are checked for a real 404/410, a permanent redirect or an explicit noindex response before submission. All changed URLs are deduplicated and sent in batches of at most 10,000. HTTP 429 receives bounded retries; only 200/202 responses count as receipt, not search inclusion. Rebuild historical content before a rollback notification rather than promoting an old immutable artifact and expecting its old sitemap dates to change.

### Local verification

Run `npm run check`, `npm test`, `npm run build`, `npm run indexnow:check`, and `python scripts/audit/build.py`. The dry run never contacts IndexNow. The 11 notification tests use mock HTTP responses for changes, deletions, restoration, expiry, partial failure, retry limits, forged events, unrelated projects and superseded versions. The date tests also check that the new shared-content baseline preserves existing dates.

After the code is in the GitHub default branch and the project is connected to Vercel, publish with the existing production environment values. The Vercel Git integration supplies its project/deployment/commit metadata; no user-supplied project ID or API key is needed. On that first successful release, verify the root key file, public manifest, the trusted event envelope and the successful notification artifact. DNS, HTTPS, actual remote workflow execution and IndexNow receipt are not claimed as completed by this local implementation.
