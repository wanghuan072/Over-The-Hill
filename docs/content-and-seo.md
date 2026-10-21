# Content and SEO maintenance

The canonical production origin is `https://overthehillhub.org`. Static page titles, descriptions and Hero introductions live in `src/seo/tdk.js`; guide detail metadata stays with each JSON record. Titles target 40–60 characters and descriptions 140–160 characters as editorial checks, not promises about Google display or rankings. No meta-keywords field is emitted.

Keep Demo values labelled. A release date does not establish that an old upgrade price, unlock condition or multiplayer procedure is unchanged. Preserve evidence fields internally; write public descriptions around the player's question. Do not claim firsthand testing unless there is an actual testing record. The site has no fictional authors, review scores or official affiliation.

## Persistent content dates

Run `npm run content:dates` after editorial changes and retain `src/seo/page-dates.json` with the changes. `npm run build` also runs this step before compiling. Commit or otherwise preserve the manifest between environments; deleting it creates a new baseline for every page. The current baseline is October 15, 2026, when this editorial revision was made.

The script fingerprints page text, page metadata and relevant published records. Import and formatting changes, CSS class changes, external stylesheets, source bookkeeping and `lastVerifiedAt` checks do not refresh dates. Each legal policy has its own fingerprint. A changed article also changes the lists where that article is displayed. New and substantively changed pages receive the date of the update run; unchanged pages keep their stored date. Article dates, structured data and sitemap lastmod read the same manifest. No runtime timestamps or filesystem modification dates are used for lastmod.

When adding a new collection or changing which data a page displays, update `contentInputs()` in `scripts/content-dates.ts` as well as the published route list. This dependency map is explicit; a new dependency is not discovered automatically. Tests cover unchanged pages, independent changes, new pages, evidence-only checks and formatting-only changes.

## Indexing and structured data

Production indexing requires an explicit `SITE_URL` and `SITE_INDEXABLE=true`. Vercel preview deployments are always noindex. The canonical origin defaults to the real domain even in local review. Search is noindex and excluded from the sitemap, but is crawlable in production so its noindex can be read. Development builds expose an empty sitemap and disallow crawling.

The standard `/sitemap.xml` contains 19 substantive canonical pages: six main pages, five Wiki lists, three guides and five Legal pages. Vehicles, regions and individual Wiki items are anchors within lists; they do not become fabricated detail URLs. Unknown catalog and Legal paths return 404. The previous flat Legal routes were removed without redirects.

Organization and WebSite identity are emitted once per document. List pages use CollectionPage, Legal pages use WebPage, search uses SearchResultsPage, articles use Article, and inner pages include BreadcrumbList. No FAQPage, unsupported reviews, fake people or social account identities are emitted.

## Site identity and images

The original mountain-and-road logo is `public/images/logo.svg`. Matching icons are in `src/app/icon.svg` and `src/app/apple-icon.png`. The shared Open Graph and Twitter image is `/images/og-image.png` at 1200×630. `scripts/design-brand.mjs` reproduces these assets from the original existing homepage illustration and vector logo. The sharing artwork is an illustration, not a game screenshot. Existing source and image evidence records remain in `docs/assets.md` and related JSON records.

The operator email is `support@overthehillhub.org`, configurable with `CONTACT_EMAIL`. Legal pages describe the current application: Google Analytics 4 page measurement and its potential first-party cookies, local map storage, and no accounts, contact forms or ad network. The root layout head contains the direct Google tag scripts for G-0PGJG1RD64; no manual page-view event is added. Revisit these policies before changing those capabilities. Hosting request logs and email handling are described without inventing a retention period or a legal entity.

## Verification without starting a server

Use `npm run check`, `npm test`, `npm run build`, and `python scripts/audit/build.py`. The offline scripts under `scripts/audit/*-browser.mjs` intercept browser requests and serve build artifacts directly; they do not start Next.js. They check document navigation, history, filters, images, responsive layouts and keyboard interactions. `npm run test:e2e` can start a server through its configured webServer and should only be run when that is intended.


## Publication manifest and IndexNow

The sitemap remains the Next.js Metadata Route. `scripts/indexnow/build.ts` maps its existing canonical paths and `page-dates.json` into the public build manifest; it does not enumerate another set of guide slugs. Page dates retain their existing day precision. Same-day edits still notify because the content fingerprint changes. `generatedAt` and deployment identifiers are publication metadata, never substitutes for page lastmod.

Date records now also include a shared-content fingerprint for navigation, header/footer text and the logo/social image. The first shared baseline retains all existing dates. Subsequent shared changes update the pages that use that shared shell; formatting, imported module names, CSS class names and the runtime copyright year are not used as content changes. The existing page-specific inputs remain unchanged. Keep the date manifest in source control when a repository is established.

Deletion history belongs to the last published production manifest, while receipt state belongs to the last fully successful notification artifact. They are deliberately separate. The public ledger retains deletion versions through unsuccessful notifications and unchanged builds. Restored URLs remove old events; another deletion generates a new version. Preview and local build artifacts do not become successful notification checkpoints.

See the IndexNow section in deployment.md for event trust checks, ordered-release assumptions, 90-day receipt retention, explicit first-deployment bootstrap, rollback handling and the unverified first remote publication. There is no database, custom Secret, API route that accepts untrusted notification events, or automatic request during `postbuild`.
