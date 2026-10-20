import PageSchema from "@/seo/PageSchema";
import Image from "next/image";
import {
  guides,
  entries,
  regions,
  updates,
  releaseNotes,
  vehicles,
  wikiCategories,
} from "@/lib/data/catalog";
import { staticMetadata } from "@/seo/metadata";
import { tdk } from "@/seo/tdk";
import s from "@/style/page/home/home.module.css";

export const metadata = staticMetadata("/");
const wikiVisuals: Record<string, { image: string; copy: string }> = {
  equipment: {
    image: "/images/home-v3/equipment.webp",
    copy: "Recovery gear & trail essentials",
  },
  collectibles: {
    image: "/images/home-v3/collectibles.webp",
    copy: "Little discoveries. Worthwhile detours.",
  },
  upgrades: {
    image: "/images/home-v3/upgrades.webp",
    copy: "A little more room to grow",
  },
  wildlife: {
    image: "/images/home-v3/wildlife.webp",
    copy: "Slow down. See what’s out there.",
  },
  achievements: {
    image: "/images/wiki/achievements/WelcomeToTheWild.webp",
    copy: "62 goals, from first miles to regional completion",
  },
};
const guideLabels: Record<string, { title: string; description: string }> = {
  "pebbles-upgrade-order": {
    title: "Spend your Pebbles well",
    description: "First upgrades, repeat rewards and meteorite pulls.",
  },
  "emerald-lake-trail-guide": {
    title: "Two new rides. Three trails.",
    description: "Checkpoint maps for the Trail Burner, Burro and Kayaks.",
  },
  "sasquatch-location": {
    title: "A night in Sasquatch country",
    description: "Find the northern forest, check the weather, get the photo.",
  },
};
const faqs = [
  [
    "Is Over the Hill a racing game?",
    "Exploration is the focus. Choose your route, recover from difficult terrain and stop for discoveries instead of chasing a race finish.",
  ],
  [
    "Do Demo costs apply to the release game?",
    "Do not assume they do. Upgrade costs and unlocks marked Demo describe that build; check your current garage before spending Pebbles.",
  ],
  [
    "Is this the official game website?",
    "No. Over the Hill Hub is an independent fan site. We cover vehicles, equipment, regions and practical gameplay questions.",
  ],
  [
    "Can I play with friends?",
    "Yes. Explore solo or join up with up to three friends in online co-op, for four players in total.",
  ],
  [
    "Which regions can I explore?",
    "Canada and Algeria are the two regions. The maps page covers their five release areas, including Emerald Lake.",
  ],
  [
    "Can I upgrade my vehicle?",
    "Yes. The garage includes engine, suspension, tyre and equipment-slot upgrades, alongside visual customization. Availability depends on the vehicle and build.",
  ],
];
function SectionHeading({
  eyebrow,
  title,
  href,
  label,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className={s.sectionHeading}>
      <div>
        <span className={s.eyebrow}>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {href ? (
        <a href={href}>
          {label}
          <span aria-hidden="true">→</span>
        </a>
      ) : null}
    </div>
  );
}
export default function HomePage() {
  const emeraldLake = regions.find((region) => region.slug === "emerald-lake");
  const equipment = ["winch", "planks", "repair-kit", "camp"].flatMap((slug) =>
    entries.filter((entry) => entry.slug === slug),
  );
  const featuredVehicles = ["protector", "trail-burner", "burro"].flatMap(
    (slug) => vehicles.filter((vehicle) => vehicle.slug === slug),
  );
  return (
    <div className={s.home}>
      <PageSchema path="/" />
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={s.heroScene}>
          <Image
            src="/images/home-v3/hero.webp"
            alt="Original low-poly illustration of a blue 4x4 above an autumn mountain lake; not a game screenshot"
            fill
            preload
            sizes="100vw"
          />
        </div>
        <div className={s.heroShade} />
        <div className={`container ${s.heroInner}`}>
          <div className={s.heroCopy}>
            <p className={s.heroEyebrow}>THE ROAD IS ONLY THE BEGINNING.</p>
            <h1 id="hero-title">
              Over The Hill<span> - {tdk["/"].h1.split(" - ")[1]}</span>
            </h1>
            <p className={s.heroDescription}>{tdk["/"].intro}</p>
            <div className={s.heroButtons}>
              <a className={s.primary} href="/vehicles">
                Explore the garage
              </a>
              <a className={s.secondary} href="/maps">
                Discover the regions
              </a>
            </div>
            <dl className={s.heroStats} aria-label="In this field guide">
              <div>
                <dt>vehicles</dt>
                <dd>{vehicles.length}</dd>
              </div>
              <div>
                <dt>classes</dt>
                <dd>
                  {new Set(vehicles.map((vehicle) => vehicle.category)).size}
                </dd>
              </div>
              <div>
                <dt>wiki entries</dt>
                <dd>{entries.length}</dd>
              </div>
            </dl>
          </div>
          <div className={s.trailSketch} aria-hidden="true">
            <svg viewBox="0 0 240 145" fill="none">
              <path
                d="M8 125C-5 63 63 100 52 47S145 9 156 43s-55 72-9 72 55-24 84-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 5"
              />
              <circle cx="231" cy="111" r="4" fill="currentColor" />
              <path
                d="m27 110 8 10-8 10-8-10 8-10Zm0 4v12m-6-6h12"
                stroke="currentColor"
              />
            </svg>
            <span>
              Good roads lead
              <br />
              to great stories.
            </span>
          </div>
        </div>
        <span className={s.heroArtLabel}>
          Original illustration · not a game screenshot
        </span>
      </section>
      <nav
        className={`container ${s.quickLinks}`}
        aria-label="Explore Over the Hill"
      >
        {[
          ["Vehicles", "/vehicles", "03", "Find your next ride", "01"],
          ["Maps & regions", "/maps", "04", "Take the scenic route", "02"],
          ["The Wiki", "/wiki", "14", "Know before you go", "03"],
          [
            "Essential guides",
            "/guides",
            "02",
            "Make the first miles count",
            "04",
          ],
        ].map(([title, href, image, copy, number]) => (
          <a key={href} href={href}>
            <Image
              src={`/images/game/screenshot-${image}.webp`}
              alt=""
              fill
              sizes="(max-width:768px) 50vw, 25vw"
            />
            <span className={s.quickNumber}>{number} / EXPLORE</span>
            <div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
            <b aria-hidden="true">↗</b>
          </a>
        ))}
      </nav>
      <section className={s.garage}>
        <div className="container">
          <SectionHeading
            eyebrow="THE GARAGE"
            title="Find your next ride"
            href="/vehicles"
            label="View all vehicles"
          />
          <div className={s.vehicleGrid}>
            {featuredVehicles.map((vehicle) => (
              <a
                key={vehicle.id}
                className={s.vehicleCard}
                href={`/vehicles#${vehicle.slug}`}
              >
                <div className={s.vehicleImage}>
                  <Image
                    src={vehicle.image}
                    alt={vehicle.imageAlt}
                    fill
                    className={
                      vehicle.image.startsWith("/images/vehicles/")
                        ? s.vehicleFocus
                        : undefined
                    }
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                  <span className={s.imageTag}>IN-GAME VEHICLE</span>
                </div>
                <div className={s.vehicleCopy}>
                  <div>
                    <h3>{vehicle.title}</h3>
                    <p>{vehicle.category}</p>
                  </div>
                  <span className={s.arrow} aria-hidden="true">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className={s.regions}>
        <div className="container">
          <SectionHeading
            eyebrow="MAPS & REGIONS"
            title="Two regions. Countless detours."
            href="/maps"
            label="Explore the world"
          />
          <p className={s.sectionDescription}>
            Handcrafted places. A different story around every bend.
          </p>
          <div className={s.regionGrid}>
            {regions
              .filter((region) => region.category === "Region")
              .map((region) => (
                <a
                  key={region.id}
                  href={`/maps#${region.slug}`}
                  className={s.regionCard}
                >
                  <div className={s.regionImage}>
                    <Image
                      src={region.image}
                      alt={region.imageAlt}
                      fill
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                    <span className={s.regionBadge}>
                      {region.slug === "canada"
                        ? "01 / THE SCENIC ROUTE"
                        : "02 / THE OPEN HORIZON"}
                    </span>
                  </div>
                  <div className={s.regionCopy}>
                    <div>
                      <h3>{region.title}</h3>
                      <p>
                        {region.slug === "canada"
                          ? "Forests, lakes and long winding roads."
                          : "Desert trails, canyons and hidden oases."}
                      </p>
                    </div>
                    <span>
                      Explore region <b aria-hidden="true">→</b>
                    </span>
                  </div>
                </a>
              ))}
          </div>
          {emeraldLake ? (
            <article className={s.lakeFeature}>
              <div className={s.lakeImage}>
                <Image
                  src={emeraldLake.image}
                  alt={emeraldLake.imageAlt}
                  fill
                  sizes="(max-width:768px) 100vw, 55vw"
                />
                <span>CANADA / EMERALD LAKE</span>
              </div>
              <div className={s.lakeCopy}>
                <span className={s.eyebrow}>A CLOSER LOOK / EMERALD LAKE</span>
                <h3>A little further off the beaten path.</h3>
                <p>
                  Follow the water, stop at a cabin and keep an eye out for the
                  next turn. Emerald Lake brings the trails and quiet
                  discoveries together in Canada’s first area.
                </p>
                <dl>
                  {emeraldLake.displayFacts
                    ?.filter((fact) =>
                      [
                        "Reward crates",
                        "Cabins / camps",
                        "Challenge trails",
                      ].includes(fact.label),
                    )
                    .map((fact) => (
                      <div key={fact.label}>
                        <dd>{fact.value}</dd>
                        <dt>{fact.label}</dt>
                      </div>
                    ))}
                </dl>
                <a href="/maps#emerald-lake">
                  Explore Emerald Lake <span aria-hidden="true">→</span>
                </a>
                <small>
                  Release map locations; Demo differences remain labelled.
                </small>
              </div>
            </article>
          ) : null}
        </div>
      </section>
      <section className={s.wiki} aria-labelledby="home-wiki-title">
        <div className="container">
          <div className={s.wikiHeading}>
            <div>
              <span className={s.eyebrow}>FIELD NOTES / THE WIKI</span>
              <h2 id="home-wiki-title">
                A little trail knowledge goes a long way.
              </h2>
            </div>
            <a href="/wiki">
              Explore the Wiki <span aria-hidden="true">→</span>
            </a>
          </div>
          <nav className={s.wikiCards} aria-label="Wiki chapters">
            {wikiCategories.map((category) => (
              <a
                key={category.slug}
                href={`/wiki/${category.slug}`}
                className={s.wikiCard}
              >
                <div className={s.wikiImage}>
                  <Image
                    src={wikiVisuals[category.slug].image}
                    alt=""
                    fill
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                </div>
                <div className={s.wikiCopy}>
                  <div>
                    <h3>{category.name}</h3>
                    <span>
                      {
                        entries.filter(
                          (entry) => entry.category === category.slug,
                        ).length
                      }{" "}
                      entries
                    </span>
                  </div>
                  <b aria-hidden="true">→</b>
                </div>
                <p>{wikiVisuals[category.slug].copy}</p>
              </a>
            ))}
          </nav>
          <p className={s.illustrationNote}>
            Gear, wildlife and achievement lists, with game artwork labelled
            alongside original category illustrations.
          </p>
        </div>
      </section>
      <section className={s.trailGear}>
        <div className="container">
          <SectionHeading
            eyebrow="PACK FOR THE TRAIL"
            title="Good gear. Better adventures."
            href="/wiki/equipment"
            label="All equipment"
          />
          <p className={s.sectionDescription}>
            A few essentials for the moments when the easy road ends.
          </p>
          <div className={s.gearGrid}>
            {equipment.map((entry) => (
              <a href={`/wiki/equipment#${entry.slug}`} key={entry.id}>
                <div data-kind={entry.imageKind}>
                  <Image
                    src={
                      entry.imageKind
                        ? entry.image
                        : `/images/wiki/illustrations/${entry.slug}.svg`
                    }
                    alt={
                      entry.imageKind
                        ? entry.imageAlt
                        : `${entry.title} field illustration`
                    }
                    width={110}
                    height={100}
                  />
                </div>
                <section>
                  <h3>{entry.title.replace("Over the Hill ", "")}</h3>
                  <p>{entry.description}</p>
                  <span>
                    Pack your gear <b aria-hidden="true">→</b>
                  </span>
                </section>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className={s.discoveries}>
        <div className="container">
          <SectionHeading
            eyebrow="WILDLIFE & COLLECTIBLES"
            title="There’s more out here than the road."
          />
          <div className={s.discoveryGrid}>
            <a
              href="/wiki/wildlife#animal-compendium"
              className={s.wildlifeFeature}
            >
              <div className={s.discoveryArt}>
                <Image
                  src="/images/game/screenshot-25.webp"
                  alt="Forested mountain slopes in Over the Hill"
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                />
              </div>
              <div className={s.discoveryCopy}>
                <span className={s.eyebrow}>LEAVE TIME TO LOOK AROUND</span>
                <h3>Meet the wild side.</h3>
                <p>
                  Moose, black bears, bald eagles and more. Slow down, bring the
                  camera and get to know the animal compendium.
                </p>
                <span>
                  Explore wildlife <b aria-hidden="true">→</b>
                </span>
              </div>
            </a>
            <a
              href="/wiki/collectibles#meteorites"
              className={s.collectibleFeature}
            >
              <div className={s.discoveryArt}>
                <Image
                  src="/images/game/screenshot-30.webp"
                  alt="A mountain landscape under the night sky in Over the Hill"
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                />
              </div>
              <div className={s.discoveryCopy}>
                <span className={s.eyebrow}>MAKE THE DETOUR COUNT</span>
                <h3>Find the unexpected.</h3>
                <p>
                  Meteorites and Pebbles give you another reason to wander. See
                  how discoveries connect to rewards and your next upgrade.
                </p>
                <span>
                  Explore collectibles <b aria-hidden="true">→</b>
                </span>
              </div>
            </a>
          </div>
          <p className={s.discoveryNote}>
            Take your time. The next discovery might be just around the bend.
          </p>
        </div>
      </section>
      <section className={s.fieldNotes}>
        <div className="container">
          <SectionHeading
            eyebrow="ABOUT OVER THE HILL"
            title="A drive worth taking your time over."
          />
          <p>
            Over the Hill is an off-road exploration game from Funselektor,
            released on Steam on October 14, 2026. Drive classic vehicles
            through Canada and Algeria, cross rough ground with winches and
            planks, and stop for cabins, viewpoints and wildlife photographs.
            Play alone or bring up to three friends.
          </p>
          <p>
            Over the Hill Hub helps you choose a rig, understand your equipment
            and decide what to look for next. Browse the garage and four Wiki
            categories, explore the region notes or start with our three
            practical guides. Demo costs and unlocks keep their version labels
            so you can tell which advice applies to your game.
          </p>
          <a href="/legal/about-us">About this fan site →</a>
        </div>
      </section>
      <section className={s.fieldNotes}>
        <div className={`container ${s.notesGrid}`}>
          <div className={s.guides}>
            <SectionHeading
              eyebrow="ESSENTIAL GUIDES"
              title="Practical advice for the road ahead."
              href="/guides"
              label="All guides"
            />
            <div className={s.guideGrid}>
              {guides.map((guide) => (
                <a
                  className={s.guideCard}
                  href={`/guides/${guide.slug}`}
                  key={guide.id}
                >
                  <div className={s.guideImage}>
                    <Image
                      src={guide.image}
                      alt={guide.imageAlt}
                      fill
                      sizes="(max-width:768px) 33vw, 20vw"
                    />
                  </div>
                  <div className={s.guideCopy}>
                    <h3>{guideLabels[guide.slug]?.title || guide.title}</h3>
                    <p>
                      {guideLabels[guide.slug]?.description ||
                        guide.description}
                    </p>
                    <span aria-hidden="true">→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <div className={s.news}>
            <SectionHeading
              eyebrow="LATEST FROM THE TRAIL"
              title="News and notes."
              href="/update"
              label="View Update"
            />
            <div className={s.newsList}>
              {[releaseNotes, ...updates].slice(0, 3).map((update) => (
                <a
                  href={`/update#${update.slug}`}
                  className={s.newsItem}
                  key={update.id}
                >
                  <time dateTime={update.publishedAt}>
                    <strong>{new Date(update.publishedAt).getUTCDate()}</strong>
                    <span>
                      {new Date(update.publishedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", timeZone: "UTC" },
                      )}
                    </span>
                  </time>
                  <div>
                    <h3>{update.title}</h3>
                    <p>{update.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <div className={s.faq}>
            <SectionHeading eyebrow="QUICK ANSWERS" title="Common questions." />
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
            <p className={s.closingNote}>
              Different roads.
              <br />
              Same spirit.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
