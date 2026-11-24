import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "../site";
import { groupByProduct } from "./data";
import type { PageRow } from "@/components/PageBody";
import type { ShopRow } from "../useShop";

/** Public, indexable pages that exist without any data. Utility, account and thin pages are left out on purpose. */
export const STATIC_PATHS = ["/", "/shop", "/collections", "/launch", "/society", "/philosophy", "/journal", "/contact"];

export function buildSitemap(input: { catalogue?: ShopRow[]; journal?: PageRow[]; legal?: PageRow[]; launchOpen?: boolean }, base = SITE_URL): MetadataRoute.Sitemap {
  const at = (p: string, lastModified?: string | null): MetadataRoute.Sitemap[number] => ({
    url: p === "/" ? `${base}/` : absoluteUrl(p, base),
    ...(lastModified && !Number.isNaN(Date.parse(lastModified)) ? { lastModified: new Date(lastModified) } : {}),
  });
  // Pages with nothing to show are left out: an empty shop, or a launch that is not running.
  const hidden = new Set<string>([...(input.catalogue && input.catalogue.length === 0 ? ["/shop"] : []), ...(input.launchOpen === false ? ["/launch", "/collections"] : [])]);
  const out = STATIC_PATHS.filter((p) => !hidden.has(p)).map((p) => at(p));
  for (const code of groupByProduct(input.catalogue ?? []).keys()) out.push(at(`/shop/${encodeURIComponent(code)}`));
  for (const e of input.journal ?? []) out.push(at(`/journal/${encodeURIComponent(e.slug)}`, e.published_at));
  for (const e of input.legal ?? []) out.push(at(`/legal/${encodeURIComponent(e.slug)}`, e.published_at));
  return out;
}

