"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useShop } from "@/lib/useShop";
import { useCart } from "@/lib/cart";
import { rupees } from "@/lib/money";
import { Flacon } from "@/components/Flacon";
import { Photo } from "@/components/ProductImage";
import { imagesOf } from "@/lib/media";

const tone = (region: string) => (region === "Japan" ? "bronze" : "sage");

export default function Shop() {
  const { rows, bundles } = useShop();
  const { add } = useCart();
  const [q, setQ] = useState(""); const [region, setRegion] = useState(""); const [family, setFamily] = useState("");
  const [inStock, setInStock] = useState(false); const [sort, setSort] = useState("featured"); const [added, setAdded] = useState<string | null>(null);

  // One card per product (cheapest size shown); sizes are chosen on the product page.
  const products = useMemo(() => {
    const m = new Map<string, NonNullable<typeof rows>[number]>();
    for (const r of rows ?? []) { const cur = m.get(r.product_code); if (!cur || r.price_paise < cur.price_paise) m.set(r.product_code, r); }
    let list = [...m.values()].filter((p) => (!region || p.region_name === region) && (!family || p.family === family) && (!inStock || p.in_stock) && (!q || `${p.product_name} ${p.region_name} ${p.family}`.toLowerCase().includes(q.toLowerCase())));
    if (sort === "low") list.sort((a, b) => a.price_paise - b.price_paise); if (sort === "high") list.sort((a, b) => b.price_paise - a.price_paise);
    return list;
  }, [rows, q, region, family, inStock, sort]);
  const regions = [...new Set((rows ?? []).map((r) => r.region_name))], families = [...new Set((rows ?? []).map((r) => r.family))];
  const sel = "field w-auto";

  return (
    <section className="wrap py-16">
      <h1 className="text-5xl sm:text-7xl">Shop</h1>
      <form role="search" aria-label="Filter products" className="mt-10 flex flex-wrap items-end gap-4" onSubmit={(e) => e.preventDefault()}>
        <div><label className="label" htmlFor="q">Search</label><input id="q" className="field w-56" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div><label className="label" htmlFor="rg">Region</label><select id="rg" className={sel} value={region} onChange={(e) => setRegion(e.target.value)}><option value="">All</option>{regions.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div><label className="label" htmlFor="fm">Family</label><select id="fm" className={sel} value={family} onChange={(e) => setFamily(e.target.value)}><option value="">All</option>{families.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div><label className="label" htmlFor="so">Sort</label><select id="so" className={sel} value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price, low to high</option><option value="high">Price, high to low</option></select></div>
        <label className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />In stock only</label>
      </form>
      {rows === null && <p className="mt-10">Loading…</p>}
      {rows && products.length === 0 && bundles.length === 0 && <p className="mt-10 text-charcoal/70">{rows.length === 0 ? <>The first fragrances are in our launch. <Link className="underline underline-offset-4" href="/launch">See the launch</Link>.</> : "No products match these filters."}</p>}
      <div className="cq mt-12"><div className="cq-grid grid grid-cols-1 gap-8">
        {products.map((p) => (
          <article key={p.product_code} className="border border-stone/60 bg-white p-6">
            <Link href={`/shop/${p.product_code}`} aria-label={p.product_name}>{imagesOf(p.images)[0] ? <div className="aspect-[4/5] overflow-hidden bg-stone/20"><Photo image={imagesOf(p.images)[0]} /></div> : <Flacon tone={tone(p.region_name)} label={p.product_name.split(" ")[0]} interactive={false} />}</Link>
            <p className="mt-4 text-sm text-bronze">{p.region_name}</p>
            <h2 className="mt-1 text-3xl"><Link href={`/shop/${p.product_code}`}>{p.product_name}</Link></h2>
            <p className="text-sm text-charcoal/70">{p.family}</p>
            <p className="mt-3">From {rupees(p.price_paise)}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {p.in_stock ? <button className="btn" onClick={() => { add({ sku: p.sku }); setAdded(p.sku); }}>{added === p.sku ? "Added to cart" : "Add to cart"}</button> : <p className="text-sm text-danger">Out of stock</p>}
              <Link className="btn-ghost" href={`/shop/${p.product_code}`}>Details</Link>
            </div>
          </article>
        ))}
        {bundles.map((b) => (
          <article key={b.code} className="border border-stone/60 bg-white p-6">
            <p className="text-sm text-bronze">Set</p>
            <h2 className="mt-1 text-3xl">{b.name}</h2>
            {b.description && <p className="mt-2 text-charcoal/80">{b.description}</p>}
            <p className="mt-3">{rupees(b.price_paise)}</p>
            <div className="mt-4">{b.in_stock ? <button className="btn" onClick={() => { add({ bundle: b.code }); setAdded(b.code); }}>{added === b.code ? "Added to cart" : "Add to cart"}</button> : <p className="text-sm text-danger">Out of stock</p>}</div>
          </article>
        ))}
      </div></div>
    </section>
  );
}
