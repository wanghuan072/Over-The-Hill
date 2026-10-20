export type MapView = { x: number; y: number; zoom: number };
export type MapSize = { width: number; height: number };
export const initialView: MapView = { x: 0.5, y: 0.5, zoom: 1 };
export function mapSide(size: MapSize, zoom: number) {
  return Math.min(size.width, size.height) * zoom;
}
export function constrainView(view: MapView, size: MapSize): MapView {
  const zoom = Math.max(1, Math.min(6, view.zoom));
  const side = mapSide(size, zoom);
  const bound = (value: number, length: number) => {
    const edge = Math.min(0.5, length / (2 * side));
    return Math.max(edge, Math.min(1 - edge, value));
  };
  return { zoom, x: bound(view.x, size.width), y: bound(view.y, size.height) };
}
export function zoomAt(
  view: MapView,
  size: MapSize,
  zoom: number,
  px: number,
  py: number,
): MapView {
  const nextZoom = Math.max(1, Math.min(6, zoom));
  const oldSide = mapSide(size, view.zoom);
  const nextSide = mapSide(size, nextZoom);
  return constrainView(
    {
      zoom: nextZoom,
      x: view.x + (px - size.width / 2) * (1 / oldSide - 1 / nextSide),
      y: view.y + (py - size.height / 2) * (1 / oldSide - 1 / nextSide),
    },
    size,
  );
}
export const progressKey = "oth-map-progress-v1";
export function readProgress(value: string, allowed: Set<string>): Set<string> {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("version" in parsed) ||
      parsed.version !== 1 ||
      !("found" in parsed) ||
      !Array.isArray(parsed.found)
    )
      return new Set();
    return new Set(
      parsed.found.filter(
        (id): id is string => typeof id === "string" && allowed.has(id),
      ),
    );
  } catch {
    return new Set();
  }
}
