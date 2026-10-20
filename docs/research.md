# Research and content expansion — October 10, 2026

The latest dataset is documented in [the October 12 video review](video-research-2026-10-12.md): 11 named vehicle identities, 24 Wiki records, two named-landmark checklist items and 68 public pages. This document preserves the earlier research history.

## Current editorial scope

The user subsequently requested a reference-data focus. Only three Guides remain: beginner, winch and multiplayer. Useful mechanics from the removed guides were consolidated into equipment, map, upgrade and wildlife entries. Vehicle-system data lives in its own JSON record and appears in Vehicles and search. Tools now presents the seven game-equipment records. There are 46 public pages and 26 indexed content/reference records; no new named-vehicle or coordinate data was invented. The counts below describe the preceding research expansion, not the current Guide count.

## Earlier research result

The original 17 records were expanded to 43: 21 guides, 13 wiki records, three region/area introductions, and six official-news summaries. Together with the hubs, tools, source directory and legal pages, the project has 64 public pages. The page count follows distinct evidenced subjects; it is not a minimum word-count target or a ranking promise.

New coverage includes release pricing and platform timing, system requirements, Demo availability, saves/photos/reset, camping and cabin travel, flipped/stuck recovery, meteorites and Pebbles, controller/wheel support, photo mode, Deck/Proton, performance diagnosis, co-op diagnosis and modding plans. Existing introductory guides gained developer-supported detail and links to the more specific articles. Wiki additions cover the anchor, jack, camp, radar, currency, upgrade system, tyres, liveries and Compendium.

## Research method and evidence

Searched official Steam announcements and developer replies, the official website, the developer-hosted Reddit AMA, the game's subreddit, press previews and community databases. Third-party guides were used to discover potential primary references; their writing and databases were not copied. Inaccessible threads were not used as evidence of their claimed procedures.

The public reference registry is `src/data/sources/sources.json`; `/sources` explains its editorial scope to visitors. It includes:

- [Steam listing](https://store.steampowered.com/app/2929250/over_the_hill/): minimum Windows specification and public game description.
- [Developer FAQ](https://steamcommunity.com/app/2929250/discussions/0/554627937323741779/): release/platform plans, individual progress and public system descriptions.
- [June Demo announcement and recovery replies](https://www.reddit.com/r/overthehillgame/comments/1u3v6qq/steam_next_fest_public_demo_out_now/): Emerald Lake, activities, Pebbles, tools and game-data paths.
- [June 18 developer AMA](https://www.reddit.com/r/pcgaming/comments/1u9aa48/we_are_the_developers_of_over_the_hill_ask_us/): removable upgrades, pause-menu photo mode, meteorite behavior and dated intentions.
- [Meteorite developer reply](https://steamcommunity.com/app/2929250/discussions/1/573794228177520661/): direct attachment and multiplayer extraction instructions.
- [Camp and cabin developer reply](https://steamcommunity.com/app/2929250/discussions/1/573794228177518436/): visited-cabin travel and camp tool.
- [August camping reply](https://steamcommunity.com/app/2929250/discussions/0/586182909485939759/): cancellation and changing weather.
- [June autosave/reset/log reply](https://steamcommunity.com/app/2929250/eventcomments/571540589652403065/?ctp=2): historical Windows Demo diagnosis, not a universal repair claim.
- [Official news archive](https://steamcommunity.com/app/2929250/allnews/?l=english): dated access, pricing and release changes. Latest October articles retain their existing direct announcement URLs.
- [Developer-authored Xbox Wire preview](https://news.xbox.com/en-us/2026/01/23/the-wilderness-of-over-the-hill-on-xbox-series-xs/): brief Canadian inspiration and working-area-name context. Later August console timing supersedes January plans.

## Rejected or unresolved data

[Over the Hill Database](https://overthehilldb.com/) says its catalogs were taken down at the developers' request pending official data. Search-cache snippets from those withdrawn catalogs were not republished as a verified vehicle roster, stat table, wildlife schedule or coordinate list. Real-world vehicle names found on other fan sites also do not establish in-game names.

No calibrated map image, accurate POI dataset, reproducible animal spawn table or confirmed named-vehicle specification dataset was acquired. The interactive map, tracker and vehicle comparison therefore retain their preparation states. Their implementation and test-fixture capability are separate from the production data.

## Content and SEO behavior

Articles expose named references, dates, scope and section-level citations. Documented game actions are separated from editorial backup/diagnostic checklists. Search now includes body text. Topic pathways and related links connect purchase information, exploration, equipment and troubleshooting. Structured Article data includes reference URLs; FAQPage is not added. Canonical, OG, Twitter, robots and publication filters remain in place. The source directory is in the sitemap; search and preparing tool pages remain excluded.

Production indexing still requires the configured `SITE_URL`, `SITE_INDEXABLE=true` and a non-preview deployment. The local build remains noindex. The contact address still requires `CONTACT_EMAIL`.

## Validation

`npm run check`, `npm test`, `npm run build`, and `python scripts/audit/build.py` pass. No server or deployment was started. Browser tests were updated for data-driven result counts but not rerun in this expansion. Prior browser coverage remains documented separately in `verification.md`.

Before publishing release-specific walkthroughs, recheck the October 14 build, replace outdated development intentions, confirm save compatibility, and verify any newly supplied artwork license or map/vehicle data against that build.
