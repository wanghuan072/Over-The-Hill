import rawSources from "@/data/sources/sources.json";
import type { ContentRecord, ContentSource } from "@/types/content";

export const sources = rawSources as ContentSource[];
export function getSource(id: string) {
  return sources.find((source) => source.id === id);
}
export function sourceMoment(id: string, seconds?: number) {
  const source = getSource(id);
  if (!source) return "";
  const url = new URL(source.url);
  if (seconds !== undefined && url.hostname.includes("youtube.com"))
    url.searchParams.set("t", `${Math.floor(seconds)}s`);
  return url.toString();
}
export function recordSources(record: ContentRecord): ContentSource[] {
  const named = (record.sourceIds || [])
    .map(getSource)
    .filter((source): source is ContentSource => Boolean(source));
  const known = new Set(named.map((source) => source.url));
  const extra = [record.sourceUrl, ...(record.sourceUrls || [])]
    .filter(
      (url, index, urls) => !known.has(url) && urls.indexOf(url) === index,
    )
    .map((url) => ({
      id: url,
      title: url.includes("announcements/detail")
        ? "Original official announcement"
        : url.includes("discussions")
          ? "Developer discussion / FAQ"
          : "Public game reference",
      url,
      publisher: new URL(url).hostname,
      scope: record.gameVersion,
      checkedAt: record.lastVerifiedAt,
    }));
  return [...named, ...extra];
}
