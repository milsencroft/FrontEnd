"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rupees } from "@/lib/money";
import { checkoutRetail } from "@/lib/api";
import { useSession } from "@/lib/session";
import { signInWithGoogle } from "@/lib/supabase";
import { CheckoutPanel } from "@/components/CheckoutPanel";
import { Flacon } from "@/components/Flacon";

interface Row { product_code: string; product_name: string; family: string; region_name: string; story: string | null; sku: string; size_ml: number; price_paise: number; compare_at_paise: number | null; in_stock: boolean }
interface Bundle { code: string; name: string; description: string | null; price_paise: number; in_stock: boolean }

export default function Shop() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const { session } = useSession();
  const [buying, setBuying] = useState<{ label: string; item: { sku?: string; bundle?: string; qty: number } } | null>(null);
  const buy = (label: string, item: { sku?: string; bundle?: string }) => (session ? setBuying({ label, item: { ...item, qty: 1 } }) : void signInWithGoogle());
  useEffect(() => {
    supabase.rpc("shop_catalogue").then(({ data }) => setRows((data as Row[]) ?? []));
    supabase.rpc("shop_bundles").then(({ data }) => setBundles((data as Bundle[]) ?? []));
  }, []);
  return (
    <section className="wrap py-16 cq">
      <h1 className="text-5xl sm:text-6xl">Shop</h1>
      {rows === null && <p className="mt-8">Loading…</p>}
      {rows && rows.length === 0 && bundles.length === 0 && <p className="mt-8 text-charcoal/70">Our first fragrances are launching soon. See the <a className="underline" href="/launch">launch page</a>.</p>}
      {buying && <div className="mt-8"><p className="mb-3 font-serif text-xl">{buying.label}</p><CheckoutPanel start={(a) => checkoutRetail([buying.item], a)} onCancel={() => setBuying(null)} /></div>}
      <div className="cq-grid mt-10 grid grid-cols-1 gap-6">
        {rows?.map((r) => (
          <article key={r.sku} className="border border-stone/60 bg-white p-6">
            <Flacon tone={r.region_name === "Japan" ? "bronze" : "sage"} label={r.product_name.split(" ")[0]} className="mb-4" />
            <p className="text-sm text-bronze">{r.region_name}</p>
            <h2 className="mt-1 text-3xl">{r.product_name}</h2>
            <p className="text-sm text-charcoal/70">{r.family} · {r.size_ml} ml</p>
            <p className="mt-4">{rupees(r.price_paise)}</p>
            {r.in_stock ? <button className="btn mt-4" onClick={() => buy(r.product_name, { sku: r.sku })}>{session ? "Buy" : "Sign in to buy"}</button> : <p className="mt-2 text-sm text-danger">Out of stock</p>}
          </article>
        ))}
        {bundles.map((b) => (
          <article key={b.code} className="border border-stone/60 bg-white p-6">
            <p className="text-sm text-bronze">Set</p>
            <h2 className="mt-1 text-3xl">{b.name}</h2>
            {b.description && <p className="text-sm text-charcoal/70">{b.description}</p>}
            <p className="mt-4">{rupees(b.price_paise)}</p>
            {b.in_stock ? <button className="btn mt-4" onClick={() => buy(b.name, { bundle: b.code })}>{session ? "Buy" : "Sign in to buy"}</button> : <p className="mt-2 text-sm text-danger">Out of stock</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
