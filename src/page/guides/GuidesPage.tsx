import PageSchema from "@/seo/PageSchema";
import Image from "next/image";
import Breadcrumb from "@/components/content/Breadcrumb";
import ContentBrowser from "@/components/content/ContentBrowser";
import { guides, toSearchItem } from "@/lib/data/catalog";
import { staticMetadata } from "@/seo/metadata";
import { tdk } from "@/seo/tdk";
import s from "@/style/page/guides/guides.module.css";
export const metadata = staticMetadata("/guides");
export default function GuidesPage() {
  return (
    <section className={s.page}>
      <div className="container">
        <PageSchema path="/guides" />
        <Breadcrumb items={[{ label: "Guides", href: "/guides" }]} />
        <header className={s.intro}>
          <Image
            className={s.introImage}
            src="/images/game/screenshot-24.webp"
            alt="Mountain valley and forests in Over the Hill"
            fill
            preload
            sizes="(max-width:768px) 100vw, 1400px"
          />
          <span className={s.kicker}>
            A little knowledge for the long way round
          </span>
          <h1>{tdk["/guides"].h1}</h1>
          <p>{tdk["/guides"].intro}</p>
        </header>
        <div className={s.listHeading}>
          <span className={s.kicker}>THREE TRIPS WORTH PLANNING</span>
          <h2>A better build. A new ride. A rare photograph.</h2>
          <p>
            Choose the goal you have in mind, then take the map and checklist
            with you.
          </p>
        </div>
        <ContentBrowser items={guides.map((g) => toSearchItem(g, "/guides"))} />
        <section className={s.note}>
          <h2>Know what the trip is meant to give you</h2>
          <p>
            A first-clear reward, a repeat payout and a wildlife photograph are
            different goals. These guides separate the costs, locations and
            conditions so you can spend more of the trip driving toward what you
            want.
          </p>
        </section>
        <section className={s.faq}>
          <h2>Guide questions</h2>
          <details>
            <summary>Which guide helps with the first upgrades?</summary>
            <p>
              Start with{" "}
              <a href="/guides/pebbles-upgrade-order">
                Pebbles &amp; Upgrade Order
              </a>
              . It explains a 75-Pebble starting budget, the full 675-Pebble
              cost, repeat trail rewards and direct winch recovery for
              meteorites.
            </p>
          </details>
          <details>
            <summary>Where are the Trail Burner and Burro unlocks?</summary>
            <p>
              <a href="/guides/emerald-lake-trail-guide">
                The Emerald Lake trail guide
              </a>{" "}
              maps Windy Joe and Hermit, their checkpoint sequences and rewards.
              Elizabeth Oath is included too; it gives Kayaks rather than
              another vehicle.
            </p>
          </details>
          <details>
            <summary>Is there a specific Sasquatch location?</summary>
            <p>
              <a href="/guides/sasquatch-location">The Sasquatch guide</a> shows
              the northern Emerald Lake search position between two named crate
              landmarks, plus the night and dry-weather checks. A spawn pin
              narrows the search without guaranteeing a sighting.
            </p>
          </details>
        </section>
        <nav className={s.related} aria-label="Related collections">
          <a href="/wiki">Explore the Wiki →</a>
          <a href="/maps">Maps &amp; Regions →</a>
          <a href="/vehicles">Browse vehicles →</a>
          <a href="/wiki/equipment">Equipment →</a>
        </nav>
      </div>
    </section>
  );
}
