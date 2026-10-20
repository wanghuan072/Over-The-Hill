# Atlas expansion — October 19, 2026

The existing 117 named, calibrated stops retain their IDs and coordinates. No new routes, item detail pages, Tools pages or runtime third-party services are introduced.

## Evidence and curation

Five public MapRunner area payloads were retrieved on October 19. Public OverTheHillDB literal map-area data and patch metadata were retrieved separately. Downloaded JavaScript is archived as text; it was not executed. `prepare.py` reads only cached JSON, records a compact verification result and builds `src/data/maps/atlas.json`.

- 86 crates: every x/z position independently matches DB game data within 0.16 metres. First-time reward tables also checked against the independent 188-record reward catalog.
- 14 recovery pickups: names, pickup coordinates and configured reward records are available. Delivery positions were not available, so no destination or recovery driving route is invented. Hidden vehicle-fit reward variants are not counted as separate displayed rewards.
- 23 challenge sequences: all 404 checkpoints have uninterrupted ordinal sequences matching the published checkpoint counts. Each sequence's first point matches the existing challenge-start pin. Straight dashed lines are explicitly checkpoint connections, not road routing. Repeat payouts are labelled configured values, not claimed playtests.
- 730 wildlife spawn positions independently match the second map data import. They reference the site's 27 existing verified animal records and local model images. The DB has two additional Tassili animal records that are not included without a second match. Species photography is one shared progress record per animal, not hundreds of spawn-point completion targets. A spawn pin is not a guaranteed live animal. The Flamingo classification issue is not used to infer achievement credit.
- 212 possible meteorite spawns use the DB's dated post-patch Steam build 25992246 import. All 208 positions present in MapRunner match this import within 0.16 metres. Four further Asgard records are present only in that newer build-labelled import; these are included as possible spawn positions, not guaranteed meteorites. There are no conflicting coordinates among matched records. The prior blanket exclusion of meteorites is removed. These pins do not contribute to completion.

Projection remains `(worldX + 2000) / 4000`, `(2000 - worldZ) / 4000`. No geodetic latitude/longitude is invented. Five existing local game map textures are reused. No MapRunner UI, custom satellite tiles or application code are embedded or copied.

## Progress and interaction

The existing version-1 localStorage format is preserved. All original 117 stop IDs remain valid. New fixed stops add 100 IDs; wildlife adds 27 species IDs shared across areas. Meteorite and animal spawn positions do not create additional completion targets. Resetting an area clears its fixed stops only; global species photos have a separate confirmed reset. Storage failures stay visible. Filters do not alter the saved checklist. Dense spawn layers cluster at low zoom, keeping selected and named stops individually accessible.

Public reference pages: [MapRunner Emerald Lake](https://www.maprunner.info/overthehill/emerald-lake), [OverTheHillDB map](https://overthehilldb.com/map). Patch import notes are archived in `patches.txt`; these are secondary-source build claims, not a local game extraction or playtest. Image and map artwork remains the game owners' property; new map tiles or third-party cartographic artwork are not downloaded.
