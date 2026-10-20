/** Catalog records stay on their collection page until detail pages are added. */
export function contentHref(
  prefix: string,
  slug: string,
  category?: string,
): string {
  if (prefix.startsWith("/wiki"))
    return `/wiki/${category || prefix.split("/")[2]}#${slug}`;
  if (["/vehicles", "/maps"].includes(prefix)) return `${prefix}#${slug}`;
  return `${prefix}/${slug}`;
}
