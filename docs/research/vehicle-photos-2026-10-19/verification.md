# Matching the remaining 18 vehicle screenshots

Reviewed on 19 October 2026. All 18 former vehicle icons now have distinct gameplay images. The three existing matched gameplay photographs are retained. No model render, texture sheet, generated image or locked-menu preview was substituted for a screenshot.

## Selection and identity

`images.json` is the authoritative manifest: vehicle ID, creator, original page and image URL, comparison page, source dimensions, output dimensions, source SHA-256, output SHA-256 and a perceptual difference hash. All 18 source images, output images and perceptual hashes are unique. Images are compressed locally to WebP without upscaling, replacing the corresponding icon only.

Fifteen images come from player livery pages on mod.io. Each selected listing is tagged for one vehicle. The author description/tag is checked against the actual body, front, windows, roofline and cargo arrangement; it is not treated as sufficient proof on its own. The [IGCD game roster](https://www.igcd.net/game.php?id=1000019103) supplies an independent set of named gameplay pictures for comparison. The reviewed per-vehicle pages and roster HTML are preserved here. Real manufacturer identifications in that database are not imported as game statistics.

Three new images are the named IGCD gameplay photographs of Bull v1, Woodman and Grand Woodman, contributed by temerario. Woodman and Grand Woodman have separate records and clearly different grilles. These are game screenshots, unlike the isolated studio renders initially found on livery pages.

| Vehicle | Selected creator / gameplay record | Identity cue checked |
| --- | --- | --- |
| Ding | veixqq / U.S. Forest Service Ding | Upright short hardtop, rounded front wings and square headlamp surround |
| Trailrat | LonelyHovering / friends | Short two-door body and Scout-style front; custom graphics are labelled |
| Brick | ehdrien / Half Brick Racing | High-roof utility body and rectangular grille/headlamp arrangement |
| Bull v1 | temerario / IGCD 423124 | Short hardtop, square grille panel and two round headlamps |
| Polyana | ortuod / Polyana Vintage | Compact sloping rear, low hood and round lamps |
| Tinny | landyjacque / Tinny in Marine Blue | Narrow Series-style front and fender-mounted headlamps; original gallery image used |
| Lynx | ehdrien / Lynx Zebra Stripes | Iltis-style open utility body, flat hood and short front overhang |
| Wombat | ehdrien / Wombat German Flag Liveries | Flat-roof enclosed body and G-style front; gallery single image replaces collage |
| Roamer | Hulso / Jurassic Hill Visitor | Long four-door passenger body and Explorer-style rectangular front |
| Woodman | temerario / IGCD 423128 | Narrow upright grille between paired round front elements |
| Grand Woodman | temerario / IGCD 423127 | Wide vertical-bar grille and wood side strip |
| Cumbre | ehdrien / Alternate Two Tone | Single cab and separate open pickup bed |
| Blast Wagon | ortuod / Military Pack | Rounded separate fenders, long hood and open bed |
| Rust Ox | DreamtOG / Mystery Machine | Flat forward-control van front and long enclosed body |
| Boar | Blaig / Boar Roamer | Rounded enclosed passenger body and tall, narrow hood |
| Timberbox | ANTARTICAPENGUIN / Frostflame | Rounded truck nose, long enclosed rear and wood-panel body arrangement |
| Mammoth | Dante_Wood / Different Paint Jobs | Unimog-style short hood, cab and cargo chassis |
| Marshal | Blaig / Marshal Survivor | Forward-control cab and enclosed rear compartment |

The default-body comparison exposed two incorrect descriptions: Cumbre is a pickup, while Boar has an enclosed body. Those sentences were corrected without inventing performance data.

## Rejected candidates

- Woodman's first livery candidate was a flat UV texture sheet. It was not used.
- Grand Woodman's first candidate was an isolated model render. It was not used as gameplay.
- Bull's Fronco candidate could not be matched confidently to the game's body geometry, despite an “ingame” filename. It was replaced with the named IGCD gameplay screenshot. A filename or vehicle tag alone does not establish authenticity.
- Promotional collages for Brick, Tinny, Wombat, Roamer and Boar were replaced by individual original gallery screenshots. No collage panel or model was generated.
- The short all-vehicle video consisted of derivative stat cards; another “best car” video reused trailer footage. Neither became a vehicle-specific source.
- The official launch trailer was inspected, but frames without a sufficiently clear, model-specific identity were not assigned to the two Wagoneers.

## Presentation and rights

The list captions identify the fifteen player-made paint schemes as **Custom livery**. The appearance note explains that accessories and paint do not establish the default setup or mechanical upgrades. Three additional images are marked **Player screenshot**. Creators and original URLs are retained in this internal record; no new public source-link block was added.

The original captures remain the property of their creators and game rights holders. This record documents editorial provenance, not a blanket reuse licence. Image content was not generated, repainted, reconstructed or sharpened to invent detail. Full framing is retained with `object-fit: contain` so narrow list slots do not cut off a vehicle.

## Verification

The content audit verifies file existence, source linkage, image checksum, native resolution and duplicate source/output/perceptual hashes. The roster test requires 21 gameplay images, 18 new screenshot records and no remaining game-icon vehicle records. Offline browser checks use prerendered production files, without starting a project server.

Final checks passed: TypeScript, ESLint, all 11 automated tests, production build and the 25-page prerender audit. Offline browser checks at 1440, 1024, 768 and 375 pixels passed images, filters, empty states, list layout, navigation and history. Mobile screenshot thumbnails retain full framing without a tall empty image column. The last content-date check reported zero changed fingerprints. No development or production server was started.
