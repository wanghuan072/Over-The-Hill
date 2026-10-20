import JsonLd from "./JsonLd";
import { site } from "@/config/site";
import { tdk } from "./tdk";
import { pageUpdatedAt } from "./content-dates";
export default function PageSchema({ path }: { path: keyof typeof tdk }) {
  const item = tdk[path];
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type":
          path === "/search"
            ? "SearchResultsPage"
            : path.startsWith("/legal/")
              ? "WebPage"
              : "CollectionPage",
        "@id": site.url + path + "#webpage",
        url: site.url + path,
        name: item.title,
        description: item.description,
        inLanguage: "en",
        isPartOf: { "@id": site.url + "/#website" },
        ...(path === "/search" ? {} : { dateModified: pageUpdatedAt(path) }),
      }}
    />
  );
}
