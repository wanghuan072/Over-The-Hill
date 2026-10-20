# Content and image review — 19 October 2026

The review supplements the October 16 evidence set. Public routes remain unchanged: vehicles, areas and Wiki items stay on lists, the patch is an Updates section, there are three guides and no Tools pages.

## Sources and conflicts resolved

- The [October 16 official patch](https://steamcommunity.com/games/2929250/announcements/detail/713415392836453283), preserved by [SteamDB build 25992246](https://steamdb.info/patchnotes/25992246/), identifies build `26.10.16_57fb763`. It changes meteorite spawns, fixes repeat objective payouts, accelerates weather while camping, adjusts The Ding's center of mass, and fixes a co-op portal-loading case. The site describes those changes without claiming numeric handling improvements or current meteorite coordinates.
- Fresh [Canada](https://www.gamerguides.com/over-the-hill/maps/the-valhallas-canada) and [Algeria](https://www.gamerguides.com/over-the-hill/maps/algeria) catalogs and public marker responses are saved locally. The reviewed coverage now contains 23 challenge trails, 43 cabins/camps and 40 scenic points. Aurès Mountains increased from two to five listed trails, five to nine cabins and four to eight scenic points. Counts describe this coverage, not a guarantee of every possible location in the game.
- Marker `contains` IDs connect Tinny to Ukhtayn Route, Lynx to Mahrouqa West Track, Roamer to Kalaa Ulya Track and Cumbre to Jazira Ascent. All four are in Aurès Mountains. These supplement the 13 previously checked reward associations.
- [A player's Rust Ox location record](https://steamcommunity.com/sharedfiles/filedetails/?id=3821583393) independently identifies Waddington in Gimli Ridge; the release indexes name it Waddington Scree Trail. The 21-vehicle list now has 18 named reward trails and three starters. No conflicting manufacturer, year, torque, weight or performance score is imported.
- Gray Wolf, Sasquatch, Jackal and Flamingo now have named independent map markers. Their already-reviewed matching game model assets are added to the list. Black Bear now has an Emerald Lake release marker, replacing the Demo-only location limit. The resulting list has 27 species plus the compendium introduction. Hoary Marmot, Great Horned Owl and other unplaced community-database entries remain excluded. The [secondary wildlife index](https://new.wikily.gg/over-the-hill/wildlife) is used only as a cross-check, not as the sole authority for timing, photo rewards or detection distances.
- The [hands-on TechRadar review](https://www.techradar.com/gaming/over-the-hill-review) and [release equipment index](https://new.wikily.gg/over-the-hill/tools) agree on consumable tools replenishing at cabins/camps. This is described once as general equipment context, without repeating a stock paragraph on every tool. Starting quantities are not imported.

## Image review

`assets.json` records eight newly downloaded game item icons: camp, bell, jack, radar, Pebbles, planks, portable anchor and repair kit. Each has a local path, original URL and SHA-256 hash. Identity and contrast were visually checked together. The matching icons replace decorative item illustrations in the Wiki and relevant homepage previews. The permanent winch remains distinct from the consumable anchor; its illustration is not relabelled as a screenshot.

Four additional animal models use the October 16 asset manifest and checksums. Game copyrights remain with their owners; provenance is recorded without asserting a new blanket asset licence.

The video search results and selected metadata are retained in `videos*.json` and `video-*.json`. Actual release gameplay from Camodo Gaming on October 17 and 18 was sampled, as was the October 16 all-vehicle card video. Its stat cards are derivative secondary material and are not treated as an independent numerical measurement. Gameplay preview screenshots without a reliable on-screen vehicle identity are not assigned to vehicle records. Eighteen vehicle entries therefore continue to use their matching game icons rather than mislabelled driving photos.

## Maintenance

The patch lives in `src/data/updates/release-notes.json` and appears at `/updates#october-16-update`, including a searchable anchor. It deliberately has no detail route. Content fingerprints include this record for the homepage and Updates list. Rechecking sources alone must not advance sitemap dates.

## Validation

TypeScript, ESLint and catalog provenance checks pass (96 records, 25 public page URLs and 117 named verified locations). All 11 automated tests pass, including release/Demo distinctions, full unlock coverage, area reconciliation, search anchors, indexing and persistent sitemap dates. The production build and prerender audit pass without a server. Offline Wiki and homepage checks pass at 1440, 1024, 768 and 375 pixels, including images, overflow, keyboard interactions, full document navigation, history and the homepage link to the patch section. No new vehicle, map, Wiki-item or patch detail URL was added.
