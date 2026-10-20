"""Original editorial guides built from dated observations and checked game records."""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[3]


def section(heading, *paragraphs, **extra):
    return {"heading": heading, "paragraphs": list(paragraphs), **extra}


def picture(name, alt, caption, kind="diagram"):
    return {"src": "/images/guides/" + name, "alt": alt, "caption": caption, "kind": kind}


def record(slug, title, description, category, cover, sections, questions, related, seo, source_ids):
    text = " ".join(str(s) for s in sections)
    return {"id": slug, "slug": slug, "title": title, "description": description,
            "category": category, "image": cover, "imageAlt": "Over the Hill wilderness driving gameplay",
            "imageKind": "game-screenshot", "sourceUrl": "https://store.steampowered.com/app/2929250/over_the_hill/",
            "sourceIds": source_ids, "sourceType": "in-game", "verificationStatus": "confirmed",
            "gameVersion": "Steam release · October 2026", "lastVerifiedAt": "2026-10-20",
            "publishedAt": "2026-10-20", "updatedAt": "2026-10-20",
            "readingMinutes": max(6, round(len(text.split()) / 190)),
            "sections": sections, "questions": questions, "related": related, "seo": seo}


pebbles = record(
    "pebbles-upgrade-order", "Pebbles & Upgrade Order: Build a Better Trail Vehicle",
    "Spend your first 75 Pebbles where they help, understand the 675-Pebble upgrade budget, and earn more through first clears, repeat trails and meteorites.",
    "Pebbles & Upgrades", "/images/game/screenshot-07.webp", [
        section("Start with one vehicle and one problem",
            "A truck that cannot climb a muddy bank does not need a shopping list of everything in the garage. It needs you to work out whether the wheels are spinning, the engine is struggling, or the body is hanging on a rock. Spending against that problem makes the next trip easier to judge.",
            "Pick a vehicle you enjoy driving and give it a few trips before spreading Pebbles across the whole garage. You will unlock more cars, but each new project brings another set of upgrades to pay for. Keep enough currency for the part that fixes the obstacle in front of you.",
            callout={"title": "A sensible first 75 Pebbles", "text": "Engine Stage 2, Tires Stage 2 and the second tool slot cost 25 Pebbles each. This is a suggested starting budget, not a requirement: swap the tool slot for Suspension Level 2 if grounding on rocks is the problem and your present loadout already fits."}),
        section("What to buy first: use the failed attempt as your shopping list",
            "Take another look at the spot where you stopped making progress. Wheelspin calls for a different response from a chassis resting on the crest of a rock. A longer winch also changes what you can reach; it does not turn an awkward pull into a better driving line.",
            "Low range and a cleaner approach are worth trying before another purchase. When you do upgrade, return to a familiar obstacle. You will learn more from one repeat attempt than from changing five systems and immediately driving somewhere else.",
            table={"headers": ["What is going wrong?", "Useful next purchase", "What still needs care"], "rows": [
                ["Wheels spin on a climb", "Tires Stage 2: 25 Pebbles", "Choose a line with contact under the tyres; the upgrade is not a grip guarantee."],
                ["The engine struggles to keep pulling", "Engine Stage 2: 25 Pebbles", "Use low range and avoid arriving sideways at the steepest part."],
                ["The underside catches on rocks", "Suspension Level 2: 25 Pebbles", "Try moving a wheel onto the rock instead of straddling it."],
                ["Your chosen equipment will not fit", "Second tool slot: 25 Pebbles", "Decide what you actually need for this trip."],
                ["Useful anchors are out of reach", "Winch Stage 2: 25 Pebbles", "Look for a pull that moves the vehicle onto better ground."],
                ["Repeated impacts are ending trips", "Protection Stage 2: 25 Pebbles", "Slow down on descents; protection reduces damage rather than removing it."]
            ]}),
        section("Read the stage numbers before paying",
            "The stock engine is Stage 1. The first engine purchase is called Stage 2 and costs 25 Pebbles; Stage 3 is the next purchase at 50. That second purchase costs 50 by itself, so reaching Engine Stage 3 from stock costs 75 in total.",
            "Inventory names work differently: the purchases give you two, three and four total tool slots. Do not read the final inventory upgrade as four extra slots. Winch upgrades have a third paid stage, which is one reason the full budget is larger than seven lots of 75.",
            image=picture("upgrade-budget.svg", "Seven upgrade systems with sequential prices adding to 675 Pebbles", "Full budget from stock: five systems cost 75 Pebbles each; winch and tool capacity cost 150 each."),
            table={"headers": ["Upgrade system", "Successive purchase prices", "Total from stock"], "rows": [
                ["Engine", "25 + 50", "75 Pebbles"], ["Tires", "25 + 50", "75 Pebbles"],
                ["Suspension", "25 + 50", "75 Pebbles"], ["Protection", "25 + 50", "75 Pebbles"],
                ["Water resistance", "25 + 50", "75 Pebbles"], ["Winch", "25 + 50 + 75", "150 Pebbles"],
                ["Tool slots", "25 + 50 + 75", "150 Pebbles"], ["All 16 purchases", "Seven systems", "675 Pebbles"]
            ]}, links=[{"label": "Check individual upgrade effects", "href": "/wiki/upgrades"}]),
        section("Take the first-clear money while you explore",
            "Early on, a trip can pay in several ways without turning into a farming loop. Open a crate you pass, register a new animal, and finish a challenge when the route suits your vehicle. The first completion often combines Pebbles with a useful unlock.",
            "Keep those rewards separate. A crate cosmetic is not a performance upgrade, and a vehicle reward does not mean every challenge awards a car. In Emerald Lake, Elizabeth Oath gives Kayaks; the two vehicle rewards come from Windy Joe and Hermit.",
            table={"headers": ["Emerald Lake objective", "First completion", "Later completion"], "rows": [
                ["Windy Joe Trail", "The Trail Burner + 25 Pebbles", "5 Pebbles"],
                ["Elizabeth Oath Trail", "Kayaks + 15 Pebbles", "3 Pebbles"],
                ["Hermit Trail", "The Burro + 40 Pebbles", "8 Pebbles"]
            ]}, links=[{"label": "See the three Emerald Lake trails", "href": "/guides/emerald-lake-trail-guide"}]),
        section("Repeat trails pay less than the first clear",
            "The October 16 update fixed missing Pebble rewards on repeated objectives. Advice that says completed trails can never pay again is out of date. The other mistake is treating the first-clear number as the repeat payout.",
            "Use a familiar trail when you want predictable driving, then compare the smaller payout with the effort it takes you. Hermit's repeat reward is larger than Windy Joe's, but it also has 31 ordered checkpoints instead of 11. A bigger number at the finish is not enough to call it the fastest way to earn currency.",
            "Check your balance after the finish. If an expected payout does not arrive, confirm that the challenge completed and that the game is updated before copying an old workaround. There is no need to reset a save to test whether a repeat reward works."),
        section("Meteorite hunting: leave the old Demo spots behind",
            "A meteorite pin is a possible landing position. It is not a permanent ore node waiting for you on every visit. The October update also adjusted spawn positions, so heading straight back to a remembered Demo rock can leave you searching an empty patch of ground.",
            "The orange glow is easier to pick out in darkness. From a safe stopping place, raise the view in photo mode and scan the surrounding slopes. Equip the Meteorite Radar at the mechanic and use it through the tool menu when you want a direction to follow. Read its compass direction, then plan an approach that gets your truck to the rock without an unnecessary ravine crossing.",
            image=picture("meteorite-loadout.svg", "Meteorite Radar and Repair Kit game icons beside a direct rear-winch extraction checklist", "Finding the glow and recovering the rock are separate jobs. Leave room to pull away before attaching the winch."),
            links=[{"label": "Open meteorite spawn positions on the atlas", "href": "/maps?area=emerald-lake#interactive-map"}, {"label": "Check recovery equipment", "href": "/wiki/equipment"}]),
        section("Set up the pull before connecting the winch",
            "A direct cable and a clear departure line make extraction much easier to read. Parking almost against the rock with a tree immediately behind your truck leaves very little room to work. Reposition first, even if that means a short drive around the obstacle.",
            "Large meteorites can call for more than one player. When friends help, each assisting vehicle needs a direct connection to the meteorite. A chain of trucks pulling other trucks is not a substitute for those direct attachments.",
            steps=["Stop where you can see both the rock and a clear line of ground to drive away along.",
                "Position the rear of your vehicle toward the meteorite, leaving space ahead for the pull.",
                "Select the rear vehicle attachment and connect the winch directly to the rock.",
                "Apply throttle and winch pull together while driving away from it.",
                "If it does not move, inspect the connection and the ground under your wheels before repeatedly applying more throttle.",
                "For a larger multiplayer pull, arrange the assisting trucks around usable ground and connect every cable directly to the rock."],
            callout={"title": "Budget for the rock you find", "text": "Meteorite rewards range from 15 to 80 Pebbles by size. Do not build a route plan around receiving 80 every time, or assume a marked spawn position will currently contain a rock."}),
        section("Use the next 50 Pebbles where the difference will matter",
            "After the first inexpensive upgrades, the choice gets more personal. Engine Stage 3 and Tires Stage 3 each cost 50. If your truck still cannot hold a line on slippery ground, extra engine output alone will not settle that problem. If it has grip but runs out of pull on a climb, engine is the more relevant experiment.",
            "Read the effect labels carefully. The tyre figures are additions to a grip coefficient, not an 8% or 16% speed bonus. Water resistance extends the time before flooding; it does not give unlimited underwater driving. Later stages describe the current stock-relative effect rather than a stack of every earlier bonus.",
            "The 675-Pebble total is a long-term garage target. You can keep exploring while building toward it. A vehicle you understand, a loadout that fits the trip and a route you can recover from are a better starting point than waiting to buy everything at once.")
    ], [
        {"question": "Do I need to max every vehicle?", "answer": "No. Fully upgrading one vehicle costs 675 Pebbles across 16 purchases. Start with the vehicle you use most and spend against the terrain or equipment limit that is actually stopping you."},
        {"question": "Can I repeatedly collect the first-clear vehicle reward?", "answer": "The vehicle unlock and the first-clear Pebble reward are separate from the smaller repeat payout. Windy Joe, for example, gives The Trail Burner and 25 Pebbles on its first completion, then 5 Pebbles on repeats."},
        {"question": "Is the largest meteorite always the best solo target?", "answer": "No. Large rocks can require additional players. Pick a rock you can reach and extract with the available trucks rather than judging the trip only by the largest possible payout."},
        {"question": "Why did an old meteorite location turn out empty?", "answer": "The map shows possible spawn positions, not guaranteed active meteorites. Positions were also adjusted in the October 16 update. Look for the glow or use the radar instead of treating a remembered Demo position as a permanent deposit."}
    ], ["/wiki/upgrades", "/wiki/equipment", "/guides/emerald-lake-trail-guide", "/guides/sasquatch-location"],
    {"title": "Over The Hill Pebbles Guide - Upgrade Order & Costs", "description": "Plan your Over the Hill upgrades with a 75-Pebble starter budget, all 675 Pebbles of costs, repeat trail payouts and a practical meteorite recovery checklist."},
    ["guide-forum-upgrades", "guide-forum-meteorites", "guide-video-meteorites", "guide-video-emerald", "maprunner-upgrades", "meteor"])

trails = record(
    "emerald-lake-trail-guide", "Emerald Lake Trails: Unlock the Trail Burner & Burro",
    "Find all three Emerald Lake challenge starts, follow their checkpoint sequences, and collect the two vehicle unlocks without confusing Kayaks with a car reward.",
    "Trail Walkthroughs", "/images/game/screenshot-02.webp", [
        section("Two vehicle unlocks, three different reasons to drive",
            "If you are looking for another car, Windy Joe and Hermit are the two Emerald Lake challenges to keep in mind. Windy Joe unlocks The Trail Burner; Hermit unlocks The Burro. Elizabeth Oath is still worth a visit, but its reward is Kayaks rather than a third vehicle.",
            "This gives you a useful way to choose the next objective. Head for Windy Joe when you want to expand the garage, take Elizabeth Oath as a shorter checkpoint outing on the western side, and leave enough time for Hermit's longer sequence in the southeast. That is a suggested order, not a mandatory progression chain.",
            table={"headers": ["Challenge", "Ordered checkpoints", "First reward", "Repeat Pebbles"], "rows": [
                ["Windy Joe Trail", "11", "The Trail Burner + 25 Pebbles", "5"],
                ["Elizabeth Oath Trail", "11", "Kayaks + 15 Pebbles", "3"],
                ["Hermit Trail", "31", "The Burro + 40 Pebbles", "8"]
            ]}),
        section("Find the start, not just a nearby piece of track",
            "An inviting dotted track can lead you into the middle of a challenge. Driving along it is not the same thing as beginning the objective. Make the start marker your first destination, then follow the active checkpoint sequence shown by the game.",
            "The overview below connects the actual checkpoints in order. It is useful for seeing where a trail goes and which end to approach, but the straight joins between points do not describe every bend, rock or crossing. Keep reading the ground between one checkpoint and the next.",
            image=picture("emerald-trails.svg", "Emerald Lake terrain map showing Windy Joe, Elizabeth Oath and Hermit starts and checkpoint sequences", "Three challenge starts on the same area map. Coloured lines connect checkpoints; choose a driving line through the terrain between them.", "map"),
            links=[{"label": "Open the Emerald Lake interactive map", "href": "/maps?area=emerald-lake#interactive-map"}]),
        section("Before leaving the mechanic",
            "Choose the vehicle you can place accurately on a slope. There is little value in a theoretically strong truck if you are still guessing where its wheels sit. Carry recovery equipment for an awkward stop and inspect the tool slots before committing to a long detour.",
            "Engine, tyres and suspension address different difficulties. A small upgrade to the system causing trouble is easier to evaluate than a complete rebuild. Revisit a familiar stretch after a purchase and pay attention to whether the wheels, body clearance or pulling effort were the limiting part.",
            bullets=["Use low range when rough ground or a climb calls for controlled pulling.",
                "Check the next anchor before driving into a position with no easy way back.",
                "Bring a repair kit if repeated landings or impacts have been cutting trips short.",
                "A portable winch point is useful where a convenient natural anchor is missing.",
                "Treat a visible checkpoint as the next target, then find the approach that keeps the truck supported."],
            links=[{"label": "Plan the first upgrades", "href": "/guides/pebbles-upgrade-order"}, {"label": "Choose recovery gear", "href": "/wiki/equipment"}]),
        section("Windy Joe Trail: the Trail Burner unlock",
            "The start is in Emerald Lake's central-southern half, west of the map's centreline. Use the named start pin rather than driving toward any yellow challenge marker you happen to see. From the start, the sequence contains 11 checkpoints.",
            "The important habit here is to arrive at a checkpoint with a plan for the next slope. If you cross one at an angle that leaves you sliding downhill, stop and regain a manageable position before taking on the next gate. A small correction on the approach is cheaper than recovering from the bottom of the bank.",
            "Use the winch to move onto better ground when a climb stalls. Aim for a pull that improves the vehicle's position rather than dragging its side across the same obstacle. Once you can drive again, give the next checkpoint your attention instead of continuing to pull out of habit.",
            image=picture("windy-joe-checkpoints.svg", "Close map of Windy Joe's 11 ordered checkpoints with a marked start and finish", "Windy Joe: start at the labelled end and follow the checkpoint order. The finish is a different position from the start.", "map"),
            steps=["Reach Windy Joe's start marker and begin the challenge there.",
                "Follow the active gate sequence, using low range where a slower climb is easier to control.",
                "If progress appears to stall, look back for an unregistered checkpoint before trying to cut toward the finish.",
                "After completing the sequence, check the reward notification for The Trail Burner and 25 Pebbles."],
            links=[{"label": "Go straight to Windy Joe's start pin", "href": "/maps?area=emerald-lake&pin=emerald-lake-windy-joe-trail#interactive-map"}]),
        section("What the Trail Burner changes in your garage",
            "The Trail Burner is a Wagon. Treat the unlock as a chance to try that vehicle's shape and handling, rather than an automatic replacement for whatever you have been driving. A new car is most useful when you take it somewhere familiar and notice how it fits through the same obstacle.",
            "Do not assume the upgrade budget spent on your previous vehicle is a free maxed-out build for the new one. Inspect the Trail Burner's own upgrade menu before setting out. The vehicle list separates its stock figures from later engine stages so you can compare the actual configuration you intend to drive.",
            image={"src": next(v["image"] for v in json.loads((ROOT / "src/data/vehicles/vehicles.json").read_text(encoding="utf-8")) if v["title"] == "The Trail Burner"), "alt": "The Trail Burner in Over the Hill gameplay", "caption": "The Trail Burner is the Wagon-class reward for the first Windy Joe completion.", "kind": "scene"},
            links=[{"label": "Find the Trail Burner in the vehicle list", "href": "/vehicles#trail-burner"}]),
        section("Elizabeth Oath Trail: the Kayaks detour",
            "Elizabeth Oath begins on the western side of Emerald Lake. It has 11 ordered checkpoints, the same count as Windy Joe, and its first completion gives Kayaks plus 15 Pebbles. The smaller repeat payout is 3 Pebbles.",
            "Take this trail because you want the cosmetic, want to finish the area's challenges, or happen to be exploring that side of the lake. There is no need to wait for a car unlock to appear at the end. Confusing a cosmetic reward with a missing vehicle just leads to an unnecessary search through the garage.",
            "Check the sequence as you go. When a track looks familiar, it is easy to drive by memory and miss the actual gate the objective is waiting for. The challenge indicator is the useful check; merely reaching the geographical end of the route is not enough.",
            links=[{"label": "Open the Elizabeth Oath start", "href": "/maps?area=emerald-lake&pin=emerald-lake-elizabeth-oath-trail#interactive-map"}]),
        section("Hermit Trail: a longer run for the Burro",
            "Hermit's start is in the southeast of the area. Its 31 checkpoints make it the longest of these three sequences by checkpoint count. That is a reason to set aside time for the whole attempt, not a promise that every individual section is harder than Windy Joe.",
            "Keep the objective visible and work from one registered gate to the next. On a longer sequence, a missed gate can leave you a long way from the place that needs attention. If the next marker seems wrong, stop early and investigate instead of driving farther into the route.",
            "Pace the descents as carefully as the climbs. Arriving fast at a rock step can leave the truck at an awkward angle or damage it before the next section. If you need recovery, first identify where you want the wheels to land and then choose the cable direction that gets you there.",
            image=picture("hermit-checkpoints.svg", "Hermit Trail's 31 checkpoint positions in southeast Emerald Lake", "Hermit's complete checkpoint sequence. The denser run of points is a reminder to follow the active objective instead of assuming every nearby track is part of it.", "map"),
            callout={"title": "At the finish", "text": "The first Hermit completion awards The Burro and 40 Pebbles. A repeat pays 8 Pebbles. Keep that separate from the 40-Pebble first-clear payout."},
            links=[{"label": "Open Hermit's start pin", "href": "/maps?area=emerald-lake&pin=emerald-lake-hermit-trail#interactive-map"}, {"label": "Inspect the Burro", "href": "/vehicles#burro"}]),
        section("A recovery checklist for a stalled attempt",
            "When the truck stops, pause long enough to identify what is holding it. Tyres digging into soft ground, a body hung on a crest and a vehicle lying on its side are different problems. Repeating the same throttle input usually makes that distinction less clear.",
            "For a poor line, back out while that is still possible. For an awkward position, use a suitable anchor or a carried recovery tool to regain a driving stance. If you have taken damage, deal with it before asking the truck to handle another difficult section. Use the control prompts for your current input device; a keyboard command copied from another setup may not apply.",
            table={"headers": ["Symptom", "What to check first"], "rows": [
                ["You reached the finish area but nothing completed", "The active challenge and the last registered checkpoint."],
                ["The wheels turn without useful progress", "Low range, supported tyres and a less slippery approach."],
                ["The truck rests on the middle of a rock", "A different wheel placement or a recovery pull toward supported ground."],
                ["The winch pull changes very little", "The selected vehicle attachment, anchor and intended direction of movement."],
                ["A repeat gave fewer Pebbles", "The smaller repeat payout, rather than the first-clear reward."]
            ]}),
        section("Leave yourself a useful next-session note",
            "After a trail, mark the stop you completed and write down the obstacle you want to revisit. A note such as 'approach this gate from the higher side' is more useful than a vague reminder to upgrade everything. Keep it tied to the point on the atlas where you learned it.",
            "The site's discoveries and personal notes stay in your browser; they do not modify the game save. Use Share map when you want to send a start pin to a friend. Your private note text is not included in that link, so describe the driving plan separately when you play together.")
    ], [
        {"question": "Why did Elizabeth Oath not unlock a vehicle?", "answer": "Its first reward is Kayaks plus 15 Pebbles. The two Emerald Lake vehicle challenges are Windy Joe for The Trail Burner and Hermit for The Burro."},
        {"question": "Must I complete the three trails in this order?", "answer": "This guide's order is a planning suggestion. Choose according to the reward you want and the side of the area you are exploring; it is not an unlock prerequisite chain."},
        {"question": "Are the coloured map lines roads?", "answer": "They connect actual checkpoints in sequence. They do not trace every driveable bend, elevation change or obstacle between them."},
        {"question": "Can I judge the fastest repeat by the reward alone?", "answer": "No. Hermit pays 8 Pebbles on a repeat but has 31 checkpoints. Windy Joe pays 5 with 11. Compare the time and recovery effort in your own attempts rather than assuming the larger payout is faster."}
    ], ["/maps", "/vehicles", "/guides/pebbles-upgrade-order", "/wiki/equipment"],
    {"title": "Over The Hill Emerald Lake Trails - Vehicle Unlocks", "description": "Find Over the Hill's three Emerald Lake trails with illustrated checkpoint maps, Trail Burner and Burro unlocks, Kayaks rewards and practical recovery tips."},
    ["guide-video-emerald", "maprunner-vehicles", "guide-forum-exploration", "release-canada"])

sasquatch = record(
    "sasquatch-location", "Sasquatch Location: A Night Hunt in Emerald Lake",
    "Use the Train Horn and Camping Gear crates to find Sasquatch's northern forest search area, arrive in dry weather at night, and register the photo for 100 Pebbles.",
    "Wildlife Photography", "/images/game/screenshot-30.webp", [
        section("Find the northern forest search area",
            "Sasquatch has one mapped spawn position in Emerald Lake. The Compendium's Remote Forest clue gives you a habitat, but it is a poor substitute for a landmark when half the drive already looks like forest.",
            "Look in the northern part of the area, just east of its centreline. Two useful references are the Train Horn crate to the north and the Camping Gear crate to the southwest. The search position sits between those two pins. You do not need to sweep every remote-looking slope or drive to the extreme northeast shoreline.",
            image=picture("sasquatch-search-area.svg", "Northern Emerald Lake map locating Sasquatch between the Train Horn and Camping Gear crates", "The highlighted point is a possible spawn position, not a live sighting. Use the two named crate pins to orient yourself.", "map"),
            links=[{"label": "Open the Sasquatch search pin", "href": "/maps?area=emerald-lake&pin=animal-animal_R1A1_Valley_274593812#interactive-map"}]),
        section("The conditions that matter: night and dry weather",
            "The Sasquatch entry lists Night and Dry, with Legendary rarity. Get to the right part of the forest while those conditions apply. Arriving during the day and searching harder does not solve the time-of-day mismatch.",
            "Keep a distinction between meeting the conditions and being guaranteed a sighting. A spawn pin narrows the search; it is not a promise that an animal will stand on that exact dot when you arrive. Check the surrounding treeline and leave room for a subject that has moved away from its initial position.",
            table={"headers": ["Check", "What you need"], "rows": [
                ["Area", "Emerald Lake, Canada"], ["Habitat", "Remote Forest"],
                ["Time", "Night"], ["Weather", "Dry"], ["Rarity", "Legendary"],
                ["Mapped spawn positions", "1"], ["First registered photo", "100 Pebbles"]
            ]},
            callout={"title": "Do the quick checks before another lap", "text": "Correct area, correct forest, night, dry weather. If one of those is wrong, change the plan before making another full loop through the same trees."}),
        section("Pack for waiting and a careful return drive",
            "Take the vehicle you are comfortable placing on a dark track. This is a photography trip, so the ability to stop safely and get back out matters more than chasing a particular vehicle's top speed. Keep the headlights available for the drive and avoid turning the search into a hurried descent through unfamiliar trees.",
            "A camp helps time pass when you arrive in daylight. Use the Cloud Clearing Bell if bad weather is holding up the search, then check the conditions again. Its clearing effect is temporary. Save the drive back into the trees for a dry night; using a tool by itself is not a reason to expect the animal to appear.",
            "Choose the loadout before leaving Crazy Günther. If the equipment you want does not fit, the second tool slot is a 25-Pebble purchase. Carrying every tool is unnecessary; leaving behind the one you meant to use to wait out daylight is simply an avoidable extra trip.",
            image=picture("sasquatch-preparation.svg", "Camp Tool and Cloud Clearing Bell game icons with night and dry weather checks", "Camp to pass time; the bell clears bad weather temporarily. Check the resulting conditions rather than assuming either action guarantees a sighting."),
            links=[{"label": "Check camping and weather equipment", "href": "/wiki/equipment"}]),
        section("Set the search up before darkness makes it awkward",
            "Use daylight to identify the two crate landmarks and a place where you can stop without balancing the truck on a steep bank. You can then return your attention to the forest once night arrives, rather than trying to navigate and identify a rare animal at the same time.",
            "On the atlas, switch to Wildlife spawns, choose Sasquatch in the photo filters and keep the two nearby crate references in mind. The marker is useful as an anchor for the search, while the satellite view helps you recognise the local terrain. It does not track the animal's current movement.",
            steps=["Open Emerald Lake and locate the Train Horn and Camping Gear crates in the northern half of the map.",
                "Use the Sasquatch pin to narrow the space between those landmarks.",
                "Approach on a line you can also drive back out of, then choose a stable stopping position.",
                "Check that it is night and the weather is dry before beginning the focused search.",
                "Scan around the nearby forest rather than staring at one exact patch of ground under the pin." ]),
        section("Recognise the silhouette before reaching for the camera",
            "Use the model below to get the proportions in mind: an upright figure is easier to distinguish when you already know what you are searching for. Tree trunks and tall vegetation can break up the outline, so a partial shape deserves a second look before you drive onward.",
            "Once you have a possible sighting, stop the vehicle somewhere supported. A steady view makes it easier to separate the subject from the trees. Do not spend the chance driving in circles around it while trying to find an imaginary exact approach distance.",
            image={"src": "/images/wiki/wildlife-release/Sasquatch.webp", "alt": "Sasquatch game model showing the upright silhouette used for identification", "caption": "Sasquatch's game model: learn the silhouette, then look for a clear view of the subject among the trees.", "kind": "model"}),
        section("Register the wildlife photo, not just a scenery shot",
            "Bring up the Safari Camera and use the prompts for your current input device. Keep the subject in a clear frame with as little vegetation blocking it as possible. A picture that looks atmospheric is not much use for the collection if the animal is hidden behind a trunk.",
            "Check the registration result and the Compendium entry before moving on. The first registered Sasquatch photo pays 100 Pebbles. Seeing it, driving to the pin, or saving a landscape photograph does not substitute for that wildlife registration.",
            "If the first frame is not recognised, improve the view while you still have the subject. Shift the camera to clear the trunk or branch that is hiding part of the outline, then try again. Keep an eye on the animal while repositioning so you do not lose it among the trees.",
            bullets=["Use the wildlife camera interaction rather than assuming any screenshot counts.",
                "Give the subject a clear place in the frame.",
                "Look for the registration feedback, then inspect the Compendium entry.",
                "Count the 100-Pebble reward as a first-photo reward, not a repeat farming loop."] ),
        section("If the forest is empty, change one thing at a time",
            "First check the easy mistakes: wrong part of Emerald Lake, daylight, or wet weather. A broad habitat clue can send you far from the single mapped position, and the correct location can still be an unproductive search when its conditions are wrong.",
            "If the conditions fit, make a short, deliberate sweep around the nearby trees. Keep the original landmarks in view so the search does not gradually drift into a different forest. Recheck the conditions before making another lap. If the search has drifted away from the two crate landmarks, use the map to get back to the intended patch of forest.",
            table={"headers": ["What happened?", "Useful next check"], "rows": [
                ["You have searched many different woods", "Return to the specific northern position between the two crate landmarks."],
                ["It is still daylight", "Use a safe waiting stop or camp, then recheck the actual time of day."],
                ["It is raining or conditions changed", "Wait for dry weather or use the weather equipment you brought, then inspect the result."],
                ["A tall shape vanished behind vegetation", "Hold position and scan nearby clear gaps before driving away."],
                ["A photo did not fill the entry", "Check the Safari Camera, visibility of the subject and registration feedback."],
                ["The entry is already registered", "Keep the photograph for the collection; do not expect another first-photo payout."]
            ]}),
        section("Keep another photo target in reserve",
            "A search does not have to consume the whole session. If the weather or time does not suit Sasquatch, look at another animal's actual conditions rather than trying to force the same encounter. Canada Goose and Common Raven are daytime, dry-weather subjects; Beaver and Gray Wolf list night activity with both dry and wet weather.",
            "Those alternatives have their own spawn positions and rewards, so choose them through the wildlife list or atlas instead of assuming they share Sasquatch's trees. The useful habit is to plan the photograph around its subject's conditions. You can return to this hunt when night and dry weather line up again.",
            links=[{"label": "Choose another Emerald Lake animal", "href": "/wiki/wildlife"}, {"label": "Use the wildlife filters on the map", "href": "/maps?area=emerald-lake#interactive-map"}]),
        section("Mark the photograph once you have checked the entry",
            "On the site's atlas, mark the species photographed after you confirm the in-game registration. That is a personal checklist shared across the site's five maps, not a command that changes your game save. The 100-Pebble reward still comes from the game.",
            "If you want a reminder about the approach, leave a short private map note. Keep the sighting's conditions in the note as well as the place. 'Dry night, check this side of the trees' is something you can act on next session; a note that only says 'Bigfoot here' is much easier to misread as a guarantee.")
    ], [
        {"question": "Is Sasquatch in the far northeast corner?", "answer": "The mapped search position is in the northern half of Emerald Lake, just east of centre. Use the Train Horn crate to its north and the Camping Gear crate to its southwest; heading all the way to the northeast shoreline is an unnecessarily broad reading of the location."},
        {"question": "Can I photograph it in daylight?", "answer": "Its documented active period is Night, with Dry weather. Plan the search around those conditions rather than spending the day repeatedly circling the same patch of forest."},
        {"question": "Does camping guarantee that it appears?", "answer": "No. Camping advances time. Recheck the resulting time and weather, then search the nearby forest. The map pin and suitable conditions do not guarantee an animal will be standing at the marker."},
        {"question": "Can I farm 100 Pebbles by taking the photo repeatedly?", "answer": "The 100-Pebble amount is the first registered Sasquatch photo reward. Use repeat challenge payouts or meteorite hunting when you want repeatable currency."}
    ], ["/wiki/wildlife#sasquatch", "/wiki/equipment", "/maps", "/guides/pebbles-upgrade-order"],
    {"title": "Over The Hill Sasquatch Location - Night Photo Guide", "description": "Find Sasquatch in Over the Hill with an illustrated Emerald Lake map, two crate landmarks, night and dry-weather checks, camera tips and the 100-Pebble reward."},
    ["maprunner-animals", "guide-forum-wildlife", "guide-forum-cryptid", "guide-video-emerald", "camp"])

pebbles["imageAlt"] = "Over the Hill vehicles carrying recovery gear on a rain-soaked night drive"
trails["imageAlt"] = "Over the Hill vehicles following an autumn forest track"
sasquatch["imageAlt"] = "An Over the Hill lookout silhouetted against a blue and purple night sky"
guides = [pebbles, trails, sasquatch]
for guide in guides:
    assert 40 <= len(guide["seo"]["title"]) <= 60, guide["slug"]
    assert 140 <= len(guide["seo"]["description"]) <= 160, (guide["slug"], len(guide["seo"]["description"]))
    assert not any("http" in str(s) for s in guide["sections"])
    print(guide["slug"], len(re.findall(r"\b[\w’'-]+\b", str(guide["sections"]))), "editorial words")
(ROOT / "src/data/guides/guides.json").write_text(json.dumps(guides, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
