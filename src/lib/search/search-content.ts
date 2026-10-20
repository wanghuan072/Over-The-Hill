import type { SearchItem } from "@/types/content";
export function filterContent<T extends SearchItem>(
  items: T[],
  query: string,
  category: string,
) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return items.filter(
    (i) =>
      (category === "All" || i.category === category) &&
      terms.every((t) =>
        `${i.title} ${i.description} ${i.category} ${i.searchText || ""} ${i.attributes?.flatMap((field) => [field.label, field.value]).join(" ") || ""}`
          .toLowerCase()
          .includes(t),
      ),
  );
}
