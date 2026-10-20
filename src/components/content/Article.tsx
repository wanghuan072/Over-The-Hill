import { pageUpdatedAt } from "@/seo/content-dates";
import Image from "next/image";
import Breadcrumb from "./Breadcrumb";
import FactTable from "./FactTable";
import JsonLd from "@/seo/JsonLd";
import { site } from "@/config/site";
import { linkTitle } from "@/lib/data/catalog";
import type { ContentRecord } from "@/types/content";
import s from "@/style/content/article.module.css";
export default function Article({
  record,
  prefix,
  title,
  article = false,
}: {
  record: ContentRecord;
  prefix: string;
  title: string;
  article?: boolean;
}) {
  const href = `${prefix}/${record.slug}`;
  const cover =
    prefix === "/update" ? "/images/game/screenshot-26.webp" : record.image;
  return (
    <section className={s.article}>
      <div className="container">
        <Breadcrumb
          items={[
            { label: title, href: prefix },
            { label: record.title, href },
          ]}
        />
        <header className={s.header}>
          <div className={s.headerImage}>
            <Image
              src={cover}
              alt={
                prefix === "/update"
                  ? "Over the Hill sunset landscape"
                  : record.imageAlt
              }
              fill
              preload
              sizes="(max-width:768px) 100vw, 1400px"
            />
          </div>
          <span className={s.kicker}>
            {record.category} · {record.gameVersion}
          </span>
          <h1>
            {record.title}
            {prefix === "/maps" ? " Map & Locations" : ""}
          </h1>
          <p>{record.description}</p>
          <span className={s.date}>
            Updated{" "}
            <time dateTime={pageUpdatedAt(href)}>{pageUpdatedAt(href)}</time>
            {record.readingMinutes && <> · {record.readingMinutes} min read</>}
            {prefix === "/update" && (
              <>
                {" "}
                · Published{" "}
                <time dateTime={record.publishedAt}>{record.publishedAt}</time>
              </>
            )}
          </span>
        </header>
        <div className={s.layout}>
          <aside className={s.toc}>
            <h2>On this page</h2>
            <nav aria-label="Article contents">
              {record.facts?.length ? (
                <a href="#reference-data">At a glance</a>
              ) : null}
              {record.sections.map((section, i) => (
                <a key={section.heading} href={`#section-${i}`}>
                  {section.heading}
                </a>
              ))}
            </nav>
          </aside>
          <article className={s.body}>
            {record.facts?.length ? (
              <section id="reference-data">
                <h2>At a glance</h2>
                <FactTable facts={record.facts} />
              </section>
            ) : null}
            {record.sections.map((section, i) => (
              <section key={section.heading} id={`section-${i}`}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {section.image && (
                  <figure
                    className={s.figure}
                    data-kind={section.image.kind || "scene"}
                    tabIndex={0}
                    aria-label={section.image.alt}
                  >
                    <Image
                      src={section.image.src}
                      alt={section.image.alt}
                      width={1200}
                      height={800}
                      sizes="(max-width:768px) 100vw, 760px"
                      className={s.inlineImage}
                    />
                    <figcaption>
                      {section.image.caption}
                      <a href={section.image.src}>Open full-size image →</a>
                    </figcaption>
                  </figure>
                )}
                {section.callout && (
                  <aside className={s.fieldTip}>
                    <h3>{section.callout.title}</h3>
                    <p>{section.callout.text}</p>
                  </aside>
                )}
                {section.steps && (
                  <ol className={s.steps}>
                    {section.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                )}
                {section.bullets && (
                  <ul className={s.bullets}>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
                {section.table && (
                  <div
                    className={s.tableWrap}
                    tabIndex={0}
                    role="region"
                    aria-label={`${section.heading} table`}
                  >
                    <table>
                      <caption>{section.heading}</caption>
                      <thead>
                        <tr>
                          {section.table.headers.map((header) => (
                            <th scope="col" key={header}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row) => (
                          <tr key={row[0]}>
                            {row.map((cell, index) =>
                              index === 0 ? (
                                <th scope="row" key={index}>
                                  {cell}
                                </th>
                              ) : (
                                <td key={index}>{cell}</td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {section.links && (
                  <nav
                    className={s.sectionLinks}
                    aria-label={`${section.heading} links`}
                  >
                    {section.links.map((link) => (
                      <a key={link.href} href={link.href}>
                        {link.label} →
                      </a>
                    ))}
                  </nav>
                )}
              </section>
            ))}
            {record.questions && (
              <section className={s.questions}>
                <h2>Common questions</h2>
                {record.questions.map((item) => (
                  <details key={item.question}>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </section>
            )}
            <section className={s.related}>
              <h2>Continue exploring</h2>
              {record.related.map((h) => (
                <a key={h} href={h}>
                  {linkTitle(h)} →
                </a>
              ))}
            </section>
          </article>
        </div>
        {article && (
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "Article",
              headline: record.title,
              description: record.description,
              datePublished: record.publishedAt,
              dateModified: pageUpdatedAt(href),
              mainEntityOfPage: site.url + href,
              author: {
                "@type": "Organization",
                "@id": site.url + "/#organization",
                name: site.name,
                url: site.url + "/legal/about-us",
              },
              publisher: {
                "@type": "Organization",
                "@id": site.url + "/#organization",
                name: site.name,
                logo: {
                  "@type": "ImageObject",
                  url: site.url + "/images/logo.svg",
                },
              },
              image: site.url + cover,
              inLanguage: "en",
            }}
          />
        )}
      </div>
    </section>
  );
}
