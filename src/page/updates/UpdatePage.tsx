import Image from "next/image";
import Breadcrumb from "@/components/content/Breadcrumb";
import UpdateJournal from "@/page/updates/UpdateJournal";
import { updates, releaseNotes } from "@/lib/data/catalog";
import PageSchema from "@/seo/PageSchema";
import { staticMetadata } from "@/seo/metadata";
import { tdk } from "@/seo/tdk";
import s from "@/style/page/update/update.module.css";

export const metadata = staticMetadata("/update");
const date = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));

export default function UpdatePage() {
  return (
    <section className={s.page}>
      <div className="container">
        <PageSchema path="/update" />
        <Breadcrumb items={[{ label: "Update", href: "/update" }]} />
        <header className={s.intro}>
          <Image
            className={s.introImage}
            src="/images/game/screenshot-26.webp"
            alt="An orange sunset over the mountains and pine forests of Over the Hill"
            fill
            preload
            sizes="(max-width:768px) 100vw, 1400px"
          />
          <div className={s.introCopy}>
            <span className={s.kicker}>
              The trail journal / News & patch notes
            </span>
            <h1>{tdk["/update"].h1}</h1>
            <p>{tdk["/update"].intro}</p>
            <a className={s.primaryLink} href={`#${releaseNotes.slug}`}>
              Read the patch notes <span aria-hidden="true">↘</span>
            </a>
          </div>
          <div className={s.issueStamp}>
            <span>Latest patch on the Hub</span>
            <strong>
              16 <span>OCT</span>
            </strong>
            <time dateTime={releaseNotes.publishedAt}>
              {date(releaseNotes.publishedAt)}
            </time>
          </div>
        </header>
        <nav className={s.journalNav} aria-label="On this update page">
          <a href={`#${releaseNotes.slug}`}>
            <span>01</span> Patch notes <b aria-hidden="true">↓</b>
          </a>
          <a href="#news-archive">
            <span>02</span> News archive <b aria-hidden="true">↓</b>
          </a>
          <a href="/guides">
            <span>03</span> Back on the trail <b aria-hidden="true">↗</b>
          </a>
        </nav>
        <section
          className={s.patch}
          id={releaseNotes.slug}
          aria-labelledby="release-patch-title"
        >
          <div className={s.listHeading}>
            <div>
              <span className={s.kicker}>What changed</span>
              <h2 id="release-patch-title">The October 16 patch</h2>
            </div>
            <span className={s.build}>Build {releaseNotes.gameVersion}</span>
          </div>
          <div className={s.feature}>
            <div className={s.featureImage}>
              <Image
                src="/images/game/screenshot-07.webp"
                alt="A vehicle and equipment out in the rain at night in Over the Hill"
                fill
                sizes="(max-width:768px) 100vw, 45vw"
              />
              <span className={s.imageCaption}>
                Back out there, rain or shine.
              </span>
            </div>
            <div className={s.featureCopy}>
              <span className={s.kicker}>
                Patch notes /{" "}
                <time dateTime={releaseNotes.publishedAt}>
                  {date(releaseNotes.publishedAt)}
                </time>
              </span>
              <h3>
                Repeat rewards are back.
                <br />
                Here’s what else changed.
              </h3>
              <p>{releaseNotes.description}</p>
              <ul className={s.highlights}>
                <li>Repeat challenges pay Pebbles again</li>
                <li>Camping weather advances correctly</li>
                <li>Co-op portal loading fix</li>
              </ul>
              <a href="#patch-changes" className={s.textLink}>
                See all changes <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className={s.changes} id="patch-changes">
            {releaseNotes.sections.map((section, index) => (
              <article className={s.note} key={section.heading}>
                <span className={s.noteNumber}>0{index + 1} / PATCH NOTES</span>
                <h3>{section.heading}</h3>
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
              </article>
            ))}
          </div>
        </section>
        <div className={s.archiveLayout}>
          <section
            id="news-archive"
            aria-labelledby="archive-title"
            className={s.archive}
          >
            <div className={s.listHeading}>
              <div>
                <span className={s.kicker}>Earlier in the journey</span>
                <h2 id="archive-title">From the trail journal</h2>
              </div>
              <span className={s.archiveCount}>{updates.length} entries</span>
            </div>
            <UpdateJournal items={updates} />
          </section>
          <aside className={s.sidebar} aria-label="More from Over the Hill Hub">
            <div className={s.fieldCard}>
              <div className={s.fieldImage}>
                <Image
                  src="/images/game/screenshot-02.webp"
                  alt="Off-road vehicles in an autumn forest in Over the Hill"
                  fill
                  sizes="(max-width:768px) 100vw, 330px"
                />
              </div>
              <div className={s.fieldCopy}>
                <span className={s.kicker}>Put it into practice</span>
                <h2>
                  The next trail
                  <br />
                  is waiting.
                </h2>
                <p>
                  Plan your upgrades, pick a vehicle and head back out with a
                  route in mind.
                </p>
                <a href="/guides/pebbles-upgrade-order">
                  Make your Pebbles count <span aria-hidden="true">→</span>
                </a>
                <a href="/vehicles">
                  Find your next ride <span aria-hidden="true">→</span>
                </a>
                <a href="/maps">
                  Explore the maps <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div className={s.contextNote}>
              <span className={s.kicker}>A note on older news</span>
              <p>
                Archive entries keep their original announcement dates.
                Pre-launch plans and Demo access notices describe that period;
                the October 16 patch above covers the release build.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
