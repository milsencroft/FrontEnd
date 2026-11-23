"use client";
import { PageHero } from "@/components/PageHero";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { signInWithGoogle } from "@/lib/supabase";
import { checkoutRetail } from "@/lib/api";
import { rupees } from "@/lib/money";
import { CheckoutPanel } from "@/components/CheckoutPanel";

export default function Cart() {
  const { cart, loading, setQty, remove, clear, error } = useCart();
  const { session } = useSession();
  const [coupon, setCoupon] = useState(""); const [paying, setPaying] = useState(false);
  const lines = cart.lines;
  if (loading) return <><PageHero title="Cart" tone="noir" /><section className="wrap py-16"><p>Loading your cart…</p></section></>;
  if (lines.length === 0) return <><PageHero title="Cart" tone="noir" /><section className="wrap py-16"><p className="text-lg">Your cart is empty.</p><Link className="btn mt-8" href="/shop">Shop</Link></section></>;
  const unavailable = lines.some((l) => !l.ok);
  const ref = (l: (typeof lines)[number]) => (l.sku ? { sku: l.sku } : { bundle: l.bundle! });

  return (
    <>
    <PageHero title="Cart" tone="noir" />
    <section className="wrap py-16">
      <ul className="mt-10 divide-y divide-stone/60 border-y border-stone/60">
        {lines.map((l) => { const key = `${l.sku ?? ""}${l.bundle ?? ""}`; return (
          <li key={key} className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div><p className="font-serif text-2xl">{l.name ?? "Item no longer available"}</p>{l.unit_paise != null && <p className="text-sm text-charcoal/70">{rupees(l.unit_paise)} each{l.ok ? "" : " · out of stock"}</p>}</div>
            <div className="flex items-center gap-3">
              <label className="sr-only" htmlFor={`q${key}`}>Quantity</label>
              <select id={`q${key}`} className="field w-20" value={l.qty} onChange={(e) => void setQty(ref(l), Number(e.target.value))}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select>
              <button className="min-h-[44px] px-2 text-sm underline underline-offset-4" onClick={() => void remove(ref(l))}>Remove</button>
            </div>
          </li>); })}
      </ul>
      {error && <p role="alert" className="mt-4 text-danger">{error}</p>}
      <p className="mt-4 text-sm text-charcoal/70">Discounts, shipping, tax and the final total are calculated securely when you continue to payment.</p>
      {!paying && (
        <div className="mt-8 flex flex-wrap items-end gap-4">
          <div><label className="label" htmlFor="cp">Coupon code</label><input id="cp" className="field w-56" value={coupon} onChange={(e) => setCoupon(e.target.value)} /></div>
          {session ? <button className="btn" disabled={unavailable} onClick={() => setPaying(true)}>Continue to payment</button> : <button className="btn" onClick={() => signInWithGoogle()}>Sign in to continue</button>}
          <button className="btn-ghost" onClick={() => void clear()}>Clear cart</button>
        </div>
      )}
      {unavailable && <p role="alert" className="mt-4 text-danger">Remove unavailable items to continue.</p>}
      {paying && <div className="mt-10"><CheckoutPanel start={(a) => checkoutRetail(a, coupon.trim() || undefined)} onCancel={() => setPaying(false)} onPaid={() => void clear()} /></div>}
    </section>
    </>
  );
}
