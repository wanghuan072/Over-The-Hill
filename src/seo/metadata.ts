import type { Metadata } from "next";
import { tdk } from "./tdk";
import { site } from "@/config/site";
import { pageUpdatedAt } from "./content-dates";
import type { ContentRecord } from "@/types/content";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  index = true,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: site.indexable && index, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/images/og-image.png",
          width: 1200,
          height: 630,
          alt: "Over the Hill Hub — independent explorer’s wiki",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-image.png"],
    },
  };
}

export function staticMetadata(path: keyof typeof tdk) {
  const item = tdk[path];
  if (!item) {
    throw new Error(`Missing SEO configuration for page: ${path}`);
  }
  return pageMetadata(item.title, item.description, path, path !== "/search");
}

export function articleMetadata(record: ContentRecord, path: string): Metadata {
  const base = pageMetadata(record.seo.title, record.seo.description, path);
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: record.publishedAt,
      modifiedTime: pageUpdatedAt(path),
    },
  };
}
