import { notFound } from "next/navigation";
import LegalPage, { legalContent } from "@/page/legal/LegalPage";
import { staticMetadata } from "@/seo/metadata";
// The site uses full document navigation for independent pages.
export const instant = false;
export function generateStaticParams() {
  return Object.keys(legalContent).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!legalContent[slug]) notFound();
  return staticMetadata(
    `/legal/${slug}` as Parameters<typeof staticMetadata>[0],
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!legalContent[slug]) notFound();
  return <LegalPage slug={slug} />;
}
