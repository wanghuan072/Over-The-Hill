# Release content review — 16 October 2026

This is an internal evidence record, not player-facing copy. The public site retains list pages, three guides and no Tools routes.

## Vehicles

The developer-pinned [Steam modding thread](https://steamcommunity.com/app/2929250/discussions/0/571552004573301684/) links the [official modding documentation](https://funselektor.notion.site/over-the-hill-Modding-Documentation-3f184e36aaa080da83deeedc01b872ec). Its livery identifier example lists 21 vehicles. The saved public Notion response is `official-modding.json`; the identifier code block is `3f184e36-aaa0-802a-88ab-fdfe484c2355`.

The roster is BlastWagon, Boar, Bull, Burro, Tinny, GrandWoodman, Lynx, Woodman, Ding, Marshal, Polyana, Protector, Wombat, Roamer, RustOx, Mammoth, Timberbox, Brick, TrailBurner, Trailrat and Cumbre. Display names and classes are checked against garage presentation. No real manufacturer, horsepower, torque, weight or performance ranking is inferred from appearance.

The Canada and Algeria release map reward records independently connect 13 challenge trails to vehicles. These relationships are checked using marker `contains` item IDs and titles, rather than similar wording in a second vehicle table. Raw inputs are `*-catalog.json` and `*-markers.json`.

| Vehicle | Release challenge | Area |
| --- | --- | --- |
| Burro | Hermit Trail | Emerald Lake |
| Trail Burner | Windy Joe Trail | Emerald Lake |
| Brick | Bridal Veil Falls Climb | Gimli Ridge |
| Polyana | Elvis Rim Trail | Gimli Ridge |
| Blast Wagon | Windcall Gorge Trail | Gimli Ridge |
| Bull | Blanshard Ridge Trail | Asgard Mountain |
| Grand Woodman | Asulkan Lake Highline | Asgard Mountain |
| Timberbox | Midgar Ascent | Asgard Mountain |
| Mammoth | Lower Midgar Trail | Asgard Mountain |
| Wombat | El Kalaa North Ascent | Tassili n’Ajjer Desert |
| Woodman | El Kalaa South Ascent | Tassili n’Ajjer Desert |
| Boar | Tarfa Ascent | Tassili n’Ajjer Desert |
| Marshal | Shabah Ascent | Tassili n’Ajjer Desert |

Old Demo entries are archived separately. Overlord and Buzz Wagon have no established mapping to release names and are not merged into Mammoth or Timberbox. The conflicting Roamer country field is omitted. Burro's Rocky Ascent reward is kept only as a Demo note.

## Upgrades

[Raptor's release-day gameplay](https://www.youtube.com/watch?v=VCt6FlPnXrM) shows the actual garage. Saved frames at 650, 3398 and 3402 seconds show first-tier prices of 25 Pebbles for engine, suspension, tyres, two tool slots, water resistance and winch range. Suspension and tyres differ from earlier Demo observations of 20. Prices are scoped to the observed menu, not claimed as universal balance guarantees.

Sixteen upgrade entries cover seven systems, with matching game icons. Higher-tier prices, exact percentage modifiers, pulling force, universal compatibility and unverified unlock requirements are omitted. Secondary upgrade descriptions establish names and effects; observed footage establishes the published prices. Later tier existence should not be read as an independent playthrough of every purchase.

## Maps and wildlife

Independent release map coverage: [Canada](https://www.gamerguides.com/over-the-hill/maps/the-valhallas-canada), [Algeria](https://www.gamerguides.com/over-the-hill/maps/algeria). Five areas are listed individually: Emerald Lake, Gimli Ridge, Asgard Mountain, Tassili n’Ajjer Desert and Aurès Mountains. The last is indexed as “Aures Mountain” in the secondary map; this spelling alias must be normalized during reconciliation.

The area lists contain 39 cabins/camps, 20 challenge trails and 36 scenic points. These are the locations covered by the reviewed maps, not a claim that every possible discovery in the game has been found. Crate counts are 18/15/15/21/6 in the area order above. No coordinates or route overlay is copied into the site.

Twenty-two animal identities have independent release-map compendium records; Black Bear is retained with its earlier Demo identification and a visible Demo-area label. The animal list has 23 species plus the compendium introduction. Canada birds are not automatically assigned to Emerald Lake: the release map puts Bald Eagle and Coyote in Gimli Ridge. Animals without independent placement or earlier direct footage, including Balinese Tiger, Flamingo and Gray Wolf, remain unpublished. Spawn times, weather conditions and completion rewards are not imported from the larger community table.

## Image matching and rights

`asset-candidates.json` records the original URLs, local paths, source pages and SHA-256 hashes of 71 inspected candidates. Published catalog imagery uses three previously matched vehicle screenshots, 18 matching vehicle icons, 16 upgrade icons, 23 animal model images and five in-game topographic textures. The unused candidates do not become catalog records. Every icon/model is visibly labelled by image type; these are not presented as full driving screenshots.

The secondary asset host is OverTheHillDB. Its images are game assets, not original site photography or a Creative Commons collection. Their copyrights remain with their respective owners; this record documents provenance and makes no blanket permission claim. The site's copyright page and correction contact remain available.

Locked garage selections do not reliably change the large 3D preview. In the reviewed footage, selecting Mammoth, Brick or Protector while locked leaves another owned vehicle on screen. Those preview frames are deliberately not published as model-specific photos. Asset identities are matched by the named icon rather than the adjacent preview.

The one-off import script prepares curated records; it is not a community database synchronizer. Subsequent manual reconciliation in the JSON data, including complete area lists and spelling aliases, is authoritative. Do not rerun the import as an unattended update.
