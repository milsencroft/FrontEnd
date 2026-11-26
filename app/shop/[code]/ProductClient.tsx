"use client";
import { Loader } from "@/components/Loader";
import Link from "next/link";
import { useEffect, useState } from "react";
import { notesList, useShop, type ShopRow } from "@/lib/useShop";
import { AddToCart } from "@/components/AddToCart";
import { rupees } from "@/lib/money";
import { Flacon } from "@/components/Flacon";
import { Photo } from "@/components/ProductImage";
import { imagesOf } from "@/lib/media";
import { WishlistButton } from "@/components/WishlistButton";
import { useOffers } from "@/lib/useOffers";
import { OfferBadge } from "@/components/OfferBadge";

function Gallery({ images, fallback }: { images: ReturnType<typeof imagesOf>; fallback: React.ReactNode }) {
  const [i, setI] = useState(0);
  if (images.length === 0) return <>{fallback}</>;
  return (
    <div>
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-stone/20"><Photo image={images[Math.min(i, images.length - 1)]} priority={i === 0} /></div>
      {images.length > 1 && <div className="mt-3 flex gap-3">{images.map((im, n) => (
        <button key={im.path} type="button" aria-label={`Show image ${n + 1}`} aria-pressed={n === i} onClick={() => setI(n)} className={`h-16 w-16 overflow-hidden rounded-xl ring-2 transition ${n === i ? "ring-brass" : "ring-transparent opacity-60 hover:opacity-100"}`}><Photo image={im} /></button>))}</div>}
    </div>
  );
}

export function ProductClient({ code, initialRows }: { code: string; initialRows?: ShopRow[] }) {
  const { rows } = useShop({ rows: initialRows });
  const offers = useOffers();
  const variants = (rows ?? []).filter((r) => r.product_code === code);
  const firstSku = () => (variants.find((v) => v.in_stock) ?? variants[0])?.sku ?? "";
  const [sku, setSku] = useState(firstSku);
  useEffect(() => { if (variants.length && !variants.find((v) => v.sku === sku)) setSku(firstSku()); }, [rows]); // eslint-disable-line
  if (rows === null) return <Loader />;
  const v = variants.find((x) => x.sku === sku) ?? variants[0];
  if (!v) return <section className="wrap py-20"><h1 className="text-4xl">Product not found</h1><p className="mt-4">This product is not in the shop right now. It may be part of a launch.</p><Link className="btn mt-8" href="/shop">Back to shop</Link></section>;
  const notes = notesList(v.notes);
  const related = [...new Map((rows ?? []).filter((r) => r.product_code !== code).map((r) => [r.product_code, r])).values()].slice(0, 3);

  return (
    <section className="wrap py-16">
      <nav aria-label="Breadcrumb" className="text-sm"><ol className="flex flex-wrap items-center gap-2"><li><Link href="/" className="underline underline-offset-4">Home</Link></li><li aria-hidden>/</li><li><Link href="/shop" className="underline underline-offset-4">Shop</Link></li><li aria-hidden>/</li><li aria-current="page">{v.product_name}</li></ol></nav>
      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <div className="md:sticky md:top-24 md:self-start"><Gallery images={imagesOf(v.images)} fallback={<Flacon tone={v.region_name === "Japan" ? "bronze" : "sage"} label={v.product_name.split(" ")[0]} />} /></div>
        <div>
          <p className="text-sm text-brass">{v.region_name} · {v.family}</p>
          <h1 className="mt-2 text-5xl sm:text-6xl">{v.product_name}</h1>
          <p className="mt-2 text-sm text-charcoal/70">{v.product_code}</p>
          {v.story && <p className="mt-6">{v.story}</p>}
          {notes.length > 0 && <p className="mt-4"><span className="text-charcoal/70">Notes: </span>{notes.join(", ")}</p>}
          <fieldset className="mt-8"><legend className="label">Size</legend>
            <div className="flex flex-wrap gap-3">{variants.map((x) => (
              <label key={x.sku} className={`flex min-h-[48px] cursor-pointer items-center rounded-full border px-6 transition-colors ${x.sku === sku ? "border-charcoal bg-charcoal text-ivory" : "border-charcoal/30 hover:border-charcoal"} ${x.in_stock ? "" : "opacity-40"}`}>
                <input type="radio" name="size" className="sr-only" checked={x.sku === sku} onChange={() => setSku(x.sku)} disabled={!x.in_stock} />{x.size_ml} ml · {rupees(x.price_paise)}</label>))}</div>
          </fieldset>
          {offers[v.sku]?.sale_price_paise != null
            ? <p className="mt-6 text-2xl">{rupees(offers[v.sku].sale_price_paise!)}<span className="ml-3 text-base text-charcoal/70 line-through">{rupees(v.price_paise)}</span></p>
            : <p className="mt-6 text-2xl">{rupees(v.price_paise)}{v.compare_at_paise ? <span className="ml-3 text-base text-charcoal/70 line-through">{rupees(v.compare_at_paise)}</span> : null}</p>}
          <div className="mt-3"><OfferBadge offer={offers[v.sku]} /></div>
          {offers[v.sku] && <p className="mt-2 text-sm text-charcoal/70">Applied automatically in your cart.</p>}
          <p className="mt-1 text-sm">{v.in_stock ? "In stock" : "Out of stock"}</p>
          <div className="mt-6 flex flex-wrap items-end gap-4">
            <AddToCart key={v.sku} id={`d-${v.sku}`} line={{ sku: v.sku }} max={v.max_qty} />
            <WishlistButton code={code} />
          </div>
          <p className="mt-8 text-sm text-charcoal/70">See our <Link className="underline underline-offset-4" href="/legal/shipping">shipping</Link> and <Link className="underline underline-offset-4" href="/legal/returns">returns</Link> policies.</p>
        </div>
      </div>
      {related.length > 0 && <div className="mt-24"><h2 className="text-3xl">More from the shop</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">{related.map((r) => <Link key={r.product_code} href={`/shop/${r.product_code}`}><p className="font-serif text-2xl">{r.product_name}</p><p className="text-sm text-charcoal/70">{r.region_name} · from {rupees(r.price_paise)}</p></Link>)}</div></div>}
    </section>
  );
}
