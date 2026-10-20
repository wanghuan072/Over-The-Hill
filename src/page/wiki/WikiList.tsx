"use client";
import { useState } from "react";
import Image from "next/image";
import s from "@/style/page/wiki/wiki.module.css";
type WikiItem = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  imageLabel?: string;
  imageKind?: string;
  facts: { label: string; value: string }[];
  notes: string[];
  group?: string;
  hidden?: boolean;
};
export default function WikiList({
  name,
  items,
  note,
}: {
  name: string;
  items: WikiItem[];
  note?: string;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");
  const [showHidden, setShowHidden] = useState(false);
  const groups = [
    ...new Set(items.flatMap((item) => (item.group ? [item.group] : []))),
  ];
  const hiddenCount = items.filter((item) => item.hidden).length;
  function clear() {
    setQuery("");
    setGroup("All");
  }
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = items.filter(
    (item) =>
      (group === "All" || item.group === group) &&
      terms.every((term) =>
        `${item.title} ${item.description} ${item.notes.join(" ")} ${item.facts.flatMap((fact) => [fact.label, fact.value]).join(" ")}`
          .toLowerCase()
          .includes(term),
      ),
  );
  return (
    <div className={s.collection}>
      {note && <p className={s.resultCount}>{note}</p>}
      <div className={s.toolbar}>
        <label htmlFor="wiki-query">
          Search {name.toLowerCase()}
          <input
            id="wiki-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Find something in ${name.toLowerCase()}…`}
          />
        </label>
        {groups.length > 0 && (
          <label htmlFor="wiki-group">
            Filter by type
            <select
              id="wiki-group"
              value={group}
              onChange={(event) => setGroup(event.target.value)}
            >
              <option value="All">All types</option>
              {groups.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="button" onClick={clear}>
          Clear search
        </button>
      </div>
      {hiddenCount > 0 && (
        <p className={s.resultCount}>
          <label>
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(event) => setShowHidden(event.target.checked)}
            />{" "}
            Reveal {hiddenCount} hidden requirements (spoilers)
          </label>
        </p>
      )}
      <p className={s.resultCount} aria-live="polite">
        Showing {results.length} of {items.length} entries
      </p>
      <div className={s.entries}>
        {results.map((item) => (
          <article className={s.entry} id={item.slug} key={item.slug}>
            <figure className={s.entryMedia} data-kind={item.imageKind}>
              {item.hidden && !showHidden ? (
                <span aria-hidden="true">?</span>
              ) : (
                <Image
                  src={
                    item.imageKind
                      ? item.image!
                      : `/images/wiki/illustrations/${item.slug}.svg`
                  }
                  alt={
                    item.imageKind
                      ? item.imageAlt || item.title
                      : `${item.title.replace(/^Over the Hill /, "")} field-guide illustration`
                  }
                  fill
                  sizes="(max-width:768px) 96px, 240px"
                  unoptimized
                />
              )}
              <figcaption>
                {item.hidden && !showHidden
                  ? "Hidden achievement"
                  : item.imageKind
                    ? item.imageLabel
                    : "Field illustration"}
              </figcaption>
            </figure>
            <div className={s.entryCopy}>
              <div className={s.entryTop}>
                <span>
                  {name} / {String(items.indexOf(item) + 1).padStart(2, "0")}
                </span>
                <span aria-hidden="true">✧</span>
              </div>
              <h2>
                {item.hidden && !showHidden
                  ? "Hidden achievement"
                  : item.title.replace(/^Over the Hill /, "")}
              </h2>
              <p>
                {item.hidden && !showHidden
                  ? "Open the requirement below when you are ready for the spoiler."
                  : item.description}
              </p>
            </div>
            <div className={s.entryDetails}>
              {item.hidden && !showHidden && (
                <details>
                  <summary>
                    Reveal hidden achievement <span aria-hidden="true">+</span>
                  </summary>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </details>
              )}
              {item.facts.length > 0 && (
                <dl>
                  {item.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {item.notes.length > 0 && (
                <details>
                  <summary>
                    Field notes <span aria-hidden="true">+</span>
                  </summary>
                  <div>
                    {item.notes.map((note) => (
                      <p key={note}>{note}</p>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </article>
        ))}
        {results.length === 0 && (
          <div className={s.empty}>
            <h2>No matching entries</h2>
            <p>
              Try a different word or clear your search to see this chapter
              again.
            </p>
            <button type="button" onClick={clear}>
              Show all {name.toLowerCase()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
