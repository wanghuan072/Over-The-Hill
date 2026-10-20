import Image from "next/image";
import { entries, wikiCategories } from "@/lib/data/catalog";
import WikiIcon from "./WikiIcon";
import s from "@/style/page/wiki/wiki.module.css";
export default function WikiCategoryCards({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <nav
      className={`${s.categoryGrid} ${compact ? s.compact : ""}`}
      aria-label="Wiki chapters"
    >
      {wikiCategories.map((category) => (
        <a
          className={s.chapter}
          href={`/wiki/${category.slug}`}
          key={category.slug}
        >
          <div className={s.chapterVisual}>
            <Image
              src={category.image}
              alt=""
              fill
              sizes="(max-width:768px) 40vw, 25vw"
            />
            <span className={s.chapterBadge}>
              {
                entries.filter((entry) => entry.category === category.slug)
                  .length
              }{" "}
              entries
            </span>
            <small className={s.chapterArtLabel}>
              {category.artLabel || "Original illustration"}
            </small>
          </div>
          <div className={s.chapterCopy}>
            <div className={s.chapterTitle}>
              <WikiIcon category={category.slug} />
              <h3>{category.name}</h3>
            </div>
            <p>{category.intro}</p>
            <div className={s.chapterTopics}>
              {category.topics.map((topic) => (
                <span key={topic}>{topic}</span>
              ))}
            </div>
            <span>
              Explore {category.name.toLowerCase()} <b aria-hidden="true">→</b>
            </span>
          </div>
        </a>
      ))}
    </nav>
  );
}
