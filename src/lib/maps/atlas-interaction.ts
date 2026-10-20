import type { AtlasPlace, MapNote } from "@/types/maps";

export const notesKey = "oth-map-notes-v1";
export function readNotes(raw: string, areas: Set<string>): MapNote[] {
  try {
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.notes)) return [];
    const ids = new Set<string>();
    return data.notes
      .filter((note: MapNote) => {
        const valid =
          typeof note?.id === "string" &&
          note.id.length > 0 &&
          note.id.length <= 80 &&
          !ids.has(note.id) &&
          areas.has(note.areaSlug) &&
          typeof note.label === "string" &&
          !!note.label.trim() &&
          note.label.length <= 140 &&
          Number.isFinite(note.x) &&
          note.x >= 0 &&
          note.x <= 1 &&
          Number.isFinite(note.y) &&
          note.y >= 0 &&
          note.y <= 1;
        if (valid) ids.add(note.id);
        return valid;
      })
      .slice(0, 250);
  } catch {
    return [];
  }
}
export function measurement(points: { x: number; y: number }[]) {
  return points
    .slice(1)
    .reduce(
      (total, p, i) =>
        total + Math.hypot(p.x - points[i].x, p.y - points[i].y) * 4000,
      0,
    );
}

export function progressIds(places: AtlasPlace[]) {
  return new Set(places.flatMap((p) => (p.progressId ? [p.progressId] : [])));
}

// Only dense spawn layers cluster. Named stops stay individually selectable.
export function clusterSpawns(
  places: AtlasPlace[],
  side: number,
  zoom: number,
  selectedId: string | null,
) {
  const groups = new Map<string, AtlasPlace[]>();
  for (const place of places) {
    const clustered =
      zoom < 4.5 &&
      place.id !== selectedId &&
      ["Wildlife", "Meteorite"].includes(place.category);
    const key = clustered
      ? `${place.category}-${place.speciesId || ""}-${Math.floor((place.x * side) / 36)}-${Math.floor((place.y * side) / 36)}`
      : place.id;
    const group = groups.get(key);
    if (group) group.push(place);
    else groups.set(key, [place]);
  }
  return [...groups.values()].map((points) => ({
    points,
    x: points.reduce((n, p) => n + p.x, 0) / points.length,
    y: points.reduce((n, p) => n + p.y, 0) / points.length,
  }));
}
