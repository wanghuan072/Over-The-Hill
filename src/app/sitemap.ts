import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { indexablePaths } from "@/seo/sitemap";
import { pageUpdatedAt } from "@/seo/content-dates";
export default function sitemap(): MetadataRoute.Sitemap {
  return site.indexable
    ? indexablePaths.map((path): MetadataRoute.Sitemap[number] => ({
        url: site.url + path,
        lastModified: pageUpdatedAt(path),
        changeFrequency:
          path === "/" || path === "/update"
            ? "weekly"
            : path.startsWith("/legal/")
              ? "yearly"
              : "monthly",
        priority:
          path === "/"
            ? 1
            : path.startsWith("/legal/")
              ? 0.3
              : path.split("/").length === 2
                ? 0.8
                : 0.6,
      }))
    : [];
}
