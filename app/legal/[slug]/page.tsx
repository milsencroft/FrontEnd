import type { Metadata } from "next";
import { PageBody } from "@/components/PageBody";
import { NOINDEX_FOLLOW, pageMetadata } from "@/lib/seo/metadata";
import { REVALIDATE_SECONDS, fetchPage } from "@/lib/seo/data";

export const revalidate = REVALIDATE_SECONDS;
const TITLES: Record<string, string> = { privacy: "Privacy Policy", terms: "Terms of Sale", shipping: "Shipping Policy", returns: "Returns & Refunds" };
export function generateStaticParams() { return Object.keys(TITLES).map((slug) => ({ slug })); }

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = `/legal/${encodeURIComponent(params.slug)}`;
  const title = TITLES[params.slug] ?? "Policy";
  const page = await fetchPage(params.slug, "legal");
  // Until the business publishes the wording, the page only shows a notice: keep it out of the index.
  if (page === null) return pageMetadata({ title, path, robots: NOINDEX_FOLLOW });
  return pageMetadata({ title: page?.title ?? title, path, description: page?.summary || `${page?.title ?? title} for Milsen & Croft fragrance orders.` });
}

export default async function Legal({ params }: Props) {
  // Policy wording is written by the business in the admin Content editor; until it is published a neutral notice shows.
  const page = await fetchPage(params.slug, "legal");
  return <PageBody slug={params.slug} kind="legal" fallbackTitle={TITLES[params.slug]} initial={page} />;
}
