import PageSchema from "@/seo/PageSchema";
import Image from "next/image";
import Breadcrumb from "@/components/content/Breadcrumb";
import { regions } from "@/lib/data/catalog";
import InteractiveMap from "./InteractiveMap";
import presentation from "@/data/maps/presentation.json";
import { atlasPlaces, atlasTrails, atlasSpecies } from "@/lib/maps/atlas";
import { staticMetadata } from "@/seo/metadata";
import { tdk } from "@/seo/tdk";
import s from "@/style/page/maps/maps.module.css";
export const metadata = staticMetadata("/maps");
const landscapes: Record<
  string,
  { label: string; tags: string[]; note: string; link: string; action: string }
> = {
  canada: {
    label: "THE NORTHERN WILDERNESS",
    tags: ["Forests", "Lakes", "Mountain tracks"],
    note: "Canada contains Emerald Lake, Gimli Ridge and Asgard Mountain. Each area has its own cabins, viewpoints and challenge trails.",
    link: "#emerald-lake",
    action: "Browse Emerald Lake",
  },
  algeria: {
    label: "THE DESERT BEYOND",
    tags: ["Dunes", "Canyons", "Rock formations"],
    note: "Planks help cross gaps; the winch is for recovery when a vehicle gets stuck. Check the equipment list before choosing what to carry.",
    link: "/wiki/equipment",
    action: "Pack your trail gear",
  },
};
export default function MapsPage() {
  const countries = regions.filter((region) => region.category === "Region");
  const lake = regions.find((region) => region.slug === "emerald-lake");
  const areas = regions.filter((region) => region.category === "Area");
  return (
    <section className={s.page} aria-label="Maps and regions">
      <div className="container">
        <PageSchema path="/maps" />
        <Breadcrumb items={[{ label: "Maps", href: "/maps" }]} />
        <header className={s.hero}>
          <Image
            src="/images/game/screenshot-25.webp"
            alt="Mountain valleys and autumn forest in Over the Hill"
            fill
            preload
            sizes="(max-width:768px) 100vw, 1400px"
          />
          <div className={s.shade} />
          <div className={s.heroCopy}>
            <span className={s.kicker}>THE ROAD IS ONLY THE BEGINNING</span>
            <h1>{tdk["/maps"].h1}</h1>
            <p>{tdk["/maps"].intro}</p>
            <nav className={s.jumpLinks} aria-label="Jump to a region">
              <a href="#interactive-map">
                Open interactive map <span aria-hidden="true">↘</span>
              </a>
              {countries.map((region) => (
                <a key={region.slug} href={`#${region.slug}`}>
                  {region.title} <span aria-hidden="true">↘</span>
                </a>
              ))}
              {lake && (
                <a href="#emerald-lake">
                  Emerald Lake <span aria-hidden="true">↘</span>
                </a>
              )}
            </nav>
          </div>
          <span className={s.script}>Two worlds. Plenty of detours.</span>
        </header>
        <InteractiveMap
          areas={areas.map(({ slug, title, region, image }) => ({
            ...presentation.find((p) => p.slug === slug)!,
            slug,
            title,
            region: region || "",
            image,
          }))}
          places={atlasPlaces}
          trails={atlasTrails}
          species={atlasSpecies}
        />
        <div className={s.sectionHeading}>
          <div>
            <span className={s.kicker}>FIND YOUR NEXT HORIZON</span>
            <h2>Choose your landscape</h2>
          </div>
          <p>
            {countries.length} regions covered here, with Emerald Lake listed
            alongside four further release areas below.
          </p>
        </div>
        <div className={s.regionGrid}>
          {countries.map((region, index) => {
            const view = landscapes[region.slug];
            return (
              <article key={region.slug} id={region.slug} className={s.region}>
                <div className={s.regionImage}>
                  <Image
                    src={region.image}
                    alt={region.imageAlt}
                    fill
                    sizes="(max-width:768px) 100vw, 50vw"
                  />
                  <span className={s.regionBadge}>
                    REGION {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className={s.regionTitle}>
                    <span>{view.label}</span>
                    <h3>{region.title}</h3>
                  </div>
                </div>
                <div className={s.regionCopy}>
                  <p>{region.description}</p>
                  <div className={s.tags}>
                    {view.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className={s.fieldNote}>
                    <span>ON THE TRAIL</span>
                    <p>{view.note}</p>
                  </div>
                  <a href={view.link}>
                    {view.action} <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
        <section className={s.areaSection} aria-labelledby="area-heading">
          <div className={s.sectionHeading}>
            <div>
              <span className={s.kicker}>FIVE RELEASE AREAS</span>
              <h2 id="area-heading">Maps, stops and challenge trails</h2>
            </div>
            <p>
              Three areas in Canada, two in Algeria. Each image is a game map
              texture without added location markers.
            </p>
          </div>
          {areas.map((area) => (
            <article className={s.area} id={area.slug} key={area.id}>
              <div className={s.areaImage}>
                <Image
                  src={area.image}
                  alt={area.imageAlt}
                  fill
                  sizes="(max-width:768px) 100vw, 45vw"
                />
                <span className={s.areaBadge}>
                  {area.region?.toUpperCase()} / RELEASE AREA
                </span>
                <div className={s.areaImageCaption}>
                  <span>IN-GAME TOPOGRAPHIC MAP</span>
                  <p>{area.title}</p>
                </div>
              </div>
              <div className={s.areaCopy}>
                <span className={s.kicker}>
                  {area.region === "canada"
                    ? "THE VALHALLAS / CANADA"
                    : "ALGERIA"}
                </span>
                <h2>{area.title}</h2>
                <p>{area.description}</p>
                <div className={s.statsLabel}>Release map locations</div>
                <dl className={s.stats}>
                  {area.displayFacts?.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className={s.areaNotes}>
                  <h3>Cabins and camps</h3>
                  <p>{area.places?.join(" · ")}</p>
                  <h3>Scenic points</h3>
                  <p>{area.viewpoints?.join(" · ")}</p>
                  <h3>Challenge trails</h3>
                  <p>{area.trails?.join(" · ")}</p>
                  <p>
                    Visit cabins and camps as you explore. Use the interactive
                    map above to locate these stops; challenge lines connect the
                    ordered checkpoints, rather than tracing a driveable road.
                  </p>
                </div>
                <a className={s.guideLink} href="/vehicles">
                  Check vehicle rewards <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </section>
        <section className={s.travelNotes} aria-label="Exploring the world">
          <div>
            <span>01 / THE LAY OF THE LAND</span>
            <h2>Handcrafted areas</h2>
            <p>
              Regions contain individual, handcrafted areas. Emerald Lake is an
              area within Canada, not a third region.
            </p>
          </div>
          <div>
            <span>02 / THE NEXT STRETCH</span>
            <h2>Travel through portals</h2>
            <p>
              Discover portals to travel between areas. The landscapes shown
              above are overviews, not connected route maps.
            </p>
          </div>
          <div>
            <span>03 / THE SMALL DETOURS</span>
            <h2>Weather and time of day</h2>
            <p>
              Dynamic weather and the day/night cycle change conditions during a
              drive. A screenshot shows one moment rather than a permanent view
              of the area.
            </p>
          </div>
        </section>
        <section className={s.faq} aria-labelledby="map-questions">
          <div>
            <span className={s.kicker}>BEFORE YOU HEAD OUT</span>
            <h2 id="map-questions">A few map essentials</h2>
            <p>A little orientation before the next turn.</p>
          </div>
          <div>
            <details>
              <summary>
                Are the maps procedurally generated?
                <span aria-hidden="true">+</span>
              </summary>
              <p>No. The areas are handcrafted.</p>
            </details>
            <details>
              <summary>
                Is this one continuous open world?
                <span aria-hidden="true">+</span>
              </summary>
              <p>
                The world uses area-based maps grouped within regions. Portals
                let you travel between areas.
              </p>
            </details>
            <details>
              <summary>
                What can I find on the interactive map?
                <span aria-hidden="true">+</span>
              </summary>
              <p>
                Switch between five game maps to find cabins, viewpoints,
                challenge checkpoints, crates, recovery jobs, mechanics and area
                exits. Wildlife and meteorite layers show possible spawn
                positions. Search names or vehicle rewards, then mark places you
                have found. Progress stays in this browser and does not sync
                with the game. Photographed animals are tracked once per
                species, across all five maps. Meteorite positions use the
                post-patch import; a pin does not mean a meteorite is currently
                present.
              </p>
            </details>
            <details>
              <summary>
                Can I switch the map view?<span aria-hidden="true">+</span>
              </summary>
              <p>
                Yes. All five areas have a colour satellite terrain view and an
                in-game topographic map. Open Terrain layers to highlight the
                ground conditions available for that area. These overlays
                describe terrain; they do not show the current weather in your
                session.
              </p>
            </details>
            <details>
              <summary>
                Can I share a pin or keep my own notes?
                <span aria-hidden="true">+</span>
              </summary>
              <p>
                Select a location and choose Share map to copy a link to that
                area and pin. Add note lets you leave a reminder at a position
                you choose. Notes and discovery records stay in this browser and
                are not included in the shared link.
              </p>
            </details>
            <details>
              <summary>
                Does the measuring tool follow roads?
                <span aria-hidden="true">+</span>
              </summary>
              <p>
                No. Measure connects the positions you select and adds their
                straight-line distances on the map. Hills, bends and obstacles
                can make a drive much longer. Measurements are temporary; save a
                note if you want a reminder for your next visit.
              </p>
            </details>
          </div>
        </section>
      </div>
    </section>
  );
}
