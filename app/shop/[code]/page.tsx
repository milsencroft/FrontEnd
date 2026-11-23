"use client";
import { Loader } from "@/components/Loader";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { notesList, useShop } from "@/lib/useShop";
import { useCart } from "@/lib/cart";
import { rupees } from "@/lib/money";
import { Flacon } from "@/components/Flacon";
import { Photo } from "@/components/ProductImage";
import { imagesOf } from "@/lib/media";
import { WishlistButton } from "@/components/WishlistButton";

function Gallery({ images, fallback }: { images: ReturnType<typeof imagesOf>; fallback: React.ReactNode }) {
  const [i, setI] = useState(0);
  if (images.length === 0) return <>{fallback}</>;
  return (
    <div>
      <div className="aspect-[4/5] overflow-hidden bg-stone/20"><Photo image={images[Math.min(i, images.length - 1)]} /></div>
      {images.length > 1 && <div className="mt-3 flex gap-3">{images.map((im, n) => (
        <button key={im.path} type="button" aria-label={`Show image ${n + 1}`} aria-pressed={n === i} onClick={() => setI(n)} className={`h-16 w-16 overflow-hidden border-2 ${n === i ? "border-charcoal" : "border-transparent opacity-60"}`}><Photo image={im} /></button>))}</div>}
    </div>
  );
}

export default function Product() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { rows } = useShop();
  const { add } = useCart();
  const variants = (rows ?? []).filter((r) => r.product_code === code);
  const [sku, setSku] = useState(""); const [qty, setQty] = useState(1); const [done, setDone] = useState(false);
  useEffect(() => { if (variants.length && !variants.find((v) => v.sku === sku)) setSku((variants.find((v) => v.in_stock) ?? variants[0]).sku); }, [rows]); // eslint-disable-line
  if (rows === null) return <Loader />;
  const v = variants.find((x) => x.sku === sku);
  if (!v) return <section className="wrap py-20"><h1 className="text-4xl">Product not found</h1><p className="mt-4">This product is not in the shop right now. It may be part of a launch.</p><Link className="btn mt-8" href="/shop">Back to shop</Link></section>;
  const notes = notesList(v.notes);
  const related = [...new Map((rows ?? []).filter((r) => r.product_code !== code).map((r) => [r.product_code, r])).values()].slice(0, 3);

  return (
    <section className="wrap py-16">
      <Link href="/shop" className="text-sm underline underline-offset-4">Shop</Link>
      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <div className="md:sticky md:top-24 md:self-start"><Gallery images={imagesOf(v.images)} fallback={<Flacon tone={v.region_name === "Japan" ? "bronze" : "sage"} label={v.product_name.split(" ")[0]} />} /></div>
        <div>
          <p className="text-sm text-bronze">{v.region_name} · {v.family}</p>
          <h1 className="mt-2 text-5xl sm:text-6xl">{v.product_name}</h1>
          <p className="mt-2 text-sm text-charcoal/60">{v.product_code}</p>
          {v.story && <p className="mt-6">{v.story}</p>}
          {notes.length > 0 && <p className="mt-4"><span className="text-charcoal/60">Notes: </span>{notes.join(", ")}</p>}
          <fieldset className="mt-8"><legend className="label">Size</legend>
            <div className="flex flex-wrap gap-3">{variants.map((x) => (
              <label key={x.sku} className={`flex min-h-[48px] cursor-pointer items-center border px-5 ${x.sku === sku ? "border-charcoal bg-charcoal text-ivory" : "border-stone"} ${x.in_stock ? "" : "opacity-40"}`}>
                <input type="radio" name="size" className="sr-only" checked={x.sku === sku} onChange={() => setSku(x.sku)} disabled={!x.in_stock} />{x.size_ml} ml · {rupees(x.price_paise)}</label>))}</div>
          </fieldset>
          <p className="mt-6 text-2xl">{rupees(v.price_paise)}{v.compare_at_paise ? <span className="ml-3 text-base text-charcoal/50 line-through">{rupees(v.compare_at_paise)}</span> : null}</p>
          <p className="mt-1 text-sm">{v.in_stock ? "In stock" : "Out of stock"}</p>
          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div><label className="label" htmlFor="qty">Quantity</label><select id="qty" className="field w-24" value={qty} onChange={(e) => setQty(Number(e.target.value))}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select></div>
            <button className="btn" disabled={!v.in_stock} onClick={() => { add({ sku: v.sku }, qty); setDone(true); }}>{done ? "Added to cart" : "Add to cart"}</button>
            <button className="btn-ghost" disabled={!v.in_stock} onClick={() => { add({ sku: v.sku }, qty); router.push("/cart"); }}>Buy now</button>
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
