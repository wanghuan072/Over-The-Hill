"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react";
import type {
  AtlasPlace as Place,
  AtlasTrail,
  AtlasSpecies,
  AtlasReward,
  AtlasArea as Area,
  MapNote,
} from "@/types/maps";
import {
  clusterSpawns,
  progressIds,
  readNotes,
  notesKey,
  measurement,
} from "@/lib/maps/atlas-interaction";
import {
  constrainView,
  initialView,
  mapSide,
  progressKey,
  readProgress,
  zoomAt,
  type MapSize,
} from "@/lib/maps/viewport";
import s from "@/style/page/maps/interactive.module.css";

const categories = [
  {
    key: "Cabin",
    label: "Cabins & camps",
    icon: "⌂",
    note: "A stop for repairs, supplies and your next departure.",
  },
  {
    key: "Scenic Point",
    label: "Scenic points",
    icon: "◎",
    note: "A lookout or landmark worth taking a detour to reach.",
  },
  {
    key: "Challenge Trail",
    label: "Challenge trails",
    icon: "⚑",
    note: "Start here and follow the numbered checkpoints. Lines connect the checkpoints; they do not trace the road.",
  },
  {
    key: "Mechanic",
    label: "Mechanics",
    icon: "⚒",
    note: "Visit Crazy Günther to work on your vehicle and change your loadout.",
  },
  {
    key: "Portal",
    label: "Ferries & tunnels",
    icon: "↗",
    note: "An area exit. Check the destination before continuing your trip.",
  },
  {
    key: "Crate",
    label: "Reward crates",
    icon: "▣",
    note: "Find and open this crate to collect its first-time rewards.",
  },
  {
    key: "Recovery",
    label: "Recovery jobs",
    icon: "⚓",
    note: "This is the recovery pickup. Check the job in the game for its delivery destination; no drop-off route is plotted here.",
  },
  {
    key: "Wildlife",
    label: "Wildlife spawns",
    icon: "♧",
    note: "A possible spawn position, not a guaranteed sighting. Use the Safari Camera to register the species.",
  },
  {
    key: "Meteorite",
    label: "Meteorite spawns",
    icon: "✦",
    note: "A possible spawn position in build 25992246, after the October 16 update. Bring the Meteorite Radar; a meteorite will not be present at every pin. Random spawns are not part of the completion checklist.",
  },
];
const changeEvent = "oth-map-progress-change";
function subscribe(callback: () => void) {
  const storage = (event: StorageEvent) => {
    if (
      event.key === progressKey ||
      event.key === notesKey ||
      event.key === null
    )
      callback();
  };
  window.addEventListener("storage", storage);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(changeEvent, callback);
  };
}
function snapshot() {
  try {
    return window.localStorage.getItem(progressKey) || "";
  } catch {
    return "unavailable";
  }
}
function notesSnapshot() {
  try {
    return window.localStorage.getItem(notesKey) || "";
  } catch {
    return "unavailable";
  }
}
const subscribeUrl = (callback: () => void) => {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};
const urlSnapshot = () => window.location.search;
const serverSnapshot = () => "";
const subscribeFullscreen = (callback: () => void) => {
  document.addEventListener("fullscreenchange", callback);
  return () => document.removeEventListener("fullscreenchange", callback);
};
const fullscreenSnapshot = () => !!document.fullscreenElement;
const noFullscreen = () => false;

export default function InteractiveMap({
  areas,
  places,
  trails,
  species,
}: {
  areas: Area[];
  places: Place[];
  trails: AtlasTrail[];
  species: Record<string, AtlasSpecies>;
}) {
  const [areaOverride, setAreaSlug] = useState<string | null>(null);
  const urlQuery = useSyncExternalStore(
    subscribeUrl,
    urlSnapshot,
    serverSnapshot,
  );
  const requested = new URLSearchParams(urlQuery);
  const requestedArea = areas.find((a) => a.slug === requested.get("area"));
  const areaSlug = areaOverride || requestedArea?.slug || areas[0].slug;
  const [basemap, setBasemap] = useState("satellite");
  const [hazards, setHazards] = useState<string[]>([]);
  const [opacity, setOpacity] = useState(60);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [tool, setTool] = useState<"pan" | "measure" | "note">("pan");
  const [measurePoints, setMeasurePoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [noteDraft, setNoteDraft] = useState<MapNote | null>(null);
  const [noteLabel, setNoteLabel] = useState("");
  const gestureStart = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const [query, setQuery] = useState("");
  const [enabled, setEnabled] = useState(
    categories.map((category) => category.key),
  );
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [weatherFilter, setWeatherFilter] = useState("");
  const [showTrails, setShowTrails] = useState(true);
  const [confirmPhotos, setConfirmPhotos] = useState(false);
  const mapColumn = useRef<HTMLDivElement>(null);
  const [hideFound, setHideFound] = useState(false);
  const [selectedOverride, setSelectedId] = useState<string | null | undefined>(
    undefined,
  );
  const selectedId =
    selectedOverride === undefined
      ? places.find(
          (p) => p.id === requested.get("pin") && p.areaSlug === areaSlug,
        )?.id || null
      : selectedOverride;
  const [view, setView] = useState(initialView);
  const [size, setSize] = useState<MapSize>({ width: 800, height: 560 });
  const [notice, setNotice] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const noteInput = useRef<HTMLInputElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const fullscreen = useSyncExternalStore(
    subscribeFullscreen,
    fullscreenSnapshot,
    noFullscreen,
  );
  const noteRaw = useSyncExternalStore(
    subscribe,
    notesSnapshot,
    serverSnapshot,
  );
  const allowedAreas = useMemo(
    () => new Set(areas.map((a) => a.slug)),
    [areas],
  );
  const notes = useMemo(
    () => readNotes(noteRaw, allowedAreas),
    [noteRaw, allowedAreas],
  );
  const areaNotes = notes.filter((n) => n.areaSlug === areaSlug);
  const allowed = useMemo(() => progressIds(places), [places]);
  const found = useMemo(() => readProgress(raw, allowed), [raw, allowed]);
  const area = areas.find((item) => item.slug === areaSlug)!;
  const areaPlaces = places.filter((place) => place.areaSlug === areaSlug);
  const visible = areaPlaces.filter(
    (place) =>
      enabled.includes(place.category) &&
      (!hideFound || !place.progressId || !found.has(place.progressId)) &&
      (place.category !== "Wildlife" ||
        ((!speciesFilter || place.speciesId === speciesFilter) &&
          (!timeFilter ||
            species[place.speciesId!].time.includes(timeFilter)) &&
          (!weatherFilter ||
            species[place.speciesId!].weather.includes(weatherFilter)))) &&
      `${place.title} ${place.reward || ""} ${(place.rewards || []).map((r) => r.name).join(" ")} ${place.category}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const selected = visible.find((place) => place.id === selectedId);
  const areaStops = areaPlaces.filter((p) => p.progressId && !p.speciesId);
  const completed = areaStops.filter((p) => found.has(p.progressId!)).length;
  const photos = Object.keys(species).filter((id) =>
    found.has(`species-${id}`),
  ).length;
  const animal = selected?.speciesId ? species[selected.speciesId] : undefined;
  const selectedTrail = trails.find((t) => t.placeId === selected?.id);
  const side = mapSide(size, view.zoom);
  const bounded = constrainView(view, size);
  const clusters = clusterSpawns(visible, side, view.zoom, selectedId);
  const visibleTrails = showTrails
    ? trails.filter(
        (t) =>
          t.areaSlug === areaSlug && visible.some((p) => p.id === t.placeId),
      )
    : [];
  const isFound = (place: Place) =>
    !!place.progressId && found.has(place.progressId);

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(node);
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      const rect = node.getBoundingClientRect();
      const dimensions = { width: rect.width, height: rect.height };
      setView((current) =>
        zoomAt(
          current,
          dimensions,
          current.zoom * Math.exp(-event.deltaY * 0.0015),
          event.clientX - rect.left,
          event.clientY - rect.top,
        ),
      );
    };
    node.addEventListener("wheel", wheel, { passive: false });
    return () => {
      observer.disconnect();
      node.removeEventListener("wheel", wheel);
    };
  }, []);

  useEffect(() => {
    if (noteDraft) noteInput.current?.focus();
  }, [noteDraft]);
  function save(next: Set<string>) {
    try {
      window.localStorage.setItem(
        progressKey,
        JSON.stringify({ version: 1, found: [...next] }),
      );
      window.dispatchEvent(new Event(changeEvent));
      setNotice("");
    } catch {
      setNotice(
        "Your browser could not save progress. Allow local storage to keep your discoveries.",
      );
    }
  }
  function toggleFound(id: string) {
    const next = new Set(found);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    save(next);
  }
  function focus(place: Place) {
    setTool("pan");
    setNoteDraft(null);
    setSelectedId(place.id);
    setView(
      constrainView(
        { x: place.x, y: place.y, zoom: Math.max(3, view.zoom) },
        size,
      ),
    );
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button"))
      return;
    gestureStart.current = { x: event.clientX, y: event.clientY };
    dragged.current = false;
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    if (
      gestureStart.current &&
      Math.hypot(
        event.clientX - gestureStart.current.x,
        event.clientY - gestureStart.current.y,
      ) > 5
    )
      dragged.current = true;
    const before = [...pointers.current.values()];
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    const after = [...pointers.current.values()];
    const center = (points: typeof before) => ({
      x: points.reduce((n, p) => n + p.x, 0) / points.length,
      y: points.reduce((n, p) => n + p.y, 0) / points.length,
    });
    const a = center(before),
      b = center(after);
    const rect = event.currentTarget.getBoundingClientRect();
    setView((current) => {
      let next = constrainView(current, size);
      if (before.length === 2) {
        const distance = (points: typeof before) =>
          Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        next = zoomAt(
          next,
          size,
          (next.zoom * distance(after)) / Math.max(1, distance(before)),
          a.x - rect.left,
          a.y - rect.top,
        );
      }
      return constrainView(
        {
          ...next,
          x: next.x - (b.x - a.x) / mapSide(size, next.zoom),
          y: next.y - (b.y - a.y) / mapSide(size, next.zoom),
        },
        size,
      );
    });
  }
  const stopPointer = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
  };
  function changeArea(slug: string) {
    setAreaSlug(slug);
    setView(initialView);
    setSelectedId(null);
    setConfirmReset(false);
    setQuery("");
    setSpeciesFilter("");
    setTimeFilter("");
    setWeatherFilter("");
    setHazards([]);
    setTool("pan");
    setMeasurePoints([]);
    setNoteDraft(null);
    setShareLink("");
    setNotice("");
  }
  function planPoint(point: { x: number; y: number }) {
    if (point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) return;
    if (tool === "measure")
      setMeasurePoints((current) =>
        current.length < 30 ? [...current, point] : current,
      );
    else if (tool === "note") {
      setNoteDraft({ id: crypto.randomUUID(), areaSlug, ...point, label: "" });
      setNoteLabel("");
    }
  }
  function saveNotes(next: MapNote[]) {
    try {
      window.localStorage.setItem(
        notesKey,
        JSON.stringify({ version: 1, notes: next }),
      );
      window.dispatchEvent(new Event(changeEvent));
      setNoteDraft(null);
      stage.current?.focus({ preventScroll: true });
      setNotice("");
    } catch {
      setNotice(
        "Your browser could not save this note. Allow local storage to keep map notes.",
      );
    }
  }
  async function share() {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("area", areaSlug);
    if (selected) url.searchParams.set("pin", selected.id);
    url.hash = "interactive-map";
    setShareLink(url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice("Map link copied.");
    } catch {
      setNotice("Copy the map link from the field above.");
    }
  }
  const zoom = (factor: number) =>
    setView((current) =>
      zoomAt(
        current,
        size,
        current.zoom * factor,
        size.width / 2,
        size.height / 2,
      ),
    );

  return (
    <section
      id="interactive-map"
      className={s.atlas}
      aria-labelledby="atlas-title"
      data-filters-open={filtersOpen}
    >
      <header className={s.heading}>
        <div>
          <span className={s.eyebrow}>THE EXPLORER’S ATLAS</span>
          <h2 id="atlas-title">Pick a place. Find your way.</h2>
        </div>
        <p>
          Five real game maps. Find your next unlock.
          <br />
          Crates, challenge trails, recovery jobs and wildlife.
        </p>
        <button
          className={s.mobileFilters}
          aria-expanded={filtersOpen}
          aria-controls="map-sidebar"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          {filtersOpen ? "Close filters" : "Map filters & search"}
        </button>
      </header>
      <div className={s.tabs} role="group" aria-label="Choose map area">
        {areas.map((item, index) => (
          <button
            key={item.slug}
            aria-pressed={areaSlug === item.slug}
            onClick={() => changeArea(item.slug)}
          >
            <span>
              0{index + 1} / {item.region === "canada" ? "CANADA" : "ALGERIA"}
            </span>
            {item.title}
          </button>
        ))}
      </div>
      <div className={s.workspace}>
        <aside
          id="map-sidebar"
          className={s.sidebar}
          aria-label="Map filters and locations"
        >
          <div className={s.search}>
            <label htmlFor="map-search">Find a stop in {area.title}</label>
            <div>
              <input
                id="map-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Place, species or reward"
              />
              {query && (
                <button
                  aria-label="Clear map search"
                  onClick={() => setQuery("")}
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <fieldset className={s.filters}>
            <legend>ON YOUR MAP</legend>
            {categories.map((category) => (
              <label key={category.key}>
                <input
                  type="checkbox"
                  checked={enabled.includes(category.key)}
                  onChange={() =>
                    setEnabled((current) =>
                      current.includes(category.key)
                        ? current.filter((key) => key !== category.key)
                        : [...current, category.key],
                    )
                  }
                />
                <span
                  className={s.symbol}
                  data-category={category.key}
                  aria-hidden="true"
                >
                  {category.icon}
                </span>
                {category.label}
                <b>
                  {
                    areaPlaces.filter(
                      (place) => place.category === category.key,
                    ).length
                  }
                </b>
              </label>
            ))}
            <div className={s.filterActions}>
              <button
                onClick={() =>
                  setEnabled(categories.map((category) => category.key))
                }
              >
                Show all
              </button>
              <button onClick={() => setEnabled([])}>Hide all</button>
            </div>
          </fieldset>
          {enabled.includes("Wildlife") && (
            <details className={s.photoFilters}>
              <summary>Wildlife photo filters</summary>
              <fieldset className={s.wildlifeFilters}>
                <legend>PLAN A WILDLIFE PHOTO</legend>
                <label>
                  Species
                  <select
                    value={speciesFilter}
                    onChange={(e) => setSpeciesFilter(e.target.value)}
                  >
                    <option value="">All species in this area</option>
                    {Object.entries(species)
                      .filter(([id]) =>
                        areaPlaces.some((p) => p.speciesId === id),
                      )
                      .sort((a, b) => a[1].title.localeCompare(b[1].title))
                      .map(([id, a]) => (
                        <option key={id} value={id}>
                          {a.title} · {a.rarity}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  Active time
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                  >
                    <option value="">Any time</option>
                    <option>Daytime</option>
                    <option>Night</option>
                  </select>
                </label>
                <label>
                  Weather
                  <select
                    value={weatherFilter}
                    onChange={(e) => setWeatherFilter(e.target.value)}
                  >
                    <option value="">Any weather</option>
                    <option>Dry</option>
                    <option>Wet</option>
                  </select>
                </label>
                <p>
                  Filters describe spawn conditions. Animals can move away from
                  the pin.
                </p>
              </fieldset>
            </details>
          )}
          <div className={s.progress}>
            <strong>
              {completed} / {areaStops.length} stops found
            </strong>
            <label>
              <input
                type="checkbox"
                checked={hideFound}
                onChange={(event) => setHideFound(event.target.checked)}
              />
              Hide places I’ve found
            </label>
            <p>
              Saved in this browser, separate from your game save. Meteorites
              and animal spawn points do not count as stops.
            </p>
            {confirmReset ? (
              <div className={s.resetConfirm}>
                <span>Clear discoveries in {area.title}?</span>
                <button
                  onClick={() => {
                    save(
                      new Set(
                        [...found].filter(
                          (id) =>
                            !areaStops.some((place) => place.progressId === id),
                        ),
                      ),
                    );
                    setConfirmReset(false);
                  }}
                >
                  Clear this area
                </button>
                <button onClick={() => setConfirmReset(false)}>Cancel</button>
              </div>
            ) : (
              <button
                className={s.reset}
                onClick={() => setConfirmReset(true)}
                disabled={completed === 0}
              >
                Reset this area
              </button>
            )}
          </div>
          <div className={s.photoProgress}>
            <strong>
              {photos} / {Object.keys(species).length} species photographed
            </strong>
            <p>One photo record per species, shared across all five areas.</p>
            {confirmPhotos ? (
              <div className={s.resetConfirm}>
                <span>Clear all species photos?</span>
                <button
                  onClick={() => {
                    save(
                      new Set(
                        [...found].filter((id) => !id.startsWith("species-")),
                      ),
                    );
                    setConfirmPhotos(false);
                  }}
                >
                  Clear photos
                </button>
                <button onClick={() => setConfirmPhotos(false)}>Cancel</button>
              </div>
            ) : (
              <button
                className={s.reset}
                disabled={!photos}
                onClick={() => setConfirmPhotos(true)}
              >
                Reset species photos
              </button>
            )}
          </div>
          <details className={s.notebook}>
            <summary>
              My map notes <b>{areaNotes.length}</b>
            </summary>
            <p>Private to this browser. Notes do not change game progress.</p>
            <button
              className={s.reset}
              onClick={() => {
                setTool("note");
                setSelectedId(null);
              }}
            >
              Add a note on the map
            </button>
            {areaNotes.map((note) => (
              <div className={s.noteRow} key={note.id}>
                <button
                  onClick={() => {
                    setNoteDraft(note);
                    setNoteLabel(note.label);
                    setSelectedId(null);
                    setView(
                      constrainView({ x: note.x, y: note.y, zoom: 3 }, size),
                    );
                  }}
                >
                  {note.label}
                </button>
                <button
                  aria-label={`Delete note: ${note.label}`}
                  onClick={() =>
                    saveNotes(notes.filter((n) => n.id !== note.id))
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </details>
          <div className={s.results}>
            <p aria-live="polite">{visible.length} matching stops</p>
            <ul>
              {visible.map((place) => (
                <li key={place.id}>
                  <button
                    aria-pressed={selected?.id === place.id}
                    onClick={() => focus(place)}
                  >
                    <span
                      className={s.symbol}
                      data-category={place.category}
                      aria-hidden="true"
                    >
                      {isFound(place)
                        ? "✓"
                        : categories.find(
                            (category) => category.key === place.category,
                          )?.icon}
                    </span>
                    <span>
                      {place.title}
                      <small>
                        {place.reward
                          ? `Unlock: ${place.reward}`
                          : place.category}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {visible.length === 0 && (
              <div className={s.empty}>
                No stops match these filters.
                <button
                  onClick={() => {
                    setQuery("");
                    setEnabled(categories.map((category) => category.key));
                    setHideFound(false);
                    setSpeciesFilter("");
                    setTimeFilter("");
                    setWeatherFilter("");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </aside>
        <div className={s.mapColumn} ref={mapColumn}>
          <div className={s.mapTop}>
            <div>
              <span>
                {area.region === "canada"
                  ? "THE VALHALLAS / CANADA"
                  : "ALGERIA"}
              </span>
              <h3>{area.title}</h3>
            </div>
            <button
              className={s.expand}
              onClick={() => {
                if (document.fullscreenElement)
                  void document
                    .exitFullscreen()
                    .catch(() =>
                      setNotice("Your browser could not exit full screen."),
                    );
                else if (mapColumn.current?.requestFullscreen)
                  void mapColumn.current
                    .requestFullscreen()
                    .catch(() =>
                      setNotice("Full screen is unavailable in this browser."),
                    );
                else setNotice("Full screen is unavailable in this browser.");
              }}
            >
              ⤢ {fullscreen ? "Exit full screen" : "Full screen"}
            </button>
          </div>
          <div className={s.mapOptions}>
            <div className={s.layerSwitch} role="group" aria-label="Base map">
              <button
                aria-pressed={basemap === "satellite"}
                onClick={() => setBasemap("satellite")}
              >
                Satellite
              </button>
              <button
                aria-pressed={basemap === "topographic"}
                onClick={() => setBasemap("topographic")}
              >
                Topographic
              </button>
            </div>
            <details className={s.hazardMenu}>
              <summary>
                Terrain layers {hazards.length ? `(${hazards.length})` : "+"}
              </summary>
              <fieldset>
                <legend>GROUND CONDITIONS</legend>
                {area.hazards.map((h) => (
                  <label key={h.key}>
                    <input
                      type="checkbox"
                      checked={hazards.includes(h.key)}
                      onChange={() =>
                        setHazards((current) =>
                          current.includes(h.key)
                            ? current.filter((key) => key !== h.key)
                            : [...current, h.key],
                        )
                      }
                    />
                    {h.label}
                  </label>
                ))}
                <label>
                  Overlay opacity{" "}
                  <input
                    aria-label="Hazard overlay opacity"
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                  />
                </label>
                <button onClick={() => setHazards([])}>
                  Clear terrain layers
                </button>
                <p>
                  Highlighted areas describe terrain, not live weather or a
                  guaranteed safe route.
                </p>
              </fieldset>
            </details>
            <button className={s.mapAction} onClick={() => void share()}>
              Share map
            </button>
            <label>
              <input
                type="checkbox"
                checked={showTrails}
                onChange={(e) => setShowTrails(e.target.checked)}
              />{" "}
              Show challenge checkpoints
            </label>
            <div
              className={s.drawingTools}
              role="group"
              aria-label="Map planning tools"
            >
              <button
                aria-pressed={tool === "measure"}
                onClick={() => {
                  setTool(tool === "measure" ? "pan" : "measure");
                  setSelectedId(null);
                  setNoteDraft(null);
                }}
              >
                Measure
              </button>
              <button
                aria-pressed={tool === "note"}
                onClick={() => {
                  setTool(tool === "note" ? "pan" : "note");
                  setSelectedId(null);
                }}
              >
                Add note
              </button>
            </div>
          </div>
          {shareLink && (
            <div className={s.shareField}>
              <label htmlFor="map-share-link">Map link</label>
              <input
                id="map-share-link"
                value={shareLink}
                readOnly
                onFocus={(e) => e.target.select()}
              />
              <button
                aria-label="Close map link"
                onClick={() => setShareLink("")}
              >
                ×
              </button>
            </div>
          )}
          <div
            ref={stage}
            className={s.stage}
            tabIndex={0}
            role="region"
            aria-label={`${area.title} interactive map`}
            aria-describedby="map-help"
            data-tool={tool}
            onClick={(event) => {
              if (
                tool === "pan" ||
                dragged.current ||
                (event.target as HTMLElement).closest("button")
              )
                return;
              const rect = event.currentTarget.getBoundingClientRect();
              const point = {
                x:
                  bounded.x +
                  (event.clientX - rect.left - size.width / 2) / side,
                y:
                  bounded.y +
                  (event.clientY - rect.top - size.height / 2) / side,
              };
              planPoint(point);
            }}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={stopPointer}
            onPointerCancel={stopPointer}
            onLostPointerCapture={stopPointer}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "Enter" && tool !== "pan") {
                event.preventDefault();
                planPoint({ x: bounded.x, y: bounded.y });
                return;
              }
              if (
                [
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                  "+",
                  "=",
                  "-",
                  "Home",
                ].includes(event.key)
              )
                event.preventDefault();
              if (event.key === "+" || event.key === "=") zoom(1.35);
              else if (event.key === "-") zoom(1 / 1.35);
              else if (event.key === "Home") setView(initialView);
              else if (event.key.startsWith("Arrow"))
                setView((current) =>
                  constrainView(
                    {
                      ...bounded,
                      x:
                        bounded.x +
                        (event.key === "ArrowRight"
                          ? 60
                          : event.key === "ArrowLeft"
                            ? -60
                            : 0) /
                          mapSide(size, current.zoom),
                      y:
                        bounded.y +
                        (event.key === "ArrowDown"
                          ? 60
                          : event.key === "ArrowUp"
                            ? -60
                            : 0) /
                          mapSide(size, current.zoom),
                    },
                    size,
                  ),
                );
            }}
          >
            <div
              className={s.world}
              style={{
                width: side,
                height: side,
                left: size.width / 2 - bounded.x * side,
                top: size.height / 2 - bounded.y * side,
              }}
            >
              <Image
                key={`${area.slug}-${basemap}`}
                src={basemap === "satellite" ? area.satellite : area.image}
                alt={`${area.title} ${basemap === "satellite" ? "satellite terrain view" : "in-game topographic map"}`}
                fill
                sizes="4096px"
                unoptimized
                draggable={false}
              />
              {area.hazards
                .filter((h) => hazards.includes(h.key))
                .map((h) => (
                  <Image
                    className={s.hazardLayer}
                    key={h.key}
                    src={h.image}
                    alt={`${area.title}: ${h.label} overlay`}
                    fill
                    sizes="2048px"
                    unoptimized
                    draggable={false}
                    style={{ opacity: opacity / 100 }}
                  />
                ))}
              <svg
                className={s.routes}
                viewBox="0 0 1000 1000"
                aria-hidden="true"
              >
                {visibleTrails.map((trail, index) => (
                  <g
                    key={trail.placeId}
                    data-active={selected?.id === trail.placeId}
                    style={
                      {
                        "--trail-color": [
                          "#e5bb43",
                          "#ed83bd",
                          "#65b9d5",
                          "#82cc8c",
                          "#de8b4b",
                        ][index % 5],
                      } as React.CSSProperties
                    }
                  >
                    <polyline
                      points={trail.points
                        .map((p) => `${p.x * 1000},${p.y * 1000}`)
                        .join(" ")}
                    />
                    {trail.points.map((p, i) => (
                      <g key={i}>
                        <circle
                          cx={p.x * 1000}
                          cy={p.y * 1000}
                          r={
                            (selected?.id === trail.placeId ? 5_000 : 3_000) /
                            side
                          }
                        />
                        {selected?.id === trail.placeId && (
                          <text
                            x={p.x * 1000}
                            y={p.y * 1000 - 22_000 / side}
                            fontSize={12_000 / side}
                          >
                            {i === 0
                              ? "START"
                              : i === trail.points.length - 1
                                ? "FINISH"
                                : i + 1}
                          </text>
                        )}
                      </g>
                    ))}
                  </g>
                ))}
              </svg>
              <svg
                className={s.measurement}
                viewBox="0 0 1000 1000"
                aria-hidden="true"
              >
                <polyline
                  points={measurePoints
                    .map((p) => `${p.x * 1000},${p.y * 1000}`)
                    .join(" ")}
                />
                {measurePoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x * 1000}
                    cy={p.y * 1000}
                    r={4_000 / side}
                  />
                ))}
              </svg>
              {areaNotes.map((note) => (
                <button
                  key={note.id}
                  className={s.notePin}
                  style={{ left: `${note.x * 100}%`, top: `${note.y * 100}%` }}
                  aria-label={`Your note: ${note.label}`}
                  onClick={() => {
                    setNoteDraft(note);
                    setNoteLabel(note.label);
                    setSelectedId(null);
                  }}
                >
                  ✎
                </button>
              ))}
              {clusters.map(({ points, x, y }) => {
                const place = points[0];
                const clustered = points.length > 1;
                return (
                  <button
                    key={place.id}
                    className={s.pin}
                    data-category={place.category}
                    data-found={!clustered && isFound(place)}
                    data-selected={!clustered && selected?.id === place.id}
                    data-cluster={clustered}
                    style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                    tabIndex={
                      size.width / 2 + (x - bounded.x) * side >= 16 &&
                      size.width / 2 + (x - bounded.x) * side <=
                        size.width - 16 &&
                      size.height / 2 + (y - bounded.y) * side >= 16 &&
                      size.height / 2 + (y - bounded.y) * side <=
                        size.height - 16
                        ? 0
                        : -1
                    }
                    aria-label={
                      clustered
                        ? `Zoom to ${points.length} nearby ${place.category.toLowerCase()} positions`
                        : `${place.title}, ${place.category}${isFound(place) ? ", found" : ""}`
                    }
                    aria-pressed={!clustered && selected?.id === place.id}
                    onClick={() =>
                      clustered
                        ? setView(
                            constrainView(
                              { x, y, zoom: Math.min(6, view.zoom * 1.8) },
                              size,
                            ),
                          )
                        : (() => {
                            setTool("pan");
                            setNoteDraft(null);
                            setSelectedId(place.id);
                          })()
                    }
                    title={
                      clustered
                        ? `${points.length} nearby positions — zoom in`
                        : place.title
                    }
                  >
                    {clustered ? (
                      <>
                        <span>
                          {place.speciesId ? (
                            <Image
                              src={species[place.speciesId].image}
                              alt=""
                              width={22}
                              height={22}
                              unoptimized
                            />
                          ) : (
                            "✦"
                          )}
                        </span>
                        <b>{points.length}</b>
                      </>
                    ) : isFound(place) ? (
                      "✓"
                    ) : place.speciesId ? (
                      <Image
                        src={species[place.speciesId].image}
                        alt=""
                        width={24}
                        height={24}
                        unoptimized
                      />
                    ) : (
                      categories.find((c) => c.key === place.category)?.icon
                    )}
                  </button>
                );
              })}
            </div>
            <div className={s.compass} aria-hidden="true">
              N<br />↑
            </div>
            <div className={s.controls}>
              <button
                aria-label="Zoom in"
                disabled={view.zoom >= 6}
                onClick={() => zoom(1.35)}
              >
                +
              </button>
              <button
                aria-label="Zoom out"
                disabled={view.zoom <= 1}
                onClick={() => zoom(1 / 1.35)}
              >
                −
              </button>
              <button aria-label="Fit map" onClick={() => setView(initialView)}>
                ⤢
              </button>
            </div>
            <span className={s.zoomLabel}>{Math.round(view.zoom * 100)}%</span>
          </div>
          {tool !== "pan" && (
            <div className={s.toolStatus} role="status">
              <span>
                {tool === "measure"
                  ? "Tap the map or press Enter to measure"
                  : "Tap the map or press Enter to place a note"}
              </span>
              {tool === "measure" && (
                <>
                  <output>{Math.round(measurement(measurePoints))} m</output>
                  <small>Straight-line distance, not a driving route</small>
                  <button onClick={() => setMeasurePoints([])}>
                    Clear measurement
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setTool("pan");
                  setNoteDraft(null);
                }}
              >
                Done
              </button>
            </div>
          )}
          {noteDraft && (
            <form
              className={s.noteEditor}
              onSubmit={(e) => {
                e.preventDefault();
                if (noteLabel.trim())
                  saveNotes([
                    ...notes.filter((n) => n.id !== noteDraft.id),
                    { ...noteDraft, label: noteLabel.trim() },
                  ]);
              }}
            >
              <label htmlFor="map-note">Your map note</label>
              <input
                id="map-note"
                ref={noteInput}
                value={noteLabel}
                maxLength={140}
                required
                onChange={(e) => setNoteLabel(e.target.value)}
                placeholder="A crossing to try next time…"
              />
              <button
                type="submit"
                disabled={
                  !noteLabel.trim() ||
                  (notes.length >= 250 &&
                    !notes.some((n) => n.id === noteDraft.id))
                }
              >
                Save note
              </button>
              <button type="button" onClick={() => setNoteDraft(null)}>
                Cancel
              </button>
            </form>
          )}
          <div className={s.detail} data-open={!!selected} aria-live="polite">
            {selected ? (
              <>
                <div>
                  <button
                    className={s.closeDetail}
                    aria-label="Close location details"
                    onClick={() => {
                      setSelectedId(null);
                      stage.current?.focus({ preventScroll: true });
                    }}
                  >
                    ×
                  </button>
                  <span className={s.eyebrow}>
                    {selected.category} / {area.title}
                  </span>
                  <h3>{selected.title}</h3>
                  <p>
                    {
                      categories.find(
                        (category) => category.key === selected.category,
                      )?.note
                    }
                  </p>
                  {animal && (
                    <div className={s.animalCard}>
                      <Image
                        src={animal.image}
                        alt={`${animal.title} game model`}
                        width={110}
                        height={90}
                        unoptimized
                      />
                      <div>
                        <strong>
                          {animal.rarity} · {animal.habitat}
                        </strong>
                        <p>
                          Active: {animal.time}
                          <br />
                          Weather: {animal.weather}
                        </p>
                        <p>{animal.description}</p>
                        <a href={`/wiki/wildlife#${selected.speciesId}`}>
                          Wildlife checklist →
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedTrail && (
                    <p>
                      <strong>
                        {selectedTrail.points.length} ordered checkpoints.
                      </strong>{" "}
                      Start and finish are labelled on the map. Terrain between
                      checkpoints still needs a route you can drive.
                    </p>
                  )}
                  {selected.rewards?.length || animal?.rewards.length ? (
                    <p>
                      <strong>
                        {animal ? "First photo: " : "First completion: "}
                      </strong>
                      {rewardText(selected.rewards || animal?.rewards || [])}
                    </p>
                  ) : null}
                  {!!selected.repeatRewards?.length && (
                    <p>
                      <strong>Repeat completion: </strong>
                      {rewardText(selected.repeatRewards)}. Configured payouts;
                      your game build may differ.
                    </p>
                  )}
                  {selected.reward && (
                    <p>
                      <strong>Vehicle reward: </strong>
                      <a href="/vehicles">{selected.reward} →</a>
                    </p>
                  )}
                  <span className={s.elevation}>
                    ELEVATION {Math.round(selected.elevation || 0)} m
                  </span>
                </div>
                {selected.progressId && (
                  <button
                    className={s.foundButton}
                    aria-pressed={isFound(selected)}
                    onClick={() => toggleFound(selected.progressId!)}
                  >
                    {isFound(selected)
                      ? "✓ Found — undo"
                      : animal
                        ? "Mark species photographed"
                        : "Mark as found"}
                  </button>
                )}
              </>
            ) : (
              <div>
                <span className={s.eyebrow}>YOUR NEXT DETOUR</span>
                <h3>Choose a pin or a stop from the list</h3>
                <p>
                  Open a location to check rewards and discovery status. Enable
                  wildlife or meteorite spawns when you need them; nearby spawn
                  positions group together until you zoom in.
                </p>
              </div>
            )}
          </div>
          <p id="map-help" className={s.help}>
            Drag to move · Scroll or pinch to zoom · Keyboard: arrow keys, + / −
            and Home. Positions are navigation aids, not turn-by-turn routes.
          </p>
          {(notice || raw === "unavailable" || noteRaw === "unavailable") && (
            <p className={s.warning} role="status">
              {notice ||
                "Local storage is unavailable. Your browser cannot keep discoveries between visits."}
            </p>
          )}
          <noscript>
            <p>
              The interactive map needs JavaScript. The area maps and named
              location lists below remain available.
            </p>
          </noscript>
        </div>
      </div>
      <p className={s.coverage}>
        {places.filter((p) => p.category === "Crate").length} crates ·{" "}
        {places.filter((p) => p.category === "Recovery").length} recovery jobs ·{" "}
        {trails.length} challenge sequences ·{" "}
        {places.filter((p) => p.category === "Wildlife").length} possible
        wildlife spawns ·{" "}
        {places.filter((p) => p.category === "Meteorite").length} possible
        meteorite spawns. Wildlife records are shared by species, not by spawn
        position. Meteorites use the post-patch build 25992246 import, checked
        October 19, 2026. Neither spawn layer guarantees an encounter. Game map
        artwork © Funselektor and Strelka Games.
      </p>
    </section>
  );
}

function rewardText(rewards: AtlasReward[]) {
  return rewards
    .map((r) =>
      r.name === "Pebbles"
        ? `${r.count} Pebbles`
        : `${r.name}${r.count > 1 ? ` ×${r.count}` : ""}`,
    )
    .join(" · ");
}
