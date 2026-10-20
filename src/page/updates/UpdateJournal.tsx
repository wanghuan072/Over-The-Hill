import type { ContentRecord } from "@/types/content";
import s from "@/style/page/update/update.module.css";

const month = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

export default function UpdateJournal({ items }: { items: ContentRecord[] }) {
  return (
    <div className={s.timeline}>
      {items.map((entry) => (
        <article
          className={s.newsRow}
          key={entry.slug}
          id={entry.slug}
          aria-labelledby={`${entry.slug}-title`}
        >
          <time className={s.date} dateTime={entry.publishedAt}>
            <span>
              {month.format(new Date(`${entry.publishedAt}T00:00:00Z`))}
            </span>
            <strong>{entry.publishedAt.slice(8)}</strong>
            <span>{entry.publishedAt.slice(0, 4)}</span>
          </time>
          <div className={s.newsLink}>
            <div className={s.newsMeta}>
              <span>
                {entry.slug.includes("stream")
                  ? "Developer broadcast"
                  : "Announcement"}
              </span>
              <span>
                {entry.publishedAt < "2026-10-14"
                  ? "Pre-launch archive"
                  : "After launch"}
              </span>
            </div>
            <h3 id={`${entry.slug}-title`}>{entry.title}</h3>
            <p className={s.entryIntro}>{entry.description}</p>
            <div className={s.entryNotes}>
              {entry.sections.map((section) => (
                <section key={section.heading}>
                  <h4>{section.heading}</h4>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets?.length ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
