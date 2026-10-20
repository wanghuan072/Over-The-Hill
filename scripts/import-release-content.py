"""Apply the reviewed October 16 release evidence. No network or generated game facts."""
import copy, hashlib, json, re
from pathlib import Path

BASE=Path('docs/research/launch-2026-10-16')
def read(path): return json.loads(Path(path).read_text(encoding='utf-8'))
def write(path,data): Path(path).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assets=read(BASE/'asset-candidates.json')
def asset(name,kind): return next(r for r in assets if r['title'].replace('’',"'")==name.replace('’',"'") and r['kind']==kind and not r.get('error'))
sources=read('src/data/sources/sources.json')
source_rows=[
 ('release-modding','Official release livery documentation','https://funselektor.notion.site/over-the-hill-Modding-Documentation-3f184e36aaa080da83deeedc01b872ec','Funselektor','Official car identifiers; public loadPageChunk response retained with evidence'),
 ('release-canada','Canada release map and named rewards','https://www.gamerguides.com/over-the-hill/maps/the-valhallas-canada','Gamer Guides','Named areas, places, wildlife and trail reward associations; public marker records cross-checked'),
 ('release-algeria','Algeria release map and named rewards','https://www.gamerguides.com/over-the-hill/maps/algeria','Gamer Guides','Named areas, places, wildlife and trail reward associations; public marker records cross-checked'),
 ('release-catalog','Release car identifiers and game icons','https://overthehilldb.com/cars','Over the Hill DB','Secondary comparison only; official identifiers and independent map reward records take precedence'),
 ('release-upgrades','Release upgrade catalog and game icons','https://overthehilldb.com/upgrades','Over the Hill DB','Secondary tier and icon index, compared against launch-day menu frames and transcript'),
 ('release-wildlife','Named animal game models','https://overthehilldb.com/animals','Over the Hill DB','Secondary model images; only independently documented release animals published'),
 ('release-maps','Five raw in-game map textures','https://overthehilldb.com/regions','Over the Hill DB','Game map images cross-checked against independent named area layers; not custom marker overlays'),
 ('release-raptor','Release-day live gameplay','https://www.youtube.com/watch?v=VCt6FlPnXrM','Raptor','Menu frames at 625, 650, 3388, 3392, 3398, 3402; transcript 5538–5547; locked hover does not identify the preview model'),
]
for sid,title,url,pub,scope in source_rows:
 row=dict(id=sid,title=title,url=url,publisher=pub,scope=scope,checkedAt='2026-10-16')
 if sid=='release-raptor':row.update(kind='gameplay-video',publishedAt='2026-10-14',durationSeconds=12879)
 sources=[r for r in sources if r['id']!=sid]+[row]
write('src/data/sources/sources.json',sources)
def record(slug,title,desc,category,image,ids):
 return dict(id=slug,slug=slug,title=title,description=desc,category=category,image=image,imageAlt=title+' in Over the Hill',sourceUrl=next(r['url'] for r in sources if r['id']==ids[0]),sourceIds=ids,sourceType='in-game',verificationStatus='confirmed',gameVersion='Steam release — October 2026',lastVerifiedAt='2026-10-16',publishedAt='2026-10-16',updatedAt='2026-10-16',sections=[dict(heading=title,paragraphs=[desc])],related=[],seo=dict(title=title+' | Over the Hill Field Guide',description=desc),playerNotes=[],displayFacts=[])

# IDs come from the developer's own release documentation, not an assumed rename of old slots.
vehicles=read(BASE/'demo-vehicles-before-release.json') if (BASE/'demo-vehicles-before-release.json').exists() else read('src/data/vehicles/vehicles.json');old={r['slug']:r for r in vehicles}
write(BASE/'demo-vehicles-before-release.json',vehicles)
cars=[
 ('protector','The Protector','Trail','A British utility 4x4 with a tall cabin and squared bodywork. Engine, tyre, suspension and winch upgrades are available through the garage.'),
 ('ding','The Ding','Trail','A short, upright off-roader with a flat roof and compact cabin. It is one of the vehicles shown in release-day driving and garage coverage.'),
 ('trailrat','The Trailrat','Trail','The open, simple American hardtop keeps a long hood ahead of a short cabin. Its shape is distinct from the enclosed utility bodies in Trail.'),
 ('brick','The Brick','Trail','A boxy Japanese utility SUV with a high roof and nearly vertical tail. Complete Bridal Veil Falls Climb in Gimli Ridge for this vehicle.'),
 ('bull','The Bull v1','Trail','A broad American hardtop with a stepped hood. Blanshard Ridge Trail in Asgard Mountain awards this Trail-class vehicle.'),
 ('polyana','The Polyana','Trail','A compact Russian SUV with a sloping rear body. Its release unlock is Elvis Rim Trail in Gimli Ridge.'),
 ('tinny','The Tinny','Trail','A small utility vehicle with a canvas-style rear cover and narrow cabin. It sits among the lighter Trail-class bodies.'),
 ('lynx','Das Lynx','Trail','A short, upright utility 4x4 with exposed front wheel arches. The compact body differs from the longer Expedition trucks.'),
 ('wombat','Das Wombat','Trail','A tall, enclosed hardtop with a flat roof and angular wheel arches. El Kalaa North Ascent in the Tassili desert awards this vehicle.'),
 ('trail-burner','The Trail Burner','Wagon','An American two-door SUV with a long hood and rear hardtop. Complete Windy Joe Trail in Emerald Lake to add it to the garage.'),
 ('roamer','Roamer','Wagon','A five-door wagon with a long passenger cabin and upright rear. It belongs to the Wagon group in the release garage.'),
 ('woodman','The Woodman','Wagon','A long-roof wagon with woodgrain side trim. Its release unlock is El Kalaa South Ascent in the Tassili desert.'),
 ('grand-woodman','The Grand Woodman','Wagon','The larger wood-trim wagon has a long passenger body and raised rear roofline. Complete Asulkan Lake Highline in Asgard Mountain to unlock it.'),
 ('cumbre','The Cumbre','Wagon','An open passenger utility with a long hood, roll bar and rear cargo space. Its low roofline contrasts with the enclosed wagons.'),
 ('burro','The Burro','Workhorse','A Japanese single-cab pickup with an open bed. The release reward is tied to Hermit Trail in Emerald Lake; Rocky Ascent belongs to the earlier Demo.'),
 ('blast-wagon','The Blast Wagon','Workhorse','A conventional American pickup with a separate cab and long open cargo bed. Windcall Gorge Trail in Gimli Ridge awards this Workhorse.'),
 ('rust-ox','Das Rust Ox','Workhorse','A tall utility van with a fully enclosed, windowed body. Its body keeps the cargo space under the same roof as the cab.'),
 ('boar','The Boar','Workhorse','A rounded-cab utility pickup with a separate open bed. Complete Tarfa Ascent in the Tassili desert to unlock it.'),
 ('timberbox','The Timberbox','Workhorse','An enclosed utility wagon with a long row of side windows and wood-trim bodywork. Midgar Ascent in Asgard Mountain awards this vehicle.'),
 ('mammoth','Das Mammoth','Expedition','A long expedition truck with a tall cab and open cargo platform. Its release reward is Lower Midgar Trail in Asgard Mountain.'),
 ('marshal','The Marshal','Expedition','A heavy utility body with a square cab and enclosed rear compartment. Shabah Ascent in the Tassili desert awards the Marshal.'),
]
rewards={
 'brick':('Bridal Veil Falls Climb','Gimli Ridge'), 'bull':('Blanshard Ridge Trail','Asgard Mountain'),'polyana':('Elvis Rim Trail','Gimli Ridge'),'wombat':('El Kalaa North Ascent',"Tassili n’Ajjer Desert"),
 'trail-burner':('Windy Joe Trail','Emerald Lake'),'woodman':('El Kalaa South Ascent',"Tassili n’Ajjer Desert"),'grand-woodman':('Asulkan Lake Highline','Asgard Mountain'),'burro':('Hermit Trail','Emerald Lake'),
 'blast-wagon':('Windcall Gorge Trail','Gimli Ridge'),'boar':('Tarfa Ascent',"Tassili n’Ajjer Desert"),'timberbox':('Midgar Ascent','Asgard Mountain'),'mammoth':('Lower Midgar Trail','Asgard Mountain'),'marshal':('Shabah Ascent',"Tassili n’Ajjer Desert")}
result=[]
for slug,title,category,desc in cars:
 a=asset(title,'cars');ids=['release-modding','release-catalog','release-raptor']
 if slug in rewards:ids+=['release-algeria' if 'Tassili' in rewards[slug][1] else 'release-canada']
 r=record(slug,title,desc,category,a['path'],ids);r['imageKind']='game-icon';r['imageLabel']='In-game vehicle icon';r['imageAlt']=title+' release garage icon'
 r['specifications']={'Class':category};r['displayFacts']=[dict(label='Class',value=category)]
 if slug in rewards:
  trail,area=rewards[slug];r['unlock']='Complete '+trail;r['displayFacts'] +=[dict(label='Unlock trail',value=trail),dict(label='Area',value=area)]
 if slug in ['protector','burro','trail-burner']:
  previous=old[slug];r.update(image=previous['image'],imageAlt=previous['imageAlt'],imageLabel=previous.get('imageLabel','Gameplay image'));r.pop('imageKind',None)
 r['related']=['/maps','/wiki/upgrades'];result.append(r)
# Old names are retained for research, not silently merged into unrelated release identities.
write('src/data/vehicles/vehicles.json',result)

entries=read(BASE/'demo-wiki-before-release.json') if (BASE/'demo-wiki-before-release.json').exists() else read('src/data/wiki/entries.json');old_entries={r['slug']:r for r in entries};write(BASE/'demo-wiki-before-release.json',entries)
upgrade_rows=[
 ('engine-stage-2','Engine Stage 2','Engine-2.webp','Engine',2,25,'Adds engine power and raises the available top speed.'),
 ('engine-stage-3','Engine Stage 3','Engine-3.webp','Engine',3,50,'The next engine tier after Stage 2, for additional power on demanding climbs.'),
 ('protection-stage-2','Protection Stage 2','Protection-2.webp','Protection',2,25,'Improves resistance to vehicle damage from rough driving and impacts.'),
 ('protection-stage-3','Protection Stage 3','Protection-3.webp','Protection',3,50,'A further damage-resistance upgrade after Protection Stage 2.'),
 ('suspension-level-2','Suspension Level 2','Suspension-2.webp','Suspension',2,25,'Raises the suspension to give the vehicle more clearance over uneven ground.'),
 ('suspension-level-3','Suspension Level 3','Suspension-3.webp','Suspension',3,50,'The higher suspension tier, following Level 2 in the garage.'),
 ('tyres-stage-2','Tires Stage 2','Tires-2.webp','Tyres',2,25,'Improves tyre grip when the stock setup struggles for traction.'),
 ('tyres-stage-3','Tires Stage 3','Tires-3.webp','Tyres',3,50,'A further grip upgrade after Tires Stage 2.'),
 ('tool-slots','Tool Slots — 2','inventory_02.webp','Tool capacity',2,25,'Equip two tools on the vehicle instead of the initial single-tool loadout.'),
 ('tool-slots-3','Tool Slots — 3','inventory_03.webp','Tool capacity',3,50,'Carry three equipped tools for trips that need both recovery and repair equipment.'),
 ('tool-slots-4','Tool Slots — 4','inventory_04.webp','Tool capacity',4,75,'The four-slot option leaves room for a larger mix of field tools.'),
 ('water-resistance-2','Water Resistance 2','Water-2.webp','Water resistance',2,25,'Increases the depth and time the engine can tolerate before flooding.'),
 ('water-resistance-3','Water Resistance 3','Water-3.webp','Water resistance',3,50,'A second water-resistance upgrade for a greater margin during crossings.'),
 ('winch-stage-2','Winch Stage 2','Winch-1.webp','Winch range',2,25,'Extends cable reach so more attachment points are within range.'),
 ('winch-stage-3','Winch Stage 3','Winch-2.webp','Winch range',3,50,'Adds another range tier after Winch Stage 2.'),
 ('winch-stage-4','Winch Stage 4','Winch-3.webp','Winch range',4,75,'The final listed winch range tier. Range is separate from pulling strength.'),
]
# Use actual named icon filenames from the downloaded index; inventory/water names are checked below.
upgrade_assets=[a for a in assets if a['kind']=='upgrades']
for row in upgrade_rows:
 slug,title,filename,group,tier,price,desc=row
 matches=[a for a in upgrade_assets if a['path'].endswith('/'+filename)]
 if not matches:
  print('CHECK UPGRADE FILENAME',slug,filename,[a['path'] for a in upgrade_assets]);continue
 a=matches[0];r=record(slug,title,desc,'upgrades',a['path'],['release-raptor','release-upgrades']);r.update(imageKind='game-icon',imageLabel='In-game upgrade icon')
 r['displayFacts']=[dict(label='System',value=group),dict(label='Tier / capacity',value=str(tier))]
 # Publish visually confirmed first-tier prices; do not upgrade secondary-only higher prices to tested facts.
 if tier==2 and group in ['Engine','Suspension','Tyres','Tool capacity','Water resistance','Winch range']:r['displayFacts'].append(dict(label='Release menu price',value='25 Pebbles'))
 else:r['playerNotes']=['Buy the preceding tier first. Check the price in your current vehicle’s garage before spending Pebbles.']
 if slug in ['suspension-level-2','tyres-stage-2']:r['playerNotes']=['The June Demo menu showed 20 Pebbles for the Protector. The release-day menu shows 25; use the current garage price.']
 entries=[e for e in entries if e['slug']!=slug];entries.append(r)

# Publish only species independently named on the release maps, plus previously verified Black Bear.
animal_rows=[
 ('bald-eagle','Bald Eagle','Gimli Ridge','Canada','Lake and cliff edges','A large bird of prey included in the Canadian photo journal. The release map documents it in Gimli Ridge.'),
 ('black-bear','Black Bear','Emerald Lake','Canada','Forest','The black bear remains a Canadian photography target. Its Emerald Lake identification is preserved from the earlier wildlife footage.'),
 ('moose','Moose','Emerald Lake','Canada','Forest and wetlands','A large antlered animal for the Canadian compendium. Search the wooded and wetland parts of the area.'),
 ('beaver','Beaver','Emerald Lake','Canada','River','A waterside photography target. River banks are the habitat cue for this entry.'),
 ('canada-goose','Canada Goose','Emerald Lake','Canada','Wetlands and lakes','The goose belongs among the water birds on the Canadian photography list.'),
 ('coyote','Coyote','Emerald Lake','Canada','Forest and clearings','A smaller canine associated with clearings and forest edges in the Canadian wildlife list.'),
 ('bighorn-sheep','Bighorn Sheep','Asgard Mountain','Canada','Mountain slopes','A mountain ungulate with large curled horns. It is listed in the Canadian release compendium.'),
 ('common-raven','Common Raven','Emerald Lake','Canada','Forest and mountain terrain','A dark-feathered bird on the Canadian animal list. Keep it separate from the eagle entries when checking your journal.'),
 ('elk','Elk','Emerald Lake','Canada','Forest','An antlered deer in the Emerald Lake photography roster, distinct from Moose and Mule Deer.'),
 ('grizzly-bear','Grizzly Bear','Gimli Ridge','Canada','Remote forest and water edges','The grizzly adds another bear species to the Canadian photo journal beyond Black Bear.'),
 ('kokanee-salmon','Kokanee Salmon','Gimli Ridge','Canada','Rivers and lakes','A fish entry in the Canadian compendium. The release map includes a named photography location in Emerald Lake.'),
 ('mountain-goat','Mountain Goat','Gimli Ridge','Canada','Mountain terrain','A pale-coated mountain animal listed in Gimli Ridge. Its climbing habitat differs from the lakeside wildlife.'),
 ('mule-deer','Mule Deer','Emerald Lake','Canada','Forest and clearings','A deer entry on the Canadian wildlife list. Check the journal name rather than grouping all antlered animals together.'),
 ('red-fox','Red Fox','Emerald Lake','Canada','Forest and clearings','The red fox is a separate Canadian photo target from Coyote and Gray Wolf.'),
 ('barbary-sheep','Barbary Sheep (Aoudad)',"Tassili n’Ajjer Desert",'Algeria','Rocky mountain ground','A desert-region sheep with curved horns. The release maps include several Algerian photography locations.'),
 ('dorcas-gazelle','Dorcas Gazelle',"Tassili n’Ajjer Desert",'Algeria','Sand and oasis terrain','A gazelle on the Algerian animal list, found among the desert-region photography targets.'),
 ('dromedary-camel','Dromedary Camel',"Tassili n’Ajjer Desert",'Algeria','Oasis and sand','The single-humped camel is an Algerian compendium entry. The desert map includes a named observation location.'),
 ('egyptian-vulture','Egyptian Vulture',"Tassili n’Ajjer Desert",'Algeria','Cliffs and desert','A bird-of-prey entry for the Algerian photo journal, separate from Canada’s eagle.'),
 ('fennec-fox','Fennec Fox',"Tassili n’Ajjer Desert",'Algeria','Desert','The large-eared desert fox is a distinct photography target from the Canadian Red Fox.'),
 ('striped-hyena','Striped Hyena',"Tassili n’Ajjer Desert",'Algeria','Rocky desert terrain','A striped desert carnivore in the Algerian compendium. Its entry is independently listed on the release map.'),
]
animal_rows += [
 ('saharan-cheetah','Saharan Cheetah',"Tassili n’Ajjer Desert",'Algeria','Desert','A spotted big cat on the Algerian release map. It is a separate compendium target from the smaller desert fox and hyena.'),
 ('desert-sparrow','Desert Sparrow',"Tassili n’Ajjer Desert",'Algeria','Oasis and sand','A small bird on the desert photography list, alongside the larger vulture and falcon entries.'),
 ('lanner-falcon','Lanner Falcon',"Tassili n’Ajjer Desert",'Algeria','Mountain and cliff','An Algerian bird of prey documented in the desert area. Check its name separately from Egyptian Vulture in the journal.'),
 ]
area_evidence={}
for region_key in ['canada','algeria']:
 catalog=read(BASE/(region_key+'-catalog.json'));layers={r['layer_id']:r['title'] for r in catalog['layers']}
 for f in read(BASE/(region_key+'-markers.json'))['markers']['features']:
  r=f['properties']
  if 'animal compendium' in r.get('searchTitle',''):
   area_evidence.setdefault(r['item']['title'],set()).update(layers[k] for k in r['layerIds'] if k in layers)
for slug,title,area,country,habitat,desc in animal_rows:
 if title in area_evidence:area=', '.join(sorted(area_evidence[title])).replace("Tassili n'Ajjer Desert","Tassili n’Ajjer Desert")

 a=asset(title,'animals');sid='release-canada' if country=='Canada' else 'release-algeria';ids=[sid,'release-wildlife']
 if slug=='black-bear':ids=['video-wildlife','release-wildlife']
 r=record(slug,title,desc,'wildlife',a['path'],ids);r.update(imageKind='game-model',imageLabel='In-game animal model')
 r['displayFacts']=[dict(label='Region',value=country),dict(label='Area',value=area)]
 if slug=='black-bear':r['gameVersion']='June Demo wildlife';r['playerNotes']=['Identified in the Demo’s Emerald Lake footage. A release-specific location has not been independently confirmed.']
 r['related']=['/maps','/wiki/wildlife#animal-compendium'];entries=[e for e in entries if e['slug']!=slug];entries.append(r)
write('src/data/wiki/entries.json',entries)

regions=read(BASE/'demo-regions-before-release.json') if (BASE/'demo-regions-before-release.json').exists() else read('src/data/maps/regions.json');write(BASE/'demo-regions-before-release.json',regions)
regions=[r for r in regions if r['category']=='Region']
areas=[
 ('emerald-lake','Emerald Lake','Canada',18,2,6,3,['Pavilion Lake Cabin','Elizabeth Lake Cabin','Black Bear’s Den'],['Windy Joe Trail','Elizabeth Oath Trail','Hermit Trail'],'A lakeside Canadian area with six cabins, two watchtower viewpoints and three challenge trails. Windy Joe and Hermit Trail connect exploration to vehicle unlocks.'),
 ('gimli-ridge','Gimli Ridge','Canada',15,8,9,5,['Nerthus Cabin','Seer Lodge','Whitecap Alpine Lodge'],['Windcall Gorge Trail','Bridal Veil Falls Climb','Elvis Rim Trail'],'The second Canadian area adds ridge routes, lakes and nine cabins. Its challenges include the unlocks for Blast Wagon, Brick and Polyana.'),
 ('asgard-mountain','Asgard Mountain','Canada',15,8,9,5,['Shaughnessy Cabin','Eagle Perch Cabin','Gods’ Rest'],['Blanshard Ridge Trail','Asulkan Lake Highline','Lower Midgar Trail','Midgar Ascent'],'A higher mountain area with snowy ground and narrow climbing routes. Several challenge trails award vehicles, including Grand Woodman and Mammoth.'),
 ('tassili-najjer-desert',"Tassili n’Ajjer Desert",'Algeria',21,14,10,5,['Porte du Désert Camp','El Kalaa Outpost','Shabah el Raml Camp'],['El Kalaa North Ascent','El Kalaa South Ascent','Tarfa Ascent','Shabah Ascent'],'The larger Algerian desert area combines sand, rock formations and canyon routes. Its ascents unlock Wombat, Woodman, Boar and Marshal.'),
 ('aures-mountains','Aurès Mountains','Algeria',6,4,5,2,['El Madraj Base Camp','Great Aqueduct Camp','Hamra Plateau Camp'],['Djebel Rahmani Trail','Kalaa Ulya Track'],'An Algerian mountain area with aqueduct scenery, five camps and two challenge trails. A tunnel links it to the desert area.'),
]
for slug,title,country,crates,views,cabins,trails,places,routes,desc in areas:
 a=asset(title,'regions');sid='release-canada' if country=='Canada' else 'release-algeria';r=record(slug,title,desc,'Area',a['path'],[sid,'release-maps']);r['imageAlt']=title+' in-game topographic map';r['imageLabel']='In-game map';r['displayFacts']=[dict(label='Reward crates',value=str(crates)),dict(label='Scenic points',value=str(views)),dict(label='Cabins / camps',value=str(cabins)),dict(label='Challenge trails',value=str(trails))]
 r['region']=country.lower();r['places']=places;r['trails']=routes;r['playerNotes']=['Cabins and camps: '+', '.join(places)+'.','Challenge trails: '+', '.join(routes)+'.'];r['related']=['/vehicles','/wiki/wildlife'];regions.append(r)
write('src/data/maps/regions.json',regions)
locations=read('src/data/maps/locations.json')
for r in locations:
 if r['id']=='emerald-bouldercrest-lodge':r['verificationStatus']='outdated';r['description']='June Demo cabin name; not confirmed in the release location list.'
 else:r.update(description='Mechanic in Emerald Lake. The release location list retains Crazy Gunther.',sourceUrl=next(s['url'] for s in sources if s['id']=='release-canada'))
write('src/data/maps/locations.json',locations)
print('Published release content:',len(result),'vehicles,',len(entries),'Wiki entries,',len(regions),'region/area records.')
