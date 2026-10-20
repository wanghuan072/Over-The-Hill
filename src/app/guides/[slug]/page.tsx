import { notFound } from "next/navigation";
import { guides } from "@/lib/data/catalog";
import { articleMetadata } from "@/seo/metadata";
import Page from "@/page/guides/GuideDetailPage";
// The site uses full document navigation for independent pages.
export const instant = false;
export function generateStaticParams() {
  return guides.map((r) => ({ slug: r.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = guides.find((r) => r.slug === slug);
  if (!r) notFound();
  return articleMetadata(r, `/guides/${slug}`);
}
export default async function Route({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = guides.find((r) => r.slug === slug);
  if (!r) notFound();
  return <Page record={r} />;
}
