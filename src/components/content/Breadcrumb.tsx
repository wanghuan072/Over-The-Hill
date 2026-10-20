import JsonLd from "@/seo/JsonLd";
import { site } from "@/config/site";
import s from "@/style/content/breadcrumb.module.css";
export default function Breadcrumb({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={s.breadcrumb}>
        {all.map((i, n) => (
          <span key={i.href}>
            {n > 0 && <span aria-hidden="true"> / </span>}
            <a
              href={i.href}
              aria-current={n === all.length - 1 ? "page" : undefined}
            >
              {i.label}
            </a>
          </span>
        ))}
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((i, n) => ({
            "@type": "ListItem",
            position: n + 1,
            name: i.label,
            item: site.url + i.href,
          })),
        }}
      />
    </>
  );
}
