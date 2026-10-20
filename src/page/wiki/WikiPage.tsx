import PageSchema from "@/seo/PageSchema";
import Image from "next/image";
import Breadcrumb from "@/components/content/Breadcrumb";
import { entries, wikiCategories } from "@/lib/data/catalog";
import { staticMetadata } from "@/seo/metadata";
import { tdk } from "@/seo/tdk";
import WikiCategoryCards from "./WikiCategoryCards";
import s from "@/style/page/wiki/wiki.module.css";
export const metadata = staticMetadata("/wiki");
export default function WikiPage() {
  return (
    <section className={s.page}>
      <div className="container">
        <PageSchema path="/wiki" />
        <Breadcrumb items={[{ label: "Wiki", href: "/wiki" }]} />
        <header className={s.hubHero}>
          <Image
            src="/images/game/screenshot-01.webp"
            alt=""
            fill
            preload
            sizes="(max-width:768px) 100vw, 1400px"
          />
          <div className={s.heroShade} />
          <div className={s.heroCopy}>
            <span className={s.kicker}>
              GEAR. DISCOVERIES. THE GREAT OUTDOORS.
            </span>
            <h1>{tdk["/wiki"].h1}</h1>
            <p>{tdk["/wiki"].intro}</p>
            <div className={s.heroFacts}>
              <span>{wikiCategories.length} categories</span>
              <span>{entries.length} field entries</span>
              <span>Release and Demo differences labelled</span>
            </div>
          </div>
          <span className={s.heroScript}>Take the scenic route.</span>
        </header>
        <div className={s.sectionHeading}>
          <div>
            <span className={s.kicker}>START EXPLORING</span>
            <h2>Browse the Wiki categories</h2>
          </div>
          <p>Open a list to search its items and read the gameplay notes.</p>
        </div>
        <WikiCategoryCards />
        <aside className={s.endNote}>
          <div>
            <span className={s.kicker}>VEHICLES &amp; REGIONS</span>
            <h2>Browse the garage or look up an area</h2>
          </div>
          <a href="/vehicles">Explore vehicles →</a>
          <a href="/maps">Find your next region →</a>
        </aside>
      </div>
    </section>
  );
}
