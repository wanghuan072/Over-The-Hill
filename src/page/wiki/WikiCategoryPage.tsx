import PageSchema from "@/seo/PageSchema";
import { tdk } from "@/seo/tdk";
import Image from "next/image";
import Breadcrumb from "@/components/content/Breadcrumb";
import { entries, wikiCategories } from "@/lib/data/catalog";
import WikiSidebar from "./WikiSidebar";
import WikiList from "./WikiList";
import s from "@/style/page/wiki/wiki.module.css";
export default function WikiCategoryPage({
  category,
}: {
  category: (typeof wikiCategories)[number];
}) {
  const records = entries.filter((entry) => entry.category === category.slug);
  return (
    <section className={s.page}>
      <div className="container">
        <PageSchema
          path={
            `/wiki/${category.slug}` as Parameters<typeof PageSchema>[0]["path"]
          }
        />
        <Breadcrumb
          items={[
            { label: "Wiki", href: "/wiki" },
            { label: category.name, href: `/wiki/${category.slug}` },
          ]}
        />
        <header className={s.categoryHero}>
          <div className={s.categoryArt}>
            <Image
              src={category.image}
              alt=""
              fill
              preload
              sizes="(max-width:768px) 100vw, 40vw"
            />
          </div>
          <div className={s.heroShade} />
          <div className={s.heroCopy}>
            <span className={s.kicker}>{category.eyebrow}</span>
            <h1>{tdk[`/wiki/${category.slug}` as keyof typeof tdk].h1}</h1>
            <p>{tdk[`/wiki/${category.slug}` as keyof typeof tdk].intro}</p>
            <span className={s.heroCount}>
              {records.length} entries · The explorer’s field guide
            </span>
          </div>
          <span className={s.artLabel}>
            {category.artLabel || "Original category illustration"}
          </span>
        </header>
        <div className={s.contentLayout}>
          <WikiSidebar current={category.slug} />
          <WikiList
            name={category.name}
            note={category.note}
            items={records.map((entry) => ({
              slug: entry.slug,
              title: entry.title,
              description: entry.description,
              image: entry.image,
              imageAlt: entry.imageAlt,
              imageLabel: entry.imageLabel,
              imageKind: entry.imageKind,
              facts: entry.displayFacts || [],
              notes: entry.playerNotes || [],
              group: entry.listGroup,
              hidden: entry.hidden,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
