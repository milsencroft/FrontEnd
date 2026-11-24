import { redirect } from "next/navigation";
import { Guard } from "@/components/Guard";
import { pageMetadata } from "@/lib/seo/metadata";
import { REVALIDATE_SECONDS, fetchBundles, fetchCatalogue } from "@/lib/seo/data";
import { ShopClient } from "./ShopClient";

export const revalidate = REVALIDATE_SECONDS;
export const metadata = pageMetadata({
  title: "Shop Fragrances", path: "/shop",
  description: "The Milsen & Croft collection: fragrances from an independent house in Kerala, India, each inspired by a real place and made in a limited run.",
});

export default async function Shop() {
  // Server-rendered first paint so the products are in the HTML; the client then keeps them live.
  const [rows, bundles] = await Promise.all([fetchCatalogue(), fetchBundles()]);
  // Nothing published yet: there is no shop page to show.
  if (rows && rows.length === 0 && (bundles ?? []).length === 0) redirect("/");
  return <Guard need="shop"><ShopClient initialRows={rows} initialBundles={rows ? bundles ?? [] : undefined} /></Guard>;
}
