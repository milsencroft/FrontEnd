import { CONTACT_EMAIL, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, TAGLINE, absoluteUrl } from "../site";
import { clip } from "./metadata";
import { imagesOf, mediaUrl } from "../media";
import type { ShopRow } from "../useShop";

type Json = Record<string, unknown>;

/** Integer paise to a schema.org price string such as "1499.00". Display only: no price is decided here. */
export function paiseToPrice(paise: number): string {
  const p = Math.max(0, Math.trunc(paise));
  return `${Math.floor(p / 100)}.${String(p % 100).padStart(2, "0")}`;
}

export const organizationLd = (base = SITE_URL): Json => ({
  "@type": "Organization", "@id": `${base}/#organization`, name: SITE_NAME, url: base, slogan: TAGLINE, description: DEFAULT_DESCRIPTION,
  logo: absoluteUrl("/logo.png", base), image: absoluteUrl("/opengraph-image.png", base),
  email: CONTACT_EMAIL, address: { "@type": "PostalAddress", addressRegion: "Kerala", addressCountry: "IN" },
  contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: CONTACT_EMAIL, availableLanguage: ["en"] },
});

export const websiteLd = (base = SITE_URL): Json => ({
  "@type": "WebSite", "@id": `${base}/#website`, name: SITE_NAME, url: base, inLanguage: "en-IN", publisher: { "@id": `${base}/#organization` },
});

export function breadcrumbLd(items: { name: string; path: string }[], base = SITE_URL): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path, base) })),
  };
}

/** In stock only when the backend says so and allows at least one unit to be bought. */
export const availabilityOf = (r: Pick<ShopRow, "in_stock" | "max_qty">) =>
  `https://schema.org/${r.in_stock && r.max_qty > 0 ? "InStock" : "OutOfStock"}`;

/** One Product for a fragrance, with one Offer per size. No ratings or reviews: none exist. */
export function productLd(variants: ShopRow[], base = SITE_URL): Json | null {
  const v = variants[0];
  if (!v) return null;
  const url = absoluteUrl(`/shop/${encodeURIComponent(v.product_code)}`, base);
  const images = imagesOf(v.images).map((i) => mediaUrl(i.path));
  const description = clip(v.story, 500) || `${v.product_name}, a ${v.family} fragrance from ${v.region_name} by ${SITE_NAME}.`;
  return {
    "@type": "Product", "@id": `${url}#product`, name: v.product_name, url, description,
    ...(images.length ? { image: images } : {}),
    category: "Fragrance",
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: variants.map((x) => ({
      "@type": "Offer", sku: x.sku, name: `${x.product_name}, ${x.size_ml} ml`, url,
      price: paiseToPrice(x.price_paise), priceCurrency: "INR", availability: availabilityOf(x), itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${base}/#organization` },
    })),
  };
}

/** Serialises JSON-LD for a script tag. "<" is escaped so database text can never close the tag. */
export const serializeLd = (nodes: Json | Json[]): string =>
  JSON.stringify({ "@context": "https://schema.org", "@graph": Array.isArray(nodes) ? nodes : [nodes] })
    .replace(/</g, "\\u003c")
    .replace(new RegExp("\\u2028", "g"), "\\u2028")
    .replace(new RegExp("\\u2029", "g"), "\\u2029");
