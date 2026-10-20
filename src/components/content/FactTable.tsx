import type { ContentFact } from "@/types/content";
import s from "@/style/content/article.module.css";

export default function FactTable({
  facts,
  caption = "At a glance",
}: {
  facts: ContentFact[];
  caption?: string;
}) {
  return (
    <div
      className={s.tableWrap}
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">Recorded value</th>
          </tr>
        </thead>
        <tbody>
          {facts.map((fact) => {
            return (
              <tr key={fact.label}>
                <th scope="row">{fact.label}</th>
                <td>{fact.value}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
