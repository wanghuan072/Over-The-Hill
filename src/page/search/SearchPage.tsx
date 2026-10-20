import PageSchema from "@/seo/PageSchema";
import Image from "next/image";
import Breadcrumb from "@/components/content/Breadcrumb";
import ContentBrowser from "@/components/content/ContentBrowser";
import { searchIndex } from "@/lib/data/catalog";
import { staticMetadata } from "@/seo/metadata";
import { tdk } from "@/seo/tdk";
import s from "@/style/page/search/search.module.css";
export const metadata = staticMetadata("/search");
export default function SearchPage() {
  return (
    <section className={s.page}>
      <div className="container">
        <PageSchema path="/search" />
        <Breadcrumb items={[{ label: "Search", href: "/search" }]} />
        <header className={s.intro}>
          <Image
            className={s.introImage}
            src="/images/game/screenshot-24.webp"
            alt="A mountain pass through the Over the Hill wilderness"
            fill
            preload
            sizes="(max-width:768px) 100vw, 1400px"
          />
          <span className={s.kicker}>SEARCH THE FIELD GUIDE</span>
          <h1>{tdk["/search"].h1}</h1>
          <p>{tdk["/search"].intro}</p>
          <span className={s.resultScope}>
            {searchIndex.length} searchable entries · Vehicles, regions, gear
            &amp; more
          </span>
        </header>
        <ContentBrowser items={searchIndex} searchPage />
      </div>
    </section>
  );
}
