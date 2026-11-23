import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, productLd } from "@/lib/seo/jsonld";
import { NOINDEX, clip, pageMetadata } from "@/lib/seo/metadata";
import { REVALIDATE_SECONDS, fetchCatalogue, groupByProduct } from "@/lib/seo/data";
import { imagesOf, mediaUrl } from "@/lib/media";
import { SITE_NAME } from "@/lib/site";
import { ProductClient } from "./ProductClient";

export const revalidate = REVALIDATE_SECONDS;
export const dynamicParams = true;
export async function generateStaticParams() {
  const rows = await fetchCatalogue();
  return rows ? [...groupByProduct(rows).keys()].map((code) => ({ code })) : [];
}

type Props = { params: { code: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = `/shop/${encodeURIComponent(params.code)}`;
  const rows = await fetchCatalogue();
  if (!rows) return pageMetadata({ title: "Fragrance", path }); // API unreachable: generic but valid
  const variants = groupByProduct(rows).get(params.code);
  if (!variants) return { title: "Product not found", robots: NOINDEX, alternates: { canonical: null } };
  const v = variants[0];
  const sizes = variants.map((x) => `${x.size_ml} ml`).join(", ");
  const img = imagesOf(v.images)[0];
  return pageMetadata({
    title: `${v.product_name}: a ${v.region_name} fragrance`, path,
    description: v.story ? clip(`${v.story}`, 155) : `${v.product_name} is a ${v.family} fragrance from ${v.region_name} by ${SITE_NAME}. Available in ${sizes}.`,
    // The library's own alt text describes the photo; the card falls back to the brand image when there is none.
    image: img ? { url: mediaUrl(img.path), alt: img.alt } : null,
  });
}

export default async function Product({ params }: Props) {
  const rows = await fetchCatalogue();
  const variants = rows ? groupByProduct(rows).get(params.code) : undefined;
  if (rows && !variants) notFound(); // a real 404, not a soft one
  const path = `/shop/${encodeURIComponent(params.code)}`;
  return (
    <>
      {variants && <JsonLd data={[productLd(variants)!, breadcrumbLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }, { name: variants[0].product_name, path }])]} />}
      <ProductClient code={params.code} initialRows={rows} />
    </>
  );
}
