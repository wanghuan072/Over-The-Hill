# Three replacement guides — October 20, 2026

## Editorial scope

The original beginner, winch and multiplayer articles are removed from the published guide collection. The replacements are three focused English articles: Pebbles and upgrade order; Emerald Lake's three challenge trails; Sasquatch's location and photo conditions. Each contains roughly a thousand-plus words of reading content, specific tables/checklists and relevant illustrations. No personal playtime, first-person discovery, speedrun time, tested vehicle ranking or imaginary author is claimed. The player-facing voice uses practical recommendations, with no displayed source list, external reading links, video embeds or copied community prose.

## Research actually inspected

Public forum searches and direct YouTube UI inspection were carried out on October 20. No comments, support questions, messages, emails or other external inquiries were submitted.

- Reddit `1x73rly` (Upgrade or Wait), dated October 16 with later replies: early engine/tyre/tool recommendations and concern about spending. These are treated as suggested priorities, never an objectively best upgrade order.
- Reddit `1x8tjhs` (Meteorites missing?), dated October 18–19: active meteorites differ from possible landing positions, the orange glow and radar compass direction. Fast-travel reset/timer assertions were not adopted as guaranteed mechanics.
- Reddit `1x7r3no` (Off the dotted paths), dated October 16–19: a player may enter a track from the wrong end and miss the challenge start.
- Reddit `1x9nr80` (Red Fox searching), dated October 19: visibility and search frustration, with Sasquatch discussion. It is not used as a source of precise Sasquatch timing or coordinates.
- Reddit `1x95653` (UFOs and Cryptids), dated October 18–19: players looking for Sasquatch in the released game. Jokes and proposed DLC are not turned into gameplay facts.
- MySpaceGuide, `RQ4WxU0A2D4`, **Meteorite Guide - Over the Hill**, published October 16, duration 1:19: the public description and timed transcript were inspected. At 0:22: glow/photo-mode scanning; 0:36: rear direct connection and space to drive away; 0:46: throttle plus pull; 0:55: each helping vehicle connects directly; 1:04: larger rocks can require additional players. The video's claimed fixed extraction speed and detailed spawning cadence are not repeated as guarantees.
- RinKa Plays, `hl1WviWJgq4`, **Emerald Lake 100% walkthrough**, published October 18, duration 1:33:34: description, completion counts and chapter list were inspected. Chapters identify Elizabeth Oath at 12:38, upgrades at 30:15, Windy Joe at 36:33 and Hermit at 1:07:58. The Windy Joe frame at 36:34 was visually inspected, showing the hillside approach and challenge marker. The full 93-minute video was not claimed to have been watched. Its animal-photo chapters help establish that these are release-game wildlife interactions; its seven photographed animals do not include Sasquatch, so it is not represented as a Sasquatch sighting video.

The video/source IDs, dates, durations and scope are stored in the internal source registry. A YouTube Sasquatch search mostly returned unrelated channel-name matches and a Demo video; those are not invented into a current Sasquatch demonstration. Secondary SEO pages with outdated Demo advice, undocumented farming loops, inflated vehicle counts or automatic best-build claims were not used as factual instructions.

## Factual reconciliation

Existing release-game records, not copied community guide prose, establish the numbers:

- All seven upgrade systems and 16 sequential prices are checked against the site's reconciled October 19 release catalogs. Full budget is 675 Pebbles. Engine Stage 2 + Tires Stage 2 + a second tool slot is an editorial 75-Pebble suggestion. The upgrade class/stage names and the stock-relative nature of effects are retained.
- The atlas has 11 Windy Joe, 11 Elizabeth Oath and 31 Hermit checkpoints. Their first rewards are respectively Trail Burner + 25, Kayaks + 15, Burro + 40; repeats are 5, 3 and 8. Elizabeth Oath is explicitly **not** a third vehicle unlock. No fastest farming route, universal difficulty ranking or exact completion time is invented.
- Checkpoint illustrations use the full, already-checked sequence of x/z-normalized positions. Lines show checkpoint order and start/finish, not a falsely road-snapped route.
- Sasquatch's single point is `(0.5698625, 0.27463)` on the normalized Emerald Lake image. Train Horn crate is `(0.58048, 0.22236)`, Camping Gear crate `(0.5397675, 0.3173725)`. That is the northern forest just east of centre, not the extreme northeast corner. Broad secondary descriptions were narrowed with the actual coordinates. Night, Dry, Remote Forest, Legendary and the first-photo 100-Pebble reward are reconciled animal fields, not inferred real-world ecology. No spawn timer, camera distance, ritual, guaranteed sighting or repeat 100-Pebble payout is asserted.
- Multiplayer meteorite extraction follows the previously checked developer explanation of direct rear connections. Older Demo prices and controls are not presented as current release instructions.

## Images

Seven original SVG editorial figures use existing real game terrain, icons and verified checkpoint/spawn data. They are technical maps, budget charts and equipment illustrations, not AI-generated gameplay. `build_illustrations.py` reproduces them; `illustrations.json` records inputs and file checksums. Existing model-matched Trail Burner gameplay imagery and the genuine Sasquatch model supply two further body figures. Each of the three articles also has its own inspected game-scene cover and accurate alt text. No video frame with a creator's face, thumbnail clickbait, unrelated animal photo or fabricated screenshot is published.

Figures include captions and an internal full-size image link. Detailed maps and diagrams scroll within their own figure on small screens to preserve text legibility. Third-party/game rights keep their existing asset provenance records; no new reuse licence is claimed.

## Site integration and validation

All homepage, Wiki, news, README and audit links to retired guide URLs are updated; duplicate related links caused by the replacement are removed. The existing dynamic route guard returns not-found for absent records, with no redirects added. Search indexes the new text and illustrations' descriptions. Sitemap and Article metadata include only the three new guide records. Existing canonical, preview indexing and social-image policies remain intact. Persistent content dates include figure hashes; optional figure copy does not refresh unrelated news article dates.

TypeScript, ESLint, content/asset checks, 26 tests, production build and prerender audit pass. Guide browser checks cover 1440, 1024, 768 and 375 pixels: three published pages, retired build artifact absence, index filters, actual image loading, captions, full-size links, FAQ, same-page reading anchors, complete document navigation and no external reading links. The homepage browser audit also passes at all four sizes. Production files are served through request interception in these audits; no project server is started. Screenshots are saved in the system temporary `oth-guide-layout` folder.
