import ContentBrowser from "./ContentBrowser";
import { toSearchItem } from "@/lib/data/catalog";
import type { ContentRecord } from "@/types/content";
import s from "@/style/content/browser.module.css";

export default function RecordCatalog({
  records,
  prefix,
  images = true,
}: {
  records: ContentRecord[];
  prefix: string;
  images?: boolean;
}) {
  const details = Object.fromEntries(
    records.map((record) => [
      toSearchItem(record, prefix).href,
      <div key={record.id} className={s.recordData}>
        {record.playerNotes?.length ? (
          <details className={s.notes}>
            <summary>
              {prefix === "/vehicles" ? "Garage notes" : "Field notes"}
              <span aria-hidden="true"> +</span>
            </summary>
            {record.playerNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </details>
        ) : null}
      </div>,
    ]),
  );
  return (
    <ContentBrowser
      items={records.map((record) => toSearchItem(record, prefix))}
      dataOnly={!images}
      details={details}
    />
  );
}
