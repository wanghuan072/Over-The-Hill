"use client";
import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import type { SearchItem } from "@/types/content";
import type { Vehicle } from "@/types/tools";
import { filterContent } from "@/lib/search/search-content";
import s from "@/style/page/vehicles/catalog.module.css";

const flags: Record<string, string> = {
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
  Japan: "🇯🇵",
  Germany: "🇩🇪",
  Sweden: "🇸🇪",
  Russia: "🇷🇺",
};
const paints: Record<string, string> = {
  Black: "#343635",
  Blue: "#4c789a",
  Brown: "#89684c",
  Cream: "#e2cf9b",
  Cyan: "#6fa9bb",
  "Dark Blue": "#324d65",
  "Dark Green": "#374b38",
  Green: "#628563",
  Grey: "#969791",
  Orange: "#d98636",
  Red: "#b84435",
  White: "#f3f0e3",
  Yellow: "#dfba45",
};
function paint(colour: string) {
  const parts = colour.split("/").map((part) => paints[part] || "#c6c8bc");
  return parts.length === 1
    ? parts[0]
    : `linear-gradient(135deg, ${parts[0]} 50%, ${parts[1]} 50%)`;
}

type VehicleListItem = SearchItem &
  Pick<
    Vehicle,
    "referenceImage" | "referenceImageAlt" | "engineStages" | "detailFacts"
  > & { notes?: string[] };
export default function VehicleCatalog({
  items,
}: {
  items: VehicleListItem[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [anchor, setAnchor] = useState<{ id: string } | null>(null);
  useEffect(() => {
    function revealVehicle() {
      const match = items.find(
        (item) =>
          new URL(item.href, window.location.origin).hash ===
            window.location.hash && window.location.hash,
      );
      if (!match) return;
      setQuery("");
      setCategory("All");
      setAnchor({ id: match.href.split("#")[1] });
    }
    revealVehicle();
    window.addEventListener("hashchange", revealVehicle);
    return () => window.removeEventListener("hashchange", revealVehicle);
  }, [items]);
  useEffect(() => {
    if (!anchor) return;
    // Wait until the full list is committed before locating a filtered-out row.
    document
      .getElementById(anchor.id)
      ?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [anchor]);
  const classes = ["All", ...new Set(items.map((item) => item.category))];
  const results = filterContent(items, query, category);
  function clearFilters() {
    setQuery("");
    setCategory("All");
  }
  return (
    <section className={s.catalog} id="garage" aria-labelledby="garage-heading">
      <header className={s.directoryHeading}>
        <div>
          <span className={s.kicker}>VEHICLE LIST</span>
          <h2 id="garage-heading">Explore the garage</h2>
        </div>
        <p>Filter by garage class, or search by name, country or body style.</p>
      </header>
      <div className={s.controls}>
        <div className={s.toolbar}>
          <label htmlFor="garage-search">Find your next ride</label>
          <div className={s.searchField}>
            <span aria-hidden="true">⌕</span>
            <input
              id="garage-search"
              type="search"
              placeholder="Search name, country or body style…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <button type="button" className={s.clear} onClick={clearFilters}>
            Clear filters <span aria-hidden="true">↺</span>
          </button>
        </div>
        <div className={s.filters} role="group" aria-label="Vehicle classes">
          {classes.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
            >
              {value === "All" ? "All vehicles" : value}
              <span>
                {value === "All"
                  ? items.length
                  : items.filter((item) => item.category === value).length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className={s.listHeading}>
        <p className={s.count} aria-live="polite">
          {results.length} of {items.length} vehicles{" "}
          <span> / {category === "All" ? "All classes" : category}</span>
        </p>
        <span className={s.listLabel}>THE OVERLAND COLLECTION</span>
      </div>
      <div className={s.rows}>
        {results.map((item) => {
          const country = item.attributes?.find(
            (field) => field.label === "Country",
          )?.value;
          const unlock = item.attributes?.find(
            (field) => field.label === "Unlock",
          )?.value;
          const colours =
            item.detailFacts
              ?.find((field) => field.label === "Factory colours")
              ?.value.split(",")
              .map((colour) => colour.trim()) || [];
          const liveries = item.detailFacts?.find(
            (field) => field.label === "Distance liveries",
          )?.value;
          return (
            <article
              key={item.href}
              id={item.href.split("#")[1]}
              className={s.row}
              data-class={item.category}
            >
              <figure className={s.photo}>
                <div className={s.number}>
                  <span>
                    GARAGE / {String(items.indexOf(item) + 1).padStart(2, "0")}
                  </span>
                  <small>STOCK GAME MODEL</small>
                </div>
                {item.referenceImage ? (
                  <Image
                    src={item.referenceImage}
                    alt={
                      item.referenceImageAlt || `${item.title} stock game model`
                    }
                    fill
                    sizes="(max-width:768px) 90vw, (max-width:1024px) 34vw, 500px"
                    unoptimized
                  />
                ) : (
                  <span className={s.pending}>
                    Stock model image unavailable
                  </span>
                )}
                <figcaption>Original garage configuration</figcaption>
              </figure>
              <div className={s.info}>
                <header className={s.identity}>
                  <span className={s.className}>
                    <span aria-hidden="true">◭</span> {item.category}
                  </span>
                  {country ? (
                    <span className={s.country}>
                      {flags[country] ? (
                        <span aria-hidden="true">{flags[country]}</span>
                      ) : null}
                      {country}
                    </span>
                  ) : null}
                </header>
                <h3>{item.title}</h3>
                <p className={s.description}>{item.description}</p>
                <dl className={s.attributes}>
                  {item.attributes
                    ?.filter((field) =>
                      [
                        "Stock mass",
                        "Steering angle",
                        "Suspension travel",
                        "Wheel radius",
                      ].includes(field.label),
                    )
                    .map((field) => (
                      <div key={field.label}>
                        <dt>
                          {field.label === "Steering angle"
                            ? "Steering"
                            : field.label === "Suspension travel"
                              ? "Suspension"
                              : field.label}
                        </dt>
                        <dd>{field.value}</dd>
                      </div>
                    ))}
                </dl>
                <div className={s.detailsGrid}>
                  {item.engineStages?.length ? (
                    <div className={s.enginePanel}>
                      <table>
                        <caption>Engine upgrades</caption>
                        <thead>
                          <tr>
                            <th scope="col">Tier</th>
                            <th scope="col">Torque</th>
                            <th scope="col">Speed cap</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.engineStages.map((engine) => (
                            <tr key={engine.stage}>
                              <th scope="row">{engine.stage}</th>
                              <td>{engine.torque} N·m</td>
                              <td>{engine.speedCap} km/h</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                  <div className={s.paintPanel}>
                    {colours.length ? (
                      <section aria-label={`${item.title} factory colours`}>
                        <h4>Factory colours</h4>
                        <div className={s.swatches} aria-hidden="true">
                          {colours.map((colour) => (
                            <span
                              key={colour}
                              style={
                                { "--paint": paint(colour) } as CSSProperties
                              }
                            />
                          ))}
                        </div>
                        <p>{colours.join(", ")}</p>
                      </section>
                    ) : null}
                    {liveries ? (
                      <section>
                        <h4>Distance liveries</h4>
                        <p className={s.liveries}>{liveries}</p>
                      </section>
                    ) : null}
                  </div>
                </div>
                {unlock ? (
                  <div
                    className={s.unlock}
                    data-starter={unlock === "Starting vehicle"}
                  >
                    <span aria-hidden="true">⌖</span>
                    <p>
                      <small>Unlock</small>
                      <span>{unlock}</span>
                    </p>
                  </div>
                ) : null}
                {item.notes?.length ? (
                  <div className={s.notes}>
                    {item.notes.map((note) => (
                      <p key={note}>{note}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
      {results.length === 0 ? (
        <div className={s.empty}>
          <span aria-hidden="true">⌕</span>
          <h3>No vehicles on this trail</h3>
          <p>Try another name, country or class.</p>
          <button type="button" onClick={clearFilters}>
            Show all vehicles →
          </button>
        </div>
      ) : null}
      <p className={s.scope}>
        Three vehicles start unlocked; the other 18 come from challenge trails.
        Images show the default game models. Vehicles in the same class share
        engine settings. Speed caps describe those settings, not guaranteed
        speeds on rough terrain. Livery milestones track distance driven in that
        vehicle. Demo unlock conditions are labelled separately from release
        rewards.
      </p>
    </section>
  );
}
