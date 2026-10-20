"""Curated, one-off enrichment. Read evidence; never execute a source site's code."""
import json, re, math, hashlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
def read(path): return json.loads(path.read_text(encoding='utf8'))
def save(path, data): path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf8')
def detail(kind, slug):
    return next(value for key, value in read(HERE/f'{kind}-{slug}.json').items() if key not in ['oth-levels-en','oth-animals-en'])
def norm(s): return re.sub('[^a-z0-9]', '', s.lower()).removeprefix('the').removesuffix('v1')
def fact(label, value): return {'label':label, 'value':str(value)}
def checked(record, source):
    record['sourceIds'] = list(dict.fromkeys(record.get('sourceIds', [])+[source]))
    record['lastVerifiedAt'] = record['updatedAt'] = '2026-10-19'
    record['gameVersion'] = 'Steam release — October 2026'

assets=read(HERE/'assets.json')
assert len(assets)==110 and all('path' in row for row in assets)
assert len(set(row['sha256'] for row in assets))==110
images={(row['kind'],row['key']):row['path'] for row in assets}
db_cars={row['itemId']:row for row in read(HERE/'db-data-0.json')}
db_animals={row['itemId']:row for row in read(HERE/'db-data-1.json')}
db_engines={row['id']:row for row in read(HERE/'db-data-2.json')}
db_classes={row['id']:row for row in read(HERE/'db-data-3.json')}
db_rewards={row['id']:row for row in read(HERE/'db-data-8.json')}
proof={'vehicles':[], 'animals':[], 'upgrades':[], 'achievements':[], 'excluded':[]}

vehicle_rows=read(ROOT/'src/data/vehicles/vehicles.json')
mr_vehicles=read(HERE/'vehicles.json')['oth-vehicles-en']
for row in vehicle_rows:
    match=next(v for v in mr_vehicles if norm(v['name'])==norm(row['title']))
    d=detail('vehicles',match['slug']); other=db_cars[d['itemId']]; category=db_classes[other['carConfig']]
    assert d['category']['name']==category['category']==row['category']
    assert d['country']['code']==other['country']
    assert d['category']['mass']==category['mass']
    assert math.isclose(d['stats']['steering'],category['steering']['maxSteerAngle'],abs_tol=0.001)
    assert math.isclose(d['stats']['suspensionTravel'],other['suspension']['suspensionTravel'],abs_tol=0.001)
    assert math.isclose(d['stats']['wheelRadius'],other['suspension']['radius'],abs_tol=0.001)
    stages=[]
    for i,engine in enumerate(d['engines']):
        db=db_engines[category['engineTiers'][i]]
        assert engine['torque']==db['engine']['peakRpmTorque']
        # Rounded speed limiter setting, not a measured terrain speed.
        assert engine['topSpeed']==math.floor(db['speedControl']['speedLimit']*3.6+0.5)
        assert engine['rpm']==[db['engine']['idleRpm'],db['engine']['peakRpm'],db['engine']['maxRpm']]
        stages.append({'stage':'Stock' if i==0 else f'Stage {i+1}', 'torque':engine['torque'], 'speedCap':engine['topSpeed']})
    colours=[l['name'].removesuffix(' Livery') for l in d['liveries'] if l.get('source',{}).get('default')]
    distances=[str(l['source']['km']) for l in d['liveries'] if l.get('source',{}).get('km')]
    row['specifications']={'Class':row['category'],'Country':d['country']['name'],'Stock mass':f"{d['category']['mass']:,} kg",'Stock torque':f"{stages[0]['torque']} N·m",'Stock speed cap':f"{stages[0]['speedCap']} km/h",'Steering angle':f"{d['stats']['steering']}°",'Suspension travel':f"{round(d['stats']['suspensionTravel']*100)} cm",'Wheel radius':f"{round(d['stats']['wheelRadius']*100)} cm"}
    row['displayFacts']=[fact(k,v) for k,v in row['specifications'].items()]+[fact('Unlock',row.get('unlock','Starting vehicle'))]
    row['engineStages']=stages
    row['referenceImage']=images['vehicles',d['key']]
    row['referenceImageAlt']=d['name']+' stock game model'
    row['detailFacts']=[fact('Factory colours',', '.join(colours)),fact('Distance liveries',', '.join(distances)+' km on this vehicle')]
    checked(row,'maprunner-vehicles')
    proof['vehicles'].append({'id':row['id'],'gameItemId':d['itemId'],'page':'https://www.maprunner.info/overthehill/vehicles/'+match['slug'],'crossCheckedFields':['country','class','mass','steering','suspensionTravel','wheelRadius','engineTorque','speedLimiter','rpm'],'engineStages':stages})
save(ROOT/'src/data/vehicles/vehicles.json',vehicle_rows)

entries=read(ROOT/'src/data/wiki/entries.json')
area_names={'R1A1_Valley':'Emerald Lake','R1A2_Wetlands':'Gimli Ridge','R1A3_Ridge':'Asgard Mountain','R2A1_Desert':"Tassili n’Ajjer Desert",'R2A2_Canyon':'Aurès Mountains'}
animal_copy={
'BaldEagle':'Scan the lakes and cliffs of Gimli Ridge and Asgard Mountain for this large bird. Keep it in view as you line up the camera rather than driving straight toward it.',
'BarbarySheepAoudad':'The rocky slopes of both Algerian areas are home to the aoudad. Mountain and rock habitats are the places to check when the desert floor is quiet.',
'Beaver':'Beavers are a night-time river search across all three Canadian areas. A daytime pass along the same water may leave this Compendium entry unfinished.',
'BighornSheepMale':'Look on forested mountain terrain in Gimli Ridge and Asgard Mountain. This is a different Compendium entry from Algeria’s Barbary sheep.',
'BlackBear':'Black bears can appear in the forests of Emerald Lake and Gimli Ridge. They are rare, with both daytime and night listed as active periods in dry weather.',
'CanadaGoose':'Check the wetlands and lakes of Emerald Lake and Gimli Ridge during the day. Dry weather is the listed condition for this water bird.',
'CommonRaven':'Ravens are found across Canada’s three areas, in forests and mountain habitats. They offer a bird subject to watch for while working through the higher trails.',
'Coyote':'Coyotes have locations in Emerald Lake and Gimli Ridge. Watch forest edges and clearings in dry weather, with both day and night listed as active periods.',
'Desert SparrowInfo':'The desert sparrow is a small bird associated with oasis and sand habitats. Check both Algerian areas rather than mistaking this entry for a Canadian bird.',
'DorcasGazelle':'The Aurès Mountains are the confirmed area for Dorcas gazelles. Search river, oasis and sand habitats in dry weather; both day and night are listed.',
'DromedaryCamel':'Dromedaries belong to the Tassili n’Ajjer Desert area. Check its sand and oasis habitats before heading into the Aurès Mountains for a different animal.',
'EgyptianVulture':'This rare bird has locations in both Algerian areas. Watch cliff and sand habitats during the day, with dry weather as its listed condition.',
'Elk':'Elk appear in Emerald Lake and Asgard Mountain. Search forest and mountain habitats; Gimli Ridge is not one of their listed areas.',
'Fennec FoxI':'The fennec fox has locations in Tassili n’Ajjer Desert. Check river and sand habitats in dry weather; its active period includes both daytime and night.',
'Flamingo':'Head to the oases of the Aurès Mountains for flamingos. This daytime bird needs dry conditions and is a separate Compendium entry from Algeria’s sparrows, falcons and vultures.',
'GrayWolf':'Gray wolves are a night-time forest subject in Emerald Lake and Asgard Mountain. Both dry and wet conditions are listed for this uncommon animal.',
'GrizzlyBear':'Grizzlies have locations in Gimli Ridge and Asgard Mountain. Search remote forest, river and lake habitats during the day in dry weather.',
'Jackal':'Jackals are a night-time photography target in the Aurès Mountains. Keep that area requirement in mind when planning a trip for Algeria’s smaller mammals.',
'KokaneeSalmon':'Look in the rivers and lakes of Emerald Lake and Asgard Mountain for Kokanee salmon. Dry weather is listed, with sightings possible in both daytime and night.',
'LannerFalcon':'Lanner falcons have locations in both Algerian areas. Mountain and cliff habitats in dry daytime conditions are the places to watch for this uncommon bird.',
'Moose':'Moose appear in forest and wetland habitats in Emerald Lake and Gimli Ridge. Both day and night are listed, and either dry or wet weather can fit the search.',
'MountainGoat':'Mountain goats are found in Gimli Ridge and Asgard Mountain. Their mountain habitat puts this daytime photography target alongside the steeper Canadian routes.',
'MuleDeerMale':'Mule deer occupy forest and clearing habitats in Emerald Lake and Gimli Ridge. They are one of the common mammals to watch for between cabin stops.',
'RedFoxInfo':'Red foxes have locations in Emerald Lake and Asgard Mountain. Keep an eye on forest and clearing habitats as the route leaves open mountain ground.',
'SaharanCheetah':'The Saharan cheetah is a legendary Tassili n’Ajjer Desert animal. Its area and conditions matter more than searching every Algerian landscape without a plan.',
'Sasquatch':'Sasquatch is a legendary, night-time Emerald Lake subject. Remote Forest is its habitat label; it does not define a guaranteed distance from a cabin or a reliable spawn trick.',
'StripedHyenaInfo':'Striped hyenas can appear in both Algerian areas. Plan around their night-time activity and check the listed weather before starting the search.',
}
for match in read(HERE/'animals.json')['oth-animals-en']:
    d=detail('animals',match['slug']);other=db_animals[d['itemId']]
    row=next(r for r in entries if r['category']=='wildlife' and norm(r['title'])==norm(d['name']))
    assert set(d['areas'])==set(other['areas'])
    for key in ['habitat','weather','timeOfDay']:
        assert {norm(v['label']) for v in d[key]}=={norm(v) for v in other[key]},(d['name'],key)
    assert d['class']['label']==other['class']
    assert norm(d['rarity']['label'].replace('Legendary','Very Rare'))==norm(other['rarity'])
    reward=next(v['count'] for v in d['rewards'] if v['key']=='Money')
    assert reward==next(v['count'] for v in db_rewards[other['reward']]['rewards'] if v['item']=='Money')
    row['description']=animal_copy[d['key']]
    row['sections']=[{'heading':d['name'],'paragraphs':[row['description']]}]
    row['image']=images['animals',d['key']];row['imageAlt']=d['name']+' game model in Over the Hill';row['imageKind']='game-model';row['imageLabel']='Game model'
    row['listGroup']='Bird' if d['key']=='Flamingo' else d['class']['label']
    row['displayFacts']=[fact('Rarity',d['rarity']['label']),fact('Documented areas',' · '.join(area_names[a] for a in d['areas'])),fact('Habitat',', '.join(v['label'] for v in d['habitat'])),fact('Active time',', '.join(v['label'] for v in d['timeOfDay'])),fact('Weather',', '.join(v['label'] for v in d['weather'])),fact('First photo',f'{reward} Pebbles')]
    row['playerNotes']=['Birdwatcher credit for Flamingo is not confirmed; use the other listed birds when working on that goal.'] if d['key']=='Flamingo' else []
    row['seo']['description']=row['description']
    row['facts']=[dict(v,sourceId='maprunner-animals') for v in row['displayFacts']]
    checked(row,'maprunner-animals')
    proof['animals'].append({'id':row['id'],'gameItemId':d['itemId'],'page':'https://www.maprunner.info/overthehill/animals/'+match['slug'],'crossCheckedFields':['areas','habitat','weather','timeOfDay','class','rarity','firstPhotoReward']})

upgrade_map={'Engine_stage_2':'engine-stage-2','Engine_stage_3':'engine-stage-3','ToolSlot_1':'tool-slots','ToolSlot_2':'tool-slots-3','ToolSlot_3':'tool-slots-4','SuspensionLift_stage_2':'suspension-level-2','SuspensionLift_stage_3':'suspension-level-3','WaterResistance_2':'water-resistance-2','WaterResistance_3':'water-resistance-3','Tire_2':'tyres-stage-2','Tire_3':'tyres-stage-3','Winch_2':'winch-stage-2','Winch_3':'winch-stage-3','Winch_4':'winch-stage-4','Protection_stage_2':'protection-stage-2','Protection_stage_3':'protection-stage-3'}
effects={'_TOOL_SLOTS':'Total tool slots','_SUSPENSION_TRAVEL':'Suspension travel','_FLOOD_TIME':'Time before flooding','_GRIP':'Grip coefficient','_WINCH_RANGE':'Winch range','_DAMAGE_TAKEN':'Damage taken'}
upgrade_copy={
'engine-stage-2':'The first engine purchase improves torque and raises the speed limiter. The result depends on the vehicle class; Trail and Expedition engines do not gain the same numbers.',
'engine-stage-3':'The upper engine tier takes each class to its strongest listed engine setting. Compare the Stage 3 torque in the vehicle list before choosing which rig to finish.',
'tool-slots':'Carry two equipped tools instead of the stock capacity. This is the first inventory purchase, not two extra slots added to the vehicle.',
'tool-slots-3':'The second inventory purchase raises total capacity to three tools. It gives a recovery loadout room for another piece of field gear.',
'tool-slots-4':'Four tools is the highest listed inventory capacity. This final slot costs more than either of the earlier inventory purchases.',
'suspension-level-2':'Add 8 cm to the stock suspension travel. The upgrade changes suspension travel rather than promising a fixed increase in clearance beneath every part of the body.',
'suspension-level-3':'The upper suspension tier adds 16 cm of travel relative to stock. Its listed effect replaces the earlier tier’s 8 cm value.',
'water-resistance-2':'Increase the listed time before engine flooding by 50% relative to stock. The vehicle can still flood; this is extra tolerance rather than waterproofing.',
'water-resistance-3':'Double the listed stock flooding time. The final water-resistance tier gives more recovery time without making deep water harmless.',
'tyres-stage-2':'Add 0.08 to the tyre grip coefficient. This value is a coefficient adjustment, not an 8% speed or climbing bonus.',
'tyres-stage-3':'The upper tyre tier adds 0.16 to stock grip. Do not add the earlier tier’s 0.08 again when comparing the final setup.',
'winch-stage-2':'Reach attachment points 15% farther away than with the stock winch. Range changes do not establish a higher pulling force.',
'winch-stage-3':'Extend winch reach by 30% relative to stock. This is the middle range upgrade, before the longer Stage 4 cable reach.',
'winch-stage-4':'The final winch tier extends reach by 50% relative to stock. It is a range upgrade, not a stronger winch motor or a guaranteed recovery from every angle.',
'protection-stage-2':'Reduce damage taken by 15% relative to the stock setup. Protection helps with impacts but does not remove the need to repair the vehicle.',
'protection-stage-3':'The upper protection tier reduces listed damage taken by 30%. Its value is the final stock-relative modifier, not another 30% stacked onto Stage 2.',
}
upgrades=read(HERE/'upgrades.json')['oth-items-upgrades-en']['items']
assert sum(u['price'] for u in upgrades)==675
for u in upgrades:
    row=next(r for r in entries if r['slug']==upgrade_map[u['key']])
    assert re.search(re.escape(u['name']), (HERE/'db-upgrades.html').read_text(encoding='utf8'))
    row['description']=upgrade_copy[row['slug']];row['sections']=[{'heading':row['title'],'paragraphs':[row['description']]}];row['listGroup']=u['type']['label']
    row['displayFacts']=[fact('System',u['type']['label']),fact('Release menu price',f"{u['price']} Pebbles"),fact('Applies to','All 21 release vehicles')]
    row['displayFacts'] += [fact(effects[v['label']],v['value']) for v in u.get('stats',[])]
    if u.get('engine'):
        for e in u['engine']:row['displayFacts'].append(fact(e['name']+' torque',f"{e['torque'][0]} → {e['torque'][1]} N·m"))
    row['playerNotes']=[note for note in row.get('playerNotes',[]) if 'June Demo' in note]
    row['seo']['description']=row['description'];checked(row,'maprunner-upgrades')
    row['facts']=[dict(v,sourceId='maprunner-upgrades') for v in row['displayFacts']]
    proof['upgrades'].append({'id':row['id'],'gameItemId':u['itemId'],'price':u['price'],'effect':u.get('stats',[]),'vehicleCount':len(u['vehicles'])})
for row in entries:
    if row['slug']=='upgrade-system':
        row['description']='Upgrade one vehicle at a time at the mechanic. Sixteen purchases across seven systems cost 675 Pebbles for a full set; that spending does not upgrade the rest of your garage.'
        row['playerNotes']=['Engine, suspension, tyres, protection and water resistance each have two purchased tiers. Inventory and winch range each have three.','The complete budget is 75 Pebbles for each two-tier system and 150 for each three-tier system. Earlier purchases count toward the 675 total.']
        row['displayFacts']=[fact('Systems',7),fact('Purchases per vehicle',16),fact('Full upgrade budget','675 Pebbles')];row['listGroup']='Upgrade basics';checked(row,'maprunner-upgrades')
    elif row['slug'] in ['tyres','liveries-and-cosmetics']:
        row['listGroup']='Upgrade basics'
        if row['slug']=='tyres': row['description']='The two purchased tyre stages add 0.08 or 0.16 to stock grip. All 21 release vehicles have these upgrades; body size and engine class remain separate considerations.'
    if row['slug']=='animal-compendium':
        row['description']='Photograph 27 confirmed animals across Canada and Algeria. Use the area, habitat, active time and weather fields to plan a search; rare and legendary entries need more than a casual drive past.'
        row['playerNotes']=['Use the Safari Camera to register an animal. Ordinary scenery photos and Compendium entries serve different purposes.','This list covers animals with confirmed release-area locations. Catalog-only creatures without a documented playable area are not added to the checklist.']
        row['listGroup']='Photography basics';checked(row,'maprunner-animals')
    if row['slug'] in ['upgrade-system','tyres','animal-compendium']:
        row['sections']=[{'heading':row['title'],'paragraphs':[row['description']]}]
save(ROOT/'src/data/wiki/entries.json',entries)

# Short original requirement wording. No achievement-timing guesses or inferred co-op credit.
requirements={
'WelcomeToTheWild':('First steps','Finish the opening tutorial.'),'FirstAid':('Recovery & driving','Finish recovering one vehicle.'),'UnderTheStars':('First steps','Make camp for the first time.'),'DirtBaptism':('Trails & exploration','Finish one challenge trail.'),'SayCheese':('Wildlife & photography','Register your first animal photograph.'),'NewHorizons':('Trails & exploration','Discover an exit leading out of an area.'),'GettingBetter':('Garage & equipment','Buy one vehicle upgrade.'),'ShinyRock':('Pebbles & meteorites','Extract a meteorite for the first time.'),'Explorer':('Trails & exploration','Reach 20 points of interest.'),'ScenicRoute':('Trails & exploration','Visit one scenic lookout.'),'OffTheBeatenPath':('Distance & conditions','Cover 50 km away from the road.'),'ManySmallSteps':('Distance & conditions','Reach a total driving distance of 100 km.'),'MakeALongJourney':('Distance & conditions','Reach a total driving distance of 1,000 km.'),'Collector':('Garage & equipment','Bring your unlocked vehicle count to six.'),'FleetOwner':('Garage & equipment','Bring your unlocked vehicle count to 18.'),'NobodyLeftBehind':('Recovery & driving','Tow another vehicle over a distance of 1 km.'),'CloseEncounter':('Wildlife & photography','Photograph a mammal while less than 10 m from it.'),'Birdwatcher':('Wildlife & photography','Photograph five or more different bird species.'),'AHandfulOfPebbles':('Pebbles & meteorites','Reach 100 Pebbles collected.'),'ASackOfPebbles':('Pebbles & meteorites','Reach 1,000 Pebbles collected.'),'MasterMechanic':('Garage & equipment','Finish every mechanical upgrade on one vehicle.'),'AllDressedUp':('Garage & equipment','Fit five or more cosmetic items at once.'),'BackToTheCabin':('Trails & exploration','Fast-travel to a cabin you have already unlocked.'),'ProblemSolver':('Recovery & driving','Complete ten vehicle recoveries.'),'HandyHelper':('Garage & equipment','Use a tool for the first time.'),'HeldByAThread':('Recovery & driving','Keep the entire vehicle hanging off the ground on its winch for ten seconds.'),'GetOutOfMySwamp':('Distance & conditions','Accumulate 20 km of driving on mud.'),'WetSocks':('Distance & conditions','Accumulate 5 km of driving through water.'),'Snowcat':('Distance & conditions','Accumulate 20 km of driving on snow.'),'SandSurfer':('Distance & conditions','Accumulate 20 km of driving on sand.'),'EnjoyTheJourney':('Distance & conditions','Accumulate 20 km with Low Range engaged.'),'CloseCall':('Recovery & driving','Use the winch to bring a completely submerged vehicle back out of the water.'),'ProfessionalDriver':('Recovery & driving','Roll your vehicle over.'),'BackOnTrack':('Recovery & driving','Get the vehicle back from a rollover.'),'StarCollector':('Pebbles & meteorites','Recover 20 meteorites.'),'AGiftFromTheStars':('Pebbles & meteorites','Collect a meteorite less than five minutes after it lands.'),'MorningDrive':('World & moments','Be there for a sunrise.'),'WishUponAStar':('World & moments','See a meteorite falling from the sky.'),'UnderTheWater':('Recovery & driving','Let the water-resistance gauge fill completely and shut the engine down.'),'NightWalker':('Distance & conditions','Accumulate 20 km of night driving.'),'Totaled':('Recovery & driving','Damage your vehicle until it is destroyed.'),'Odysseus':('Distance & conditions','Drive for one hour while staying away from cabins.'),'RareEncounter':('Wildlife & photography','Register a photograph of a rare animal.'),'TreasureHunter':('Trails & exploration','Open 50 loot crates.'),'NewStyle':('Garage & equipment','Fit a cosmetic item for the first time.'),'StormChaser':('Distance & conditions','Accumulate 20 km of driving in rain.'),'Naturalist':('Wildlife & photography','Finish the animal Compendium for one region.'),'WildlifeEnthusiast':('Wildlife & photography','Register photographs of 20 animals.'),'ATaleComeTrue':('Wildlife & photography','Register a photograph of a legendary animal.'),'NightWatcher':('Wildlife & photography','Photograph an animal classified as nocturnal.'),'NoisyNeighbor':('Wildlife & photography','Scare 20 different animals.'),'GoldenHour':('World & moments','Be there for a sunset.'),'CanadianPassport':('Trails & exploration','Finish the activities required for Canada’s regional completion.'),'AlgerianPassport':('Trails & exploration','Finish the activities required for Algeria’s regional completion.'),'MakingMemories':('Wildlife & photography','Take 20 photographs.'),'SoundtrackToTheJourney':('Distance & conditions','Drive 10 km with the music playing continuously.'),'TheTwelveLabours':('Trails & exploration','Finish 12 challenge trails.'),'TakingFlight':('Recovery & driving','Get your vehicle airborne in a jump.'),'SmoothRide':('Trails & exploration','Finish a challenge trail without damaging the vehicle.'),'LawOfTheLand':('Garage & equipment','Use blue paint together with either Red & Blue Beacons or a Red & Blue Beacon Bar.'),'AMountainOfPebbles':('Pebbles & meteorites','Reach 2,000 Pebbles collected.'),'SoundOfTheNature':('Distance & conditions','Drive 10 km with no music playing.')}
achievements=[]
for a in read(HERE/'achievements.json')['oth-achievements-en']:
    group,description=requirements[a['key']];slug=re.sub('[^a-z0-9]+','-',a['name'].lower()).strip('-')
    record={'id':'achievement-'+a['key'],'slug':slug,'title':a['name'],'description':description,'category':'achievements','listGroup':group,'hidden':a.get('hidden',False),'image':images['achievements',a['key']],'imageAlt':a['name']+' achievement artwork','imageKind':'game-icon','imageLabel':'Achievement artwork','sourceUrl':'https://www.maprunner.info/overthehill/achievements','sourceIds':['maprunner-achievements','steam'],'sourceType':'in-game','verificationStatus':'confirmed','gameVersion':'Steam release — October 2026','lastVerifiedAt':'2026-10-19','publishedAt':'2026-10-19','updatedAt':'2026-10-19','sections':[{'heading':a['name'],'paragraphs':[description]}],'related':['/vehicles'] if group=='Garage & equipment' else ['/wiki/wildlife'] if group=='Wildlife & photography' else ['/wiki/collectibles'] if group=='Pebbles & meteorites' else ['/maps'],'seo':{'title':a['name']+' - Over the Hill Achievement','description':description},'displayFacts':[fact('Category',group),fact('Visibility','Hidden achievement' if a.get('hidden') else 'Standard achievement')],'playerNotes':[]}
    achievements.append(record);proof['achievements'].append({'id':record['id'],'gameKey':a['key'],'requirement':a['description'],'hidden':a.get('hidden',False)})
assert len(achievements)==62 and len(set(a['slug'] for a in achievements))==62
save(ROOT/'src/data/wiki/achievements.json',achievements)

sources=read(ROOT/'src/data/sources/sources.json')
for kind in ['animals','vehicles','upgrades','achievements']:
    sid='maprunner-'+kind
    if not any(s['id']==sid for s in sources):sources.append({'id':sid,'title':'MapRunner — Over the Hill '+kind,'url':'https://www.maprunner.info/overthehill/'+('collectibles/upgrades' if kind=='upgrades' else kind),'publisher':'MapRunner','scope':'Named release entries and game-owned images; scalar fields reconciled with independent game-data records where available.','checkedAt':'2026-10-19'})
save(ROOT/'src/data/sources/sources.json',sources)
save(HERE/'field-verification.json',proof)
print('Updated',len(vehicle_rows),'vehicles,',len(proof['animals']),'animals,',len(proof['upgrades']),'upgrades and',len(achievements),'achievements.')
