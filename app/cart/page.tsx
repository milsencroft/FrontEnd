"use client";
import { PageHero } from "@/components/PageHero";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useShop } from "@/lib/useShop";
import { useSession } from "@/lib/session";
import { signInWithGoogle } from "@/lib/supabase";
import { checkoutRetail } from "@/lib/api";
import { rupees } from "@/lib/money";
import { CheckoutPanel } from "@/components/CheckoutPanel";

export default function Cart() {
  const { lines, setQty, remove, clear } = useCart();
  const { rows, bundles } = useShop();
  const { session } = useSession();
  const [coupon, setCoupon] = useState(""); const [paying, setPaying] = useState(false);
  const describe = (l: (typeof lines)[number]) => {
    const v = l.sku ? rows?.find((r) => r.sku === l.sku) : undefined, b = l.bundle ? bundles.find((x) => x.code === l.bundle) : undefined;
    return v ? { name: `${v.product_name}, ${v.size_ml} ml`, price: v.price_paise, ok: v.in_stock } : b ? { name: b.name, price: b.price_paise, ok: b.in_stock } : null;
  };
  if (lines.length === 0) return <><PageHero title="Cart" tone="noir" /><section className="wrap py-16"><p className="text-lg">Your cart is empty.</p><Link className="btn mt-8" href="/shop">Shop</Link></section></>;
  const unavailable = lines.some((l) => rows && describe(l)?.ok !== true);

  return (
    <>
    <PageHero title="Cart" tone="noir" />
    <section className="wrap py-16">
      <ul className="mt-10 divide-y divide-stone/60 border-y border-stone/60">
        {lines.map((l) => { const d = describe(l); return (
          <li key={`${l.sku}${l.bundle}`} className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div><p className="font-serif text-2xl">{d?.name ?? "Item no longer available"}</p>{d && <p className="text-sm text-charcoal/70">{rupees(d.price)} each{d.ok ? "" : " · out of stock"}</p>}</div>
            <div className="flex items-center gap-3">
              <label className="sr-only" htmlFor={`q${l.sku}${l.bundle}`}>Quantity</label>
              <select id={`q${l.sku}${l.bundle}`} className="field w-20" value={l.qty} onChange={(e) => setQty(l, Number(e.target.value))}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select>
              <button className="min-h-[44px] px-2 text-sm underline underline-offset-4" onClick={() => remove(l)}>Remove</button>
            </div>
          </li>); })}
      </ul>
      <p className="mt-4 text-sm text-charcoal/70">Discounts, shipping, tax and the final total are calculated securely when you continue to payment.</p>
      {!paying && (
        <div className="mt-8 flex flex-wrap items-end gap-4">
          <div><label className="label" htmlFor="cp">Coupon code</label><input id="cp" className="field w-56" value={coupon} onChange={(e) => setCoupon(e.target.value)} /></div>
          {session ? <button className="btn" disabled={unavailable} onClick={() => setPaying(true)}>Continue to payment</button> : <button className="btn" onClick={() => signInWithGoogle()}>Sign in to continue</button>}
          <button className="btn-ghost" onClick={clear}>Clear cart</button>
        </div>
      )}
      {unavailable && <p role="alert" className="mt-4 text-danger">Remove unavailable items to continue.</p>}
      {paying && <div className="mt-10"><CheckoutPanel start={(a) => checkoutRetail(lines, a, coupon.trim() || undefined)} onCancel={() => setPaying(false)} onPaid={clear} /></div>}
    </section>
    </>
  );
}
