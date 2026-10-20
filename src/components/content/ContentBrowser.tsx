"use client";
import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import type { SearchItem } from "@/types/content";
import { filterContent } from "@/lib/search/search-content";
import s from "@/style/content/browser.module.css";
export default function ContentBrowser({
  items,
  searchPage = false,
  dataOnly = false,
  details,
}: {
  items: SearchItem[];
  searchPage?: boolean;
  dataOnly?: boolean;
  details?: Record<string, ReactNode>;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  useEffect(() => {
    if (searchPage) {
      const q = new URLSearchParams(window.location.search).get("q") || "";
      const timer = window.setTimeout(() => setQuery(q), 0);
      return () => clearTimeout(timer);
    }
  }, [searchPage]);
  const cats = ["All", ...new Set(items.map((i) => i.category))];
  const results = filterContent(items, query, category);
  return (
    <div>
      <div className={s.controls}>
        <label>
          Search {searchPage ? "the wiki" : "this collection"}
          <input
            type="search"
            value={query}
            placeholder="What are you looking for?"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {cats.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            setQuery("");
            setCategory("All");
          }}
        >
          Clear filters
        </button>
      </div>
      {details && cats.length > 2 ? (
        <div className={s.filters} role="group" aria-label="Filter collection">
          {cats.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
            >
              {cat === "All" ? "All entries" : cat}
              <span>
                {cat === "All"
                  ? items.length
                  : items.filter((item) => item.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      <p className={s.count} aria-live="polite">
        {results.length} {results.length === 1 ? "result" : "results"}
      </p>
      <div className={details ? s.list : s.grid}>
        {results.map((i) => (
          <article
            className={s.card}
            key={i.href}
            id={details ? i.href.split("#")[1] : undefined}
          >
            {details ? (
              <>
                {!dataOnly && i.image && (
                  <div
                    data-kind={i.imageKind}
                    className={`${s.image} ${i.imageKind === "garage-icon" || i.imageKind === "game-icon" ? s.garageIcon : ""}`}
                  >
                    <Image
                      src={i.image}
                      alt={i.imageAlt}
                      fill
                      sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                    />
                    {i.imageLabel ? <span>{i.imageLabel}</span> : null}
                  </div>
                )}
                <div className={s.copy}>
                  <span className={s.tag}>{i.category}</span>
                  {!i.image ? (
                    <span className={s.photoPending}>Photo not available</span>
                  ) : null}
                  <h2>{i.title}</h2>
                  <p>{i.description}</p>
                  {i.attributes?.length ? (
                    <dl className={s.attributes}>
                      {i.attributes.map((attribute) => (
                        <div key={attribute.label}>
                          <dt>{attribute.label}</dt>
                          <dd>{attribute.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {details[i.href]}
                </div>
              </>
            ) : (
              <a href={i.href}>
                {!dataOnly && i.image && (
                  <div
                    data-kind={i.imageKind}
                    className={`${s.image} ${i.imageKind === "garage-icon" || i.imageKind === "game-icon" ? s.garageIcon : ""}`}
                  >
                    <Image
                      src={i.image}
                      alt={i.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {i.imageLabel ? <span>{i.imageLabel}</span> : null}
                  </div>
                )}
                <div className={s.copy}>
                  <span className={s.tag}>{i.category}</span>
                  <h3>{i.title}</h3>
                  <p>{i.description}</p>
                  {dataOnly && i.attributes?.length ? (
                    <dl className={s.attributes}>
                      {i.attributes.map((attribute) => (
                        <div key={attribute.label}>
                          <dt>{attribute.label}</dt>
                          <dd>{attribute.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {dataOnly && i.scope ? (
                    <p className={s.scope}>{i.scope}</p>
                  ) : null}
                  <strong>
                    {i.href.includes("#") ? "View in list" : "Read more"}{" "}
                    <span aria-hidden="true">→</span>
                  </strong>
                </div>
              </a>
            )}
          </article>
        ))}
      </div>
      {results.length === 0 && (
        <div className={s.empty}>
          <h3>No matching entries</h3>
          <p>
            Try a vehicle name, an equipment item or another category, or clear
            the filters to start again.
          </p>
        </div>
      )}
    </div>
  );
}
