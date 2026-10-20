import s from "@/style/page/legal/legal.module.css";
export default function NotFoundPage() {
  return (
    <section className={s.page}>
      <div className={`container ${s.lost}`}>
        <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="37"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="m64 35-8 22-21 8 8-22 21-8Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M50 4v16m0 60v16M4 50h16m60 0h16" stroke="currentColor" />
        </svg>
        <span className={s.kicker}>404 · A little off the trail</span>
        <h1>This Road Ends Here</h1>
        <p>
          That page does not exist, or the entry has not been verified for
          publication.
        </p>
        <nav className={s.related}>
          <a href="/">Return home →</a>
          <a href="/guides">Browse guides →</a>
          <a href="/search">Search the wiki →</a>
        </nav>
      </div>
    </section>
  );
}
