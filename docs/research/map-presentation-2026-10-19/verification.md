# Five-area map presentation — October 19, 2026

## Reference comparison

The live Emerald Lake reference was inspected in the user's existing browser. Its actual map uses coloured top-down terrain renders, a topographic switch, dense species-specific marker groups, complete checkpoint sequences, terrain overlays, personal annotations and a map-first workspace. The previous implementation defaulted to a topographic sheet and put location information below the map. Those presentation and interaction gaps are addressed on the existing `/maps` page, without adding map detail URLs or restoring Tools.

## Images and alignment

`prepare.py` reads the five cached public area configurations from the preceding investigation. It requests only public image tiles and literal JSON indexes. It does not evaluate third-party application code or reuse the reference UI code. The source URL convention was verified against actual rendered image elements in the reference browser.

Each satellite mosaic comprises 256 256×256 tiles at published zoom level 4, assembled without changing orientation or world extents into one 4096×4096 WebP. All five mosaics are complete and opaque, have distinct SHA-256 hashes, and visually match their respective area's coastline, terrain and roads. The existing topographic maps remain an independent selectable layer. Coordinates retain the same 4000×4000-metre game-area projection, with no fitted or invented points.

Sparse hazard indexes provide five overlays in each Canadian area (terrain hazards, deep snow, ice, soft ground, water) and two in each Algerian area (terrain hazards, water). Only indexed zoom-3 tiles are assembled; unlisted tiles remain transparent. The 19 overlays are saved as lossless 2048×2048 WebPs to preserve their actual colour/alpha data. No snow/ice layer is invented for the desert. The site does not infer numeric water depth, live weather or safe routes from the colours.

All 24 display assets are local, totalling approximately 13.1 MiB. `assets.json` records the reference pages, render versions, exact local files and checksums. MapRunner produced the terrain renders; underlying game artwork belongs to its owners. These are not newly commissioned illustrations, official press screenshots or assets for which this project has acquired a new blanket redistribution licence. The game map textures and animal models keep their earlier provenance records. There are no runtime external image, tile or API requests.

## Interaction and privacy

All five maps share the same base-layer controls, area-specific terrain menu, checkpoint drawing, markers, location panel, discovery filters, wildlife conditions, notes, measurements, sharing and full-screen support. Wildlife and meteorite layers are visible by default; wildlife clusters never mix species. The desktop sidebar scrolls independently. Mobile devices show the map first, with a labelled filter toggle. Point details open as a dismissible panel inside the map.

Share links use `/maps?area=...&pin=...#interactive-map`, keep the `/maps` canonical and do not introduce indexable item detail URLs. Invalid area/pin query values are ignored. Notes use a separate version-1 localStorage record under `oth-map-notes-v1`; validation rejects invalid areas/coordinates, duplicate IDs and excessive labels. Notes are not sent to a server or put in share URLs. Existing discovery IDs and version-1 progress remain compatible. Measurements use normalized world x/z distances multiplied by 4000 metres and are explicitly labelled straight-line distances, not road or slope distances. Notes and measurement points can be placed with the keyboard by focusing the map, moving it with arrow keys and pressing Enter.

## Verification

- TypeScript, ESLint and content audit.
- 23 automated tests, including unique per-area renders, documented overlay coverage, species-specific clustering, note validation and 4km distance calculations.
- Production build and prerender checks for metadata, canonical, indexing, anchors, internal links and images.
- Existing map browser audit at 1440, 1024, 768 and 375 pixels for discovery progress, reset, touch/pointer pan and zoom, keyboard controls, storage failures and images.
- Additional presentation audit at 1440 and 375 pixels: every one of the five 4K maps, both base layers, all 19 actual overlay images, opacity controls, shared point links loaded as complete documents, keyboard note placement, persistence, deletion and measurement.

Browser audits intercept generated production files and local assets directly. No development or production project server is started. They intentionally reject external requests. Screenshots are saved under the system temporary `oth-map-layout` folder.
