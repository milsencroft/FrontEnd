import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBody } from "@/components/PageBody";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { NOINDEX, pageMetadata } from "@/lib/seo/metadata";
import { REVALIDATE_SECONDS, fetchPage } from "@/lib/seo/data";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

export const revalidate = REVALIDATE_SECONDS;
export const dynamicParams = true;
export function generateStaticParams() { return []; }

type Props = { params: { slug: string } };
const pathOf = (slug: string) => `/journal/${encodeURIComponent(slug)}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetchPage(params.slug, "journal");
  if (page === undefined) return pageMetadata({ title: "Journal", path: pathOf(params.slug) });
  if (page === null) return { title: "Entry not found", robots: NOINDEX, alternates: { canonical: null } };
  return pageMetadata({
    title: page.title, path: pathOf(params.slug), type: "article",
    description: page.summary || `${page.title}. A story from the Milsen & Croft journal.`,
  });
}

export default async function Entry({ params }: Props) {
  const page = await fetchPage(params.slug, "journal");
  if (page === null) notFound();
  return (
    <>
      {page && <JsonLd data={[
        { "@type": "Article", headline: page.title, ...(page.summary ? { description: page.summary } : {}), ...(page.published_at ? { datePublished: page.published_at } : {}), mainEntityOfPage: absoluteUrl(pathOf(params.slug)), author: { "@type": "Organization", name: SITE_NAME }, publisher: { "@id": `${SITE_URL}/#organization` } },
        breadcrumbLd([{ name: "Home", path: "/" }, { name: "Journal", path: "/journal" }, { name: page.title, path: pathOf(params.slug) }]),
      ]} />}
      <PageBody slug={params.slug} kind="journal" initial={page} />
    </>
  );
}
