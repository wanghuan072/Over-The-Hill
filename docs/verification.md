# Maps visual redesign — October 15, 2026

/maps is a single-page region atlas: landscape hero, Canada and Algeria region cards, Emerald Lake area summary, travel notes and native FAQ disclosures. The Interactive map promotional block and its page-body link have been removed. No map detail routes were added; #canada, #algeria and #emerald-lake remain the entry targets. Emerald Lake counts retain their June Demo scope. Existing publisher press assets are reused with accurate region descriptions. Offline production-artifact browser checks at 1440, 768 and 375px verify the three records, no page-body interactive-map CTA or detail links, image loading, no overflow, same-page region/area anchors and keyboard FAQ expansion. The project server was not started.

# Wiki visual redesign — October 15, 2026

The four-category Wiki overview and homepage Explore the Wiki section share image-led category cards and matching destinations. Category pages now use a category-switching sidebar, no horizontal chapter tabs, and image-left/text-right entry rows. Mobile uses a collapsible category menu. Every entry uses its own labelled original illustration; there are no new detail routes. Metadata, counts, search, notes and collection anchors are retained. The offline browser audit checks actual production artifacts at 1440, 768 and 375 pixels, sidebar navigation with document requests, browser history, search/no-results/reset, keyboard notes, category isolation, item image placement/loading and homepage category links. It starts no project server.

# Wiki redesign — October 15, 2026

The Wiki overview contains four category links and no entry cards. Each category page contains only its own records (8 equipment, 2 collectibles, 7 upgrades, 7 wildlife). Search results and internal relations use category-page anchors, with no item detail routes. Static production audit checks all 29 public pages, metadata, links and record anchors. The offline browser audit loads actual build HTML and JS through Playwright interception, without a Next.js server. It verifies full-document category requests, browser history, client search/no-results/reset, notes expansion, state reconstruction and overflow at 1440, 768 and 375px. This is artifact verification rather than a live server/proxy-status test.

# Latest garage verification — October 14

The later player-footage pass adds ten distinct named garage icons, so all 13 directory rows now have imagery (three photos, ten explicitly labelled icons). It adds visible body/profile fields, individual descriptions and corrects Overlord from Workhorse to Expedition. The data audit checks source associations, image labels, file checksums and duplicate capture bytes. TypeScript, ESLint, the data audit, all 11 unit tests, production build and 25-page prerender audit pass. No project server was started. Offline browser rendering of the built HTML at 1280, 768 and 375 pixels shows zero broken images and no horizontal overflow. This checks CSS and image display; it does not validate live hydration or document navigation.


The garage contains 13 named entries and three distinct model image paths. Trailrat and Polyana were added from a directly inspected Demo menu; Buzz Wagon’s class was corrected to Workhorse. Burro’s Rocky Ascent reward and equipment sequence were checked in the same video. Model image matching used equipped Demo vehicles and the publisher trailer supplied through its press-kit video section. No generic scenery is assigned to missing model photographs.

The new directory renders all 13 rows in the production HTML, regardless of image availability. A regression test protects the named additions, roster size, unlock condition, corrected class and distinct photos. TypeScript, ESLint, the 50-record data audit, 11 unit tests and production build pass. The 25-page HTML audit validates every catalog anchor and rejects external public links. No server or browser was started for this pass.

## Earlier verification history

# Duplicate-content correction

Vehicle and Wiki cards now omit imagery when no matching subject photo is available. Shared scene previews have been removed, generic vehicle notes deleted, and repeated wildlife camera advice removed from species cards. Content auditing checks that unmatched vehicles have no assigned image and that displayed photos do not repeat within each catalog. The existing image library remains available for page heroes and regional context.

No new model specifications or photographs were obtained in this correction. Vehicle class, country and Demo availability can legitimately be shared; unsupported performance differences are not invented. No server or browser was started.

# Current verification — October 14

After consolidating vehicle, map and Wiki records into single collection pages, TypeScript, ESLint, the 48-record content audit, ten unit tests and the production build pass. The build-only HTML audit covers 25 public pages, including every catalog record anchor and cross-page anchor links. Sitemap contains collection URLs without fragments or removed catalog detail URLs. Guide detail pages remain limited to three.

No server was started. Browser checks below describe earlier versions and have not been rerun for the new list layout. The latest pass adds 26 local press screenshots, player-facing notes and redesigned catalog cards. Only Protector has a matched model picture; the other vehicle cards visibly distinguish scene previews. The HTML audit rejects every external HTTP link on public pages. Source provenance remains internal. Browser layout/interaction checks were not rerun: the available browser has no open preview tab, and the project was not started.

## Earlier verification history

# Verification record

The October 12 production build succeeds on Next.js 16.4.0 / React 19.3.0. TypeScript, ESLint, content audits and nine unit tests pass. The content audit covers 48 content/reference records, two named landmarks, source IDs, fact provenance/timestamps, section evidence, related links, tables and unique detail metadata.

On October 12, the build-only HTML audit (`python scripts/audit/build.py`) passed for all 68 public pages. It checks prerender availability, one H1, unique title/description, Canonical, preview noindex, OG/Twitter fields, structured data, internal links, images and section/source anchors. It does not launch a server. Unit coverage includes fact/body search, menu availability scope, coordinate-free checklist items, invalid normalized positions, progress accounting, selection limits and indexing gates.

No project server was started for this expansion, as requested. The browser suite was updated to derive search counts from the expanded data, but was not rerun. The following browser checks describe the earlier implementation validation, not a new browser validation of the expanded pages.

Browser checks cover 37 public URLs, unique titles and descriptions, one H1 per page, canonical metadata, JSON-LD parseability, internal links, local images, preview robots and sitemap behavior, unknown detail 404 status, search and category filtering, FAQ expansion, and navigation requests that load a fresh document.

Visual and overflow checks cover the homepage, guide list/detail, wiki, vehicles and map tool at desktop, tablet and 375px mobile widths. Test screenshots are generated at `test-results/home-desktop.png` and `test-results/home-mobile.png`.

Test-only fixtures exercise normalized marker positions, map pan/zoom/reset, category filters, marker details, discovery persistence across reloads and between tools, progress reset, two-to-three vehicle selection, and blocked browser storage. They are intercepted test responses and never included in the production dataset.

Actual game coordinates and named vehicle performance have not been tested. Documented Demo actions now appear with developer references and scope labels; independent release-build testing has not been claimed. Third-party official image permission has not been established, so the current site uses labelled original concept artwork. There are no analytics or ads to verify.

The supplied Next.js ESLint chain has a development-only dependency advisory documented in deployment.md. `npm audit --omit=dev` is the production dependency check; no incompatible framework downgrade is performed automatically.
# Current verification — October 15, 2026 editorial revision

The current implementation supersedes older tool and route notes below. Tools have no public routes; vehicle, map and Wiki entries remain lists, with three guide and six news detail pages. Legal pages now live under `/legal/`.

- `npm run check`: TypeScript, ESLint and the 50-record content audit passed.
- `npm test`: 10 tests passed, including SEO text lengths and persistent dates.
- `npm run build`: production compilation and prerendering passed, without starting a server.
- `python scripts/audit/build.py`: 25 public pages passed unique metadata, one H1, canonical origin, preview noindex, structured data, internal links, section anchors and image checks.
- Offline homepage and header browser audits passed, including full document navigation and history. Inner-page checks passed for 18 representative pages at 1440, 1024, 768 and 375 pixels. Wiki category navigation, filters and keyboard interactions also passed.
- `scripts/audit/production-seo.ts` passed with production and preview environments: 24 production sitemap entries with stored dates, preview crawling blocked, and unknown content routes returning 404.
- Re-running `npm run content:dates` after the final build reported zero changed fingerprints. Unit fixtures verify that unchanged pages and evidence-only checks retain dates, while changed and new pages receive the update date.

No server was started, no deployment was performed and no remote repository was modified. This revision does not claim independent release-build testing of every Demo mechanic. Current image provenance remains documented in `docs/assets.md` and its referenced evidence records.

---

