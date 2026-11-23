import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { PLACEHOLDER_SITE, absoluteUrl, resolveSite } from "../lib/site";
import { DEFAULT_OG, NOINDEX, clip, noindexMetadata, pageMetadata } from "../lib/seo/metadata";
import { availabilityOf, breadcrumbLd, organizationLd, paiseToPrice, productLd, serializeLd, websiteLd } from "../lib/seo/jsonld";
import { PRIVATE_PATHS, buildRobots } from "../lib/seo/robots";
import { STATIC_PATHS, buildSitemap } from "../lib/seo/sitemap";
import { fetchPage, fetchRpc, groupByProduct } from "../lib/seo/data";
import type { ShopRow } from "../lib/useShop";

const BASE = "https://shop.example";
const row = (o: Partial<ShopRow> = {}): ShopRow => ({ product_code: "MZ", product_name: "Mazha Fresh", family: "Green", region_code: "KL", region_name: "Kerala", story: "Rain on warm earth.", notes: [], images: [{ path: "p/a.jpg", alt: "A bottle on wet stone" }], sku: "MZ-50", size_ml: 50, price_paise: 249900, compare_at_paise: null, in_stock: true, max_qty: 5, ...o });

describe("site url", () => {
  it("accepts a valid origin and strips any path", () => {
    expect(resolveSite("https://shop.example/some/path/")).toEqual({ url: "https://shop.example", configured: true });
  });
  it("falls back to the placeholder, unconfigured, when unset or invalid", () => {
    for (const v of [undefined, "", "  ", "not a url", "ftp://x.y"]) expect(resolveSite(v)).toEqual({ url: PLACEHOLDER_SITE, configured: false });
  });
  it("builds absolute urls", () => { expect(absoluteUrl("/shop", BASE)).toBe(`${BASE}/shop`); expect(absoluteUrl("shop", BASE)).toBe(`${BASE}/shop`); });
});

describe("page metadata", () => {
  it("sets canonical, Open Graph, Twitter and real image alt text", () => {
    const m = pageMetadata({ title: "Shop", path: "/shop", description: "d" }) as any;
    expect(m.alternates.canonical).toBe("/shop");
    expect(m.openGraph.url).toBe("/shop");
    expect(m.openGraph.title).toBe("Shop | Milsen & Croft");
    expect(m.openGraph.images[0]).toMatchObject({ url: DEFAULT_OG.url, width: 1200, height: 630 });
    expect(m.openGraph.images[0].alt.length).toBeGreaterThan(10);
    expect(m.twitter.card).toBe("summary_large_image");
    expect(m.twitter.images[0].alt).toBe(m.openGraph.images[0].alt);
  });
  it("uses a custom image with its own alt and an absolute title when asked", () => {
    const m = pageMetadata({ title: "Home", absoluteTitle: true, path: "/", image: { url: "https://cdn/x.jpg", alt: "A bottle" } }) as any;
    expect(m.title).toEqual({ absolute: "Home" });
    expect(m.openGraph.images[0]).toEqual({ url: "https://cdn/x.jpg", alt: "A bottle" });
  });
  it("only sets robots when asked, and noindex helpers block indexing", () => {
    expect((pageMetadata({ title: "a", path: "/a" }) as any).robots).toBeUndefined();
    expect(noindexMetadata("Cart").robots).toBe(NOINDEX);
    expect(NOINDEX).toMatchObject({ index: false, follow: false });
  });
  it("clips snippets at a word boundary", () => {
    expect(clip("  one   two\nthree ")).toBe("one two three");
    const long = "word ".repeat(80);
    const c = clip(long, 50);
    expect(c.length).toBeLessThanOrEqual(50);
    expect(c.endsWith("…")).toBe(true);
    expect(clip(null)).toBe("");
  });
});

describe("robots.txt", () => {
  it("disallows every private area and advertises the sitemap when configured", () => {
    const r = buildRobots(BASE, true) as any;
    expect(r.rules[0].disallow).toEqual(expect.arrayContaining(["/admin", "/account", "/cart", "/checkout", "/api"]));
    expect(r.rules[0].disallow).toEqual(PRIVATE_PATHS);
    expect(r.sitemap).toBe(`${BASE}/sitemap.xml`);
  });
  it("does not advertise a sitemap on the placeholder domain", () => {
    expect((buildRobots(PLACEHOLDER_SITE, false) as any).sitemap).toBeUndefined();
  });
});

describe("sitemap", () => {
  it("lists public pages, products, journal and published legal pages only", () => {
    const sm = buildSitemap({
      catalogue: [row(), row({ sku: "MZ-100", size_ml: 100 }), row({ product_code: "SE", sku: "SE-50" })],
      journal: [{ slug: "monsoon", kind: "journal", title: "Monsoon", summary: null, published_at: "2026-10-01T00:00:00Z" }],
      legal: [{ slug: "privacy", kind: "legal", title: "Privacy", summary: null, published_at: null }],
    }, BASE);
    const urls = sm.map((s) => s.url);
    expect(urls).toContain(`${BASE}/`);
    for (const p of STATIC_PATHS.slice(1)) expect(urls).toContain(`${BASE}${p}`);
    expect(urls.filter((u) => u.includes("/shop/"))).toEqual([`${BASE}/shop/MZ`, `${BASE}/shop/SE`]); // one per product, not per size
    expect(urls).toContain(`${BASE}/journal/monsoon`);
    expect(urls).toContain(`${BASE}/legal/privacy`);
    expect(sm.find((s) => s.url.endsWith("/journal/monsoon"))?.lastModified).toEqual(new Date("2026-10-01T00:00:00Z"));
    expect(urls.some((u) => /\/(admin|account|cart|checkout|api|faq|auth)/.test(u))).toBe(false);
  });
  it("still returns the static pages when the API gave nothing", () => {
    expect(buildSitemap({}, BASE)).toHaveLength(STATIC_PATHS.length);
  });
});

describe("JSON-LD", () => {
  it("converts integer paise to a price string without floats", () => {
    expect([0, 5, 100, 249900, 249950, 1999999].map(paiseToPrice)).toEqual(["0.00", "0.05", "1.00", "2499.00", "2499.50", "19999.99"]);
  });
  it("derives availability from stock and max_qty", () => {
    expect(availabilityOf({ in_stock: true, max_qty: 3 })).toMatch(/InStock$/);
    expect(availabilityOf({ in_stock: true, max_qty: 0 })).toMatch(/OutOfStock$/);
    expect(availabilityOf({ in_stock: false, max_qty: 9 })).toMatch(/OutOfStock$/);
  });
  it("builds a Product with one INR Offer per size, a brand and no invented ratings", () => {
    const p = productLd([row(), row({ sku: "MZ-100", size_ml: 100, price_paise: 399900, in_stock: false })], BASE) as any;
    expect(p["@type"]).toBe("Product");
    expect(p.brand).toEqual({ "@type": "Brand", name: "Milsen & Croft" });
    expect(p.url).toBe(`${BASE}/shop/MZ`);
    expect(p.image).toHaveLength(1);
    expect(p.offers.map((o: any) => [o.sku, o.price, o.priceCurrency, o.availability.split("/").pop()])).toEqual([["MZ-50", "2499.00", "INR", "InStock"], ["MZ-100", "3999.00", "INR", "OutOfStock"]]);
    expect(JSON.stringify(p)).not.toMatch(/aggregateRating|review/i);
    expect(productLd([], BASE)).toBeNull();
  });
  it("builds Organization, WebSite and BreadcrumbList", () => {
    expect((organizationLd(BASE) as any)).toMatchObject({ "@type": "Organization", url: BASE, address: { addressCountry: "IN" } });
    expect((websiteLd(BASE) as any).publisher["@id"]).toBe(`${BASE}/#organization`);
    const b = breadcrumbLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }], BASE) as any;
    expect(b.itemListElement.map((i: any) => [i.position, i.name, i.item])).toEqual([[1, "Home", `${BASE}/`], [2, "Shop", `${BASE}/shop`]]);
  });
  it("escapes markup so database text cannot break out of the script tag", () => {
    const s = serializeLd({ "@type": "Product", name: "</script><script>alert(1)</script>" });
    expect(s).not.toContain("</script>");
    expect(JSON.parse(s)["@graph"][0].name).toBe("</script><script>alert(1)</script>");
  });
});

describe("server data helpers", () => {
  const ok = (data: unknown) => vi.fn(async () => new Response(JSON.stringify({ data }), { status: 200 })) as unknown as typeof fetch;
  it("returns undefined (never throws) when the API fails", async () => {
    expect(await fetchRpc("x", {}, vi.fn(async () => { throw new Error("down"); }) as unknown as typeof fetch)).toBeUndefined();
    expect(await fetchRpc("x", {}, vi.fn(async () => new Response("no", { status: 500 })) as unknown as typeof fetch)).toBeUndefined();
  });
  it("distinguishes a missing page from an unreachable API", async () => {
    // fetchPage uses the global fetch; stub it for these cases
    const g = vi.stubGlobal;
    g("fetch", ok(null)); expect(await fetchPage("a", "journal")).toBeNull();
    g("fetch", ok({ slug: "a", kind: "legal", title: "T", summary: null, published_at: null })); expect(await fetchPage("a", "journal")).toBeNull();
    g("fetch", ok({ slug: "a", kind: "journal", title: "T", summary: null, published_at: null })); expect((await fetchPage("a", "journal"))?.title).toBe("T");
    g("fetch", vi.fn(async () => { throw new Error("x"); })); expect(await fetchPage("a", "journal")).toBeUndefined();
    vi.unstubAllGlobals();
  });
  it("groups catalogue rows by product", () => {
    expect([...groupByProduct([row(), row({ sku: "b" }), row({ product_code: "SE" })]).entries()].map(([k, v]) => [k, v.length])).toEqual([["MZ", 2], ["SE", 1]]);
  });
});

describe("noindex wiring", () => {
  it.each(["admin", "account", "cart", "auth"])("app/%s/layout.tsx marks the area noindex", (d) => {
    expect(readFileSync(`app/${d}/layout.tsx`, "utf8")).toMatch(/noindexMetadata\(/);
  });
});
