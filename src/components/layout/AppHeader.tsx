"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { navigation } from "@/config/navigation";
import s from "@/style/layout/header.module.css";

const navIcons: Record<string, string> = {
  "/": "M3 10 12 3l9 7M5 9v11h5v-6h4v6h5V9",
  "/guides": "M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3V4Zm9 2v15",
  "/wiki": "M5 3h14v18H5V3Zm4 5h6M9 12h6M9 16h4",
  "/vehicles":
    "m4 8 2-4h12l2 4M3 8h18v10H3V8Zm1 10v3h3v-3m10 0v3h3v-3M6 12h2m8 0h2M9 8V4m6 4V4",
  "/maps": "m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16",
  "/update": "M5 4h14v17H5V4Zm4 4h6m-6 4h6m-6 4h4M3 7H2v14h3",
};
function subscribeToLocation(listener: () => void) {
  window.addEventListener("popstate", listener);
  return () => window.removeEventListener("popstate", listener);
}
const getPath = () => window.location.pathname;
const getServerPath = () => "";

export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useSyncExternalStore(
    subscribeToLocation,
    getPath,
    getServerPath,
  );
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [open]);
  function current(href: string) {
    return pathname === href
      ? ("page" as const)
      : href !== "/" && pathname.startsWith(`${href}/`)
        ? true
        : undefined;
  }
  return (
    <header ref={header} className={s.header}>
      <a className={s.skip} href="#main-content">
        Skip to content
      </a>
      <div className={`container ${s.masthead}`}>
        <a className={s.brand} href="/" aria-label="Over the Hill Wiki home">
          <span className={s.badge}>
            <Image src="/images/logo.svg" alt="" width={46} height={46} />
          </span>
          <span className={s.wordmark}>
            <small>THE EXPLORER’S FIELD GUIDE</small>
            <strong>
              OVER THE HILL<span>WIKI & GUIDES</span>
            </strong>
          </span>
        </a>
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={`${s.nav} ${open ? s.open : ""}`}
        >
          {navigation.map(([label, href]) => (
            <a key={href} href={href} aria-current={current(href)}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d={navIcons[href]}
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <form action="/search" className={s.search} role="search">
          <label htmlFor="site-search">
            A LITTLE DIRECTION FOR YOUR NEXT ADVENTURE
          </label>
          <div>
            <input
              id="site-search"
              aria-label="Search the site"
              name="q"
              type="search"
              placeholder="Search the field guide…"
            />
            <button type="submit" aria-label="Search">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="5.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </form>
        <button
          ref={toggle}
          type="button"
          className={s.toggle}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          <span>{open ? "Close" : "Menu"}</span>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d={open ? "m5 5 10 10M5 15 15 5" : "M3 6h14M3 10h14M3 14h10"}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
