import { notFound } from "next/navigation";
import { wikiCategories } from "@/lib/data/catalog";
import { staticMetadata } from "@/seo/metadata";
import WikiCategoryPage from "@/page/wiki/WikiCategoryPage";
// The site uses full document navigation for independent pages.
export const instant = false;
export function generateStaticParams() {
  return wikiCategories.map((category) => ({ category: category.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const record = wikiCategories.find((item) => item.slug === category);
  if (!record) notFound();
  return staticMetadata(
    `/wiki/${record.slug}` as Parameters<typeof staticMetadata>[0],
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const record = wikiCategories.find((item) => item.slug === category);
  if (!record) notFound();
  return <WikiCategoryPage category={record} />;
}
