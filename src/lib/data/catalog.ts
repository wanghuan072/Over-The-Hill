import rawGuides from "@/data/guides/guides.json";
import rawEntries from "@/data/wiki/entries.json";
import rawAchievements from "@/data/wiki/achievements.json";
import rawWikiCategories from "@/data/wiki/categories.json";
import rawRegions from "@/data/maps/regions.json";
import rawUpdates from "@/data/updates/updates.json";
import rawReleaseNotes from "@/data/updates/release-notes.json";
import rawVehicles from "@/data/vehicles/vehicles.json";
import rawVehicleReference from "@/data/vehicles/systems.json";
import rawLocations from "@/data/maps/locations.json";
import type { ContentRecord, SearchItem } from "@/types/content";
import type { Vehicle, MapLocation, MapRegion, Region } from "@/types/tools";
import { contentHref } from "./content-paths";
const confirmed = (records: ContentRecord[]) =>
  records.filter((r) => r.verificationStatus === "confirmed");
export const guides = confirmed(rawGuides as ContentRecord[]);
export const entries = confirmed([
  ...rawEntries,
  ...rawAchievements,
] as ContentRecord[]);
export const regions = confirmed(rawRegions as ContentRecord[]) as Region[];
export const mapRegions: MapRegion[] = regions
  .filter((r) => r.category === "Region")
  .map((r) => ({
    slug: r.slug,
    title: r.title,
    mapImage: r.mapImage,
    mapWidth: r.mapWidth,
    mapHeight: r.mapHeight,
  }));
export const updates = confirmed(rawUpdates as ContentRecord[]).sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);
export const vehicles = confirmed(rawVehicles as Vehicle[]) as Vehicle[];
export const vehicleReference = rawVehicleReference as ContentRecord;
export const releaseNotes = rawReleaseNotes as ContentRecord;
export const locations = (rawLocations as MapLocation[]).filter(
  (r) => r.verificationStatus === "confirmed",
);
export const wikiCategories = rawWikiCategories;
export const categories = wikiCategories.map((category) => category.slug);
export function toSearchItem(r: ContentRecord, prefix: string): SearchItem {
  return {
    title: r.title,
    description: r.description,
    category: r.category,
    href: contentHref(prefix, r.slug, r.category),
    image: r.image,
    imageAlt: r.imageAlt,
    imageLabel: r.imageLabel,
    imageKind: r.imageKind,
    attributes:
      r.displayFacts || r.facts?.map(({ label, value }) => ({ label, value })),
    searchText: [
      ...(r.facts || []).flatMap((fact) => [fact.label, fact.value]),
      ...(r.playerNotes || []),
      ...r.sections.flatMap((section) => [
        section.heading,
        ...section.paragraphs,
        section.callout?.title || "",
        section.callout?.text || "",
        section.image?.alt || "",
        section.image?.caption || "",
        ...(section.steps || []),
        ...(section.bullets || []),
        ...(section.table?.rows.flat() || []),
      ]),
    ].join(" "),
  };
}
export const searchIndex: SearchItem[] = [
  {
    ...toSearchItem(releaseNotes, "/update"),
    href: `/update#${releaseNotes.slug}`,
  },
  { ...toSearchItem(vehicleReference, "/vehicles"), href: "/vehicles" },
  ...guides.map((r) => toSearchItem(r, "/guides")),
  ...entries.map((r) => toSearchItem(r, `/wiki/${r.category}`)),
  ...regions.map((r) => toSearchItem(r, "/maps")),
  ...vehicles.map((r) => toSearchItem(r, "/vehicles")),
  ...updates.map((r) => ({
    ...toSearchItem(r, "/update"),
    href: `/update#${r.slug}`,
  })),
];
export function linkTitle(href: string) {
  return (
    searchIndex.find((i) => i.href === href)?.title ||
    href.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") ||
    "Home"
  );
}
