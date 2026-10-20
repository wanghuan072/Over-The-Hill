import PageSchema from "@/seo/PageSchema";
import Breadcrumb from "@/components/content/Breadcrumb";
import { site } from "@/config/site";
import { pageUpdatedAt } from "@/seo/content-dates";
import s from "@/style/page/legal/legal.module.css";
import content from "@/data/legal/pages.json";
export const legalContent: Record<
  string,
  {
    title: string;
    description: string;
    sections: { title: string; text: string; paragraphs?: string[] }[];
  }
> = content;
export default function LegalPage({ slug }: { slug: string }) {
  const c = legalContent[slug];
  return (
    <section className={s.page}>
      <div className="container">
        <PageSchema
          path={`/legal/${slug}` as Parameters<typeof PageSchema>[0]["path"]}
        />
        <Breadcrumb items={[{ label: c.title, href: `/legal/${slug}` }]} />
        <header className={s.intro}>
          <span className={s.kicker}>OVER THE HILL HUB / SITE INFORMATION</span>
          <h1>{c.title}</h1>
          <p>{c.description}</p>
          <p>
            Last updated:{" "}
            <time dateTime={pageUpdatedAt(`/legal/${slug}`)}>
              {pageUpdatedAt(`/legal/${slug}`)}
            </time>
          </p>
        </header>
        {c.sections.map((section) => (
          <section className={s.note} key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
        <nav className={s.related} aria-label="Site information">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href="/legal/about-us">About us</a>
          <a href="/legal/privacy-policy">Privacy Policy</a>
        </nav>
      </div>
    </section>
  );
}
