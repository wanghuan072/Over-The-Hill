# Wiki presentation assets — October 15, 2026

Wiki category cards and category navigation use existing publisher press-kit screenshots 03 (equipment), 15 (collectibles), 11 (upgrades) and 25 (wildlife) as category scenery. They do not identify individual items or animal spawn locations. The Wiki overview banner uses screenshot 01.

The 24 files in public/images/wiki/illustrations are original, code-authored SVG field-guide drawings. Each entry has its own object or animal illustration. These are conceptual editorial illustrations, not game screenshots or verified in-game object models. Every item thumbnail is labelled Field illustration. Existing verified-content image fields and underlying gameplay facts were not replaced. The source and permitted-use records for publisher screenshots remain in docs/press-assets.json.

# Latest model images

Protector retains press screenshot 11. Burro and Trail Burner now have separate image files under `public/images/vehicles`, extracted without creative modification from the publisher’s Launch Trailer linked in the public press kit. The vehicle shapes were compared against named, equipped vehicles in Cation’s Demo garage recording; the stock Burro footage provides an additional pickup reference. `docs/press-assets.json` records original trailer moments and matching evidence. This is editorial use of publisher-distributed promotional media; it is not a claim of CC/public-domain licensing.

Following the user’s authorization to use player gameplay and community captures, the other ten entries now use their actual named garage icons, captured from Camodo’s 720p and Cation’s 1080p recordings. Each asset shows only the correct slot’s silhouette, never the unrelated owned vehicle in the right-hand preview. They are labelled Garage icon, excluded from photo highlights and displayed in compact rows on desktop, tablet and mobile. These are gameplay captures used for editorial identification, not publisher press-kit assets or CC-licensed media. Provenance, capture rectangles and checksums are in docs/vehicle-image-evidence.json; the ten file hashes are distinct. Full 3D model photos and unverified numerical stats remain separate gaps.

## Earlier asset history

# Current catalog media — October 14, 2026

The publisher’s public press kit distributes `over the hill Press Kit 20261013.zip` under Images with a “download files as a .zip” instruction. The public Notion page was read through its unauthenticated page-chunk endpoint; its permission-checked signed download returned the media archive. No account, cookie, access restriction or private resource was used.

26 screenshots were converted to local WebP files under `public/images/game`. Distribution is for editorial game coverage, not an open-source/CC license or ownership transfer. Copyright remains with the game owners. `docs/press-assets.json` records each file, archive member, publisher, date and rights context. The archive itself stays in temporary research storage and is not shipped.

Press-kit screenshot 11 visually matches the owned Protector shown in reviewed Demo gameplay. Unmatched vehicle and Wiki card imagery has been removed after the repetition audit. An empty image field means no matching photo is available; the UI omits the image frame. Planks uses screenshot 12’s bridge crossing. Regions, three guides, the garage hero and comparison views also use appropriate press screenshots. No screenshot was extracted from the UI design reference. Images retain the original game content and were only resized/compressed for delivery.

Public press-kit reference (internal record): https://funselektor.notion.site/over-the-hill-Press-Kit-de04078ef9eb49f3a7391aa592419808

## Earlier concept-art assets

# Image provenance

Current artwork is original concept illustration generated with the built-in imagegen tool on October 10, 2026. It is clearly labelled as concept art, never represented as an actual Over the Hill screenshot, named game vehicle or calibrated map. No developer media permissions were inferred from publicly accessible screenshots. All image files are local; no remote image service is needed at runtime.

| Asset                           | Origin                                           | Use                           |
| ------------------------------- | ------------------------------------------------ | ----------------------------- |
| public/images/home/hero.webp    | Built-in imagegen, original alpine scene         | Homepage and tools backdrop   |
| public/images/home/forest.webp  | Crop of the original alpine illustration         | Scenery and guide cards       |
| public/images/home/vehicle.webp | Crop of the original alpine illustration         | Vehicle-system illustrations  |
| public/images/home/desert.webp  | Built-in imagegen, original desert scene         | Algeria and wiki illustration |
| public/images/home/og.webp      | Resized crop of the original alpine illustration | 1200 × 630 social preview     |
| src/app/icon.svg                | Original vector mountain mark                    | Browser icon                  |

Hero prompt: "Original concept illustration, wide autumn alpine landscape: deep pine forests, golden orange trees, blue lake, snowy mountains, rocky winding trail, generic olive green unbranded vintage 1970s 4x4 with roof rack on the right; darker left for text; painterly realistic art, forest greens and warm orange; no text, logos, UI or watermark. Not a game screenshot."

Desert prompt: "Original concept illustration, Algerian-inspired sandstone mesas, ochre canyons, distant mountains, winding rocky track, small unbranded vintage beige 4x4; dusty golden light; calm adventure mood, realistic painterly artwork, muted sand and green desert scrub; no text, logos, UI or watermark. Not a game screenshot or map."

For official imagery, record the original URL, rights holder, express permission or license terms, checking date, local file name and accurate content description before replacing an illustration. Remove the concept-art label only when the image is a verified game screenshot used with permission. Player-submitted images need their own documented permission.

Homepage refresh (October 15): the approved generated UI mockup is a layout reference only. The implemented hero uses press screenshot 03; region cards retain screenshots 05 and 09; the Wiki category visuals use 12, 15, 07 and 25; the three vehicle highlights retain their model-matched images and the guide thumbnails retain existing game imagery. No concept-image crops were added to public assets. CSS masks blend the hero into its green background without modifying the source image. Mountain/trail and footer tree decorations are native SVG/CSS.

Homepage visual correction (October 15): `/images/home-v3/hero.webp` and the four category covers are original generated illustrations to reproduce the approved concept's composition. They are marked as original illustrations in the UI and their alt text; they must not be reused as model evidence or game screenshots. No vehicle record imagery changed. The hero is a full scenic panorama rather than a masked screenshot. `docs/home-v3-art.json` records the original PNG sources. Region, vehicle, shortcut, wildlife/discovery scene and guide images remain existing gameplay/press imagery. Original SVG equipment illustrations are reused for the four equipment preview cards.
# October 15 site identity

`/images/logo.svg` is an original mountain-and-road identity for this independent fan site. Matching app icons use the same artwork. `/images/og-image.png` is a 1200×630 composition of the existing original homepage illustration, a dark green overlay, the vector mark and site typography. It is labelled as an independent fan site and original illustration. Neither asset is an official game logo or screenshot. Reproduce with `node scripts/design-brand.mjs`.


## October 16 release catalogs

Vehicle, upgrade, animal and area-map assets now have a separate [release evidence record](research/launch-2026-10-16/verification.md). Its candidate manifest includes original URLs and SHA-256 hashes. Published images comprise three existing vehicle screenshots, 18 named game vehicle icons, 16 upgrade icons, 23 animal models and five game map textures. Icons and models are labelled in the list UI. Their provenance is documented; no new blanket reuse licence is asserted. Unconfirmed candidate animal models are not published as wildlife records.

October 19: eight additional named game item icons replace equipment/Pebbles illustrations. See [the updated review](research/review-2026-10-19/verification.md) and its asset checksums. Four additional animal identities are now supported by independent release-map records and use previously inspected model assets. Vehicle screenshot assignments were kept conservative; no generic driving image was reassigned to an unverified model.

## October 19 vehicle screenshot completion

The later [catalog enrichment](research/catalog-2026-10-19/verification.md) adds 27 animal models, 21 supplemental stock vehicle models and 62 achievement artworks. Its 110-file manifest records original URLs, local paths, native dimensions and checksums. Models and achievement icons are labelled by image type. Game copyright remains with its owners; no blanket reuse license is asserted.

All 18 remaining vehicle icons have been replaced with model-matched gameplay pictures: 15 player livery screenshots and three named IGCD captures. Existing three vehicle photographs remain. [Identity and provenance review](research/vehicle-photos-2026-10-19/verification.md) and `images.json` record authors, URLs, dimensions and hashes. Public assets are in `/images/vehicles/gameplay/`; player paint is labelled Custom livery. Rejected studio renders and UV sheets are not public vehicle photos.


## Five-area atlas presentation — October 19

Five distinct 4096×4096 terrain-render mosaics and 19 sparse terrain overlays are local under `/images/maps/atlas/`. The [presentation verification](research/map-presentation-2026-10-19/verification.md) and its `assets.json` record source pages, render versions, dimensions, world alignment and checksums. MapRunner is the terrain-render producer; game artwork remains its owners’ property. No new blanket redistribution licence is asserted. Existing game topographic sheets remain available through the base-layer switch. No third-party code or runtime tile service is embedded.
