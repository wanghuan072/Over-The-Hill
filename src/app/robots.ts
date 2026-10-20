import type { MetadataRoute } from "next";
import { site } from "@/config/site";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(site.indexable ? { allow: "/" } : { disallow: "/" }),
    },
    sitemap: site.indexable ? `${site.url}/sitemap.xml` : undefined,
  };
}
