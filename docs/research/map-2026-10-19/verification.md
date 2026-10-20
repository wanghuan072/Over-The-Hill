# Interactive map evidence — 19 October 2026

## Available maps

Real community interactive maps now exist on [MapRunner](https://www.maprunner.info/overthehill) and [Gamer Guides](https://www.gamerguides.com/over-the-hill/maps/). They are community atlases, not developer-operated maps. All five release areas have coverage. The official Supporter Pack's printable maps are a separate paid product, not an open tile license. No paid map, satellite tile set, competitor UI, tile service or application implementation was imported.

The five game-owned 2048 × 2048 topographic textures were already published in this project. Their original URLs and hashes remain in `../launch-2026-10-16/asset-candidates.json`. These retain their existing copyright status; public availability does not create a blanket license. The new atlas uses these local images without a runtime dependency on another site's servers.

## Coordinate reconciliation

Only the site's existing **117 confirmed locations** are plotted: 43 cabins/camps, 40 scenic points, 23 trail starts, five mechanics and six exits. No bulk animal, meteorite, crate, reward, or route database was imported. In particular, larger scenic totals on other sites are not substituted for independently reviewed entries.

`maprunner-*.html` preserve public server-rendered game position records; their decoded observation data are the five adjacent area JSON files. Each named location is matched against this site's stable ID and independently against Gamer Guides' reviewed marker records saved in `../review-2026-10-19/`. `coordinate-verification.json` records all 117 matches, game x/y/z, independent marker ID and pixel position. No position is invented from a place name or scenic screenshot.

Each map's recorded world size is 4000 × 4000. The north-up game texture projection is `x = (world.x + 2000) / 4000`, `y = (2000 - world.z) / 4000`. Elevation is world y. Texture/grid alignment is visually reviewed with the published map. An affine fit to the independent manually positioned pins checks axis orientation and location agreement; maximum differences by area are 23.04 / 59.40 / 79.85 / 31.11 / 31.84 metres. Manual pins and trail starting positions are navigation aids, not a claim of survey precision or a road-following route. Challenge checkpoint paths are deliberately not plotted.

Two spelling differences are reconciled by identity and independent spatial match: existing `Djebel Rahmani Trail` corresponds to game `Djebel Rahmani Ascent`; existing `Tunnel to the Aures Mountain` corresponds to `Tunnel to the Aurès Mountains`. Existing published titles/IDs remain stable. Trail rewards shown by the atlas come from the already-verified vehicle records, not an unreviewed second reward table. Existing Demo-only records remain excluded.

## Version boundaries and storage

The October 16 patch moved meteorite spawn points. No meteorite pins are published. Wildlife spawn availability and the current crate/recovery coverage are outside this first atlas. No route planner, real-time player position, game-save connection, account or cloud syncing is claimed.

Discovery IDs use `oth-map-progress-v1` local storage with a versioned envelope. Unknown IDs and unsupported/corrupt payloads are ignored. Per-area reset preserves other areas; storage failures show a visible message. Privacy Policy and README describe this local checklist. Adding or changing point data or atlas copy changes `/maps`' content fingerprint; unchanged pages retain their sitemap dates.

## Verification

`npm run check`, `npm test` (14 tests), production build and `node scripts/audit/maps-browser.mjs` validate the implementation. The browser audit intercepts prerendered build files and local images, with no HTTP listener or development server. Desktop 1440, tablet 1024, mobile 768 and 375 checks cover filtering, search by vehicle reward, selections, saved progress after reload, reset/cancel, empty states, keyboard zoom, fit, wheel zoom, dragging, local storage failure, image loading and horizontal overflow. Screenshots are written to the OS temp `oth-map-layout` directory.
