import Image from "next/image";
import { entries, wikiCategories } from "@/lib/data/catalog";
import s from "@/style/page/wiki/wiki.module.css";

export default function WikiSidebar({ current }: { current: string }) {
  const links = (
    <nav aria-label="Wiki categories">
      {wikiCategories.map((category) => (
        <a
          href={`/wiki/${category.slug}`}
          key={category.slug}
          aria-current={category.slug === current ? "page" : undefined}
        >
          <span className={s.navImage}>
            <Image src={category.image} alt="" fill sizes="64px" />
          </span>
          <span>
            <strong>{category.name}</strong>
            <small>
              {
                entries.filter((entry) => entry.category === category.slug)
                  .length
              }{" "}
              entries
            </small>
          </span>
          <b aria-hidden="true">›</b>
        </a>
      ))}
    </nav>
  );
  return (
    <aside className={s.sidebar}>
      <div className={s.desktopNav}>
        <div className={s.sidebarHeading}>
          <span aria-hidden="true">▤</span> Explore the Wiki
        </div>
        {links}
        <a className={s.overviewLink} href="/wiki">
          ← All wiki categories
        </a>
      </div>
      <details className={s.mobileNav}>
        <summary>
          Browse wiki categories <span aria-hidden="true">＋</span>
        </summary>
        {links}
        <a className={s.overviewLink} href="/wiki">
          ← All wiki categories
        </a>
      </details>
      <div className={s.sidebarNote}>
        <span>EXPLORE FURTHER</span>
        <h2>Canada &amp; Algeria</h2>
        <p>Five release areas, with game maps, camps and challenge trails.</p>
        <a href="/maps">Browse regions →</a>
      </div>
    </aside>
  );
}
