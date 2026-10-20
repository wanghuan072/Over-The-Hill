import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { indexablePaths } from "@/seo/sitemap";
import { pageUpdatedAt } from "@/seo/content-dates";
export default function sitemap(): MetadataRoute.Sitemap {
  return site.indexable
    ? indexablePaths.map((path) => ({
        url: site.url + path,
        lastModified: pageUpdatedAt(path),
      }))
    : [];
}
