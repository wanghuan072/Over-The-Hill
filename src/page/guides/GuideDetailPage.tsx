import Article from "@/components/content/Article";
import type { ContentRecord } from "@/types/content";
export default function GuideDetailPage({ record }: { record: ContentRecord }) {
  return <Article record={record} prefix="/guides" title="Guides" article />;
}
