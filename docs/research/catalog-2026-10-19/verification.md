# Catalog enrichment — 19 October 2026

This update covers Animals/Wildlife, Vehicles, Upgrades and Achievements. Map work is paused. Map code and point data are unchanged. There remain three guides and no Tools or individual catalog-item routes.

## Evidence

The four MapRunner catalogs and all 48 animal/vehicle records are preserved as HTML and decoded JSON. `fetch.py` captures observations; `reconcile.py` is a curated one-off reconciliation, not a scheduled importer. Downloaded JavaScript is never executed. The second comparison is the publicly served game-data catalog linked by [OverTheHillDB](https://overthehilldb.com/). Its source bundle is archived as `db-catalog.txt`; only literal JSON payloads were decoded to `db-data-*.json`.

`field-verification.json` records game item IDs and matched fields for 21 vehicles, 27 animals, 16 upgrades and 62 achievement requirements. Agreement between two extractions does not establish independent playtesting or make a mislabeled field correct. Earlier official modding identifiers and reviewed release-map rewards continue to establish vehicle identities and unlocks. Public explanations and achievement requirements are independently phrased; source vehicle lore and community guide prose are not republished.

## Vehicle fields

All 21 retain their matched gameplay photographs and now have separate stock game models. Category, country, mass, steering, suspension travel, wheel radius, engine torque and RPM are compared by game item/category/tier IDs. Speed caps are the game limiter in m/s converted to km/h and rounded as displayed; they are not measured terrain speeds. Members of a class share engine settings. No model-specific ranking or real-manufacturer horsepower is inferred.

Factory colours and distance-livery thresholds come from each vehicle's own records. Roamer's game country is restored to United States after both records agree. This identifies the game field, not a real manufacturer. Ambiguously labelled power, render-bound dimensions and pulling force inferred from mass are excluded.

## Wildlife corrections

The list remains 27 animals with documented playable areas, rather than all 42 named entries in the larger extraction. Areas, habitats, active periods, weather, rarity, class and first-registration rewards are compared by item ID. `RemoteForest`/`Remote Forest` and `VeryRare`/`Legendary` are explicit label normalizations.

Corrections include Flamingo in Aurès Mountains; Gray Wolf in Emerald Lake and Asgard Mountain; Grizzly Bear in Gimli Ridge and Asgard Mountain; Dorcas Gazelle in Aurès Mountains; and Kokanee Salmon in Emerald Lake and Asgard Mountain. Canada Goose lists Dry weather; Fennec Fox lists both daytime and night. These conditions are not guessed from real-world ecology and do not guarantee an animal's presence.

Both extracted catalogs classify Flamingo as Mammal. The site groups it under Bird as an editorial correction and explicitly leaves its Birdwatcher credit unconfirmed. Raw classifications remain in the evidence files. No animal pins, guaranteed spawns or universal detection distances are added. Shared conditions/reward guidance appears once above the list instead of on every row.

## Upgrades

All 16 purchased tiers include prices and effects across seven systems. Their sequential total is 675 Pebbles per vehicle: five systems at 75 each and two at 150. Prices agree with the second rendered upgrade list and previously observed first-tier release menus. Effects are game parameter descriptions rather than invented handling scores.

Grip +0.08/+0.16 is a coefficient, not 8%/16%. Inventory values are total slots. Winch upgrades extend range; protection reduces damage taken; water percentages describe flooding time. Later stock-relative modifiers replace earlier ones rather than adding together. Engine torque changes are class-specific and match the vehicle tier tables. Necessary Demo price differences remain labelled.

## Achievements

One category list at `/wiki/achievements` contains 62 unique goals and their artwork, grouped by activity. Six hidden requirements use native collapsed disclosures. Their anchors remain in static HTML, so search links work without exposing the requirement by default. A checkbox reveals all six.

Valve's saved [appdetails response](https://store.steampowered.com/api/appdetails?appids=2929250&l=english) confirms 62 achievements and matches the names/hidden flags of ten highlighted records. Full requirements come from the named MapRunner game entries; we do not claim all 62 were independently playtested. Steam Community/global-percentage endpoints were unavailable. No volatile completion percentages, unlock-time estimates or inferred co-op credit are published.

## Images and checks

`assets.json` documents 110 distinct files: 27 animal models, 21 supplemental stock vehicle models and 62 achievement artworks. It records URLs, local paths, native dimensions and SHA-256. All are reviewed in the three `*-review.jpg` sheets. Models are 512px and achievement artworks 256px. Game copyright remains with its owners; public accessibility is not a blanket license. Existing copyright/contact notices remain available.

Verification: TypeScript, ESLint, content audit, 18 tests, production build, prerender audit and `scripts/audit/catalog-browser.mjs`. The browser audit serves build files through request interception without starting a server. It checks 1440/1024/768/375px image loading, overflow, type/country search, engine tables, hidden disclosures, empty states, document navigation and history. Main vehicle photos stay intact. Metadata, search, category links, persistent dates and sitemap include the new list but no item details.
