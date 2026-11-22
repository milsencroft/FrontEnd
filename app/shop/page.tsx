"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { rupees } from "@/lib/money";

interface Row { product_code: string; product_name: string; family: string; region_name: string; story: string | null; sku: string; size_ml: number; price_paise: number; compare_at_paise: number | null; in_stock: boolean }
interface Bundle { code: string; name: string; description: string | null; price_paise: number; in_stock: boolean }

export default function Shop() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  useEffect(() => {
    supabase.rpc("shop_catalogue").then(({ data }) => setRows((data as Row[]) ?? []));
    supabase.rpc("shop_bundles").then(({ data }) => setBundles((data as Bundle[]) ?? []));
  }, []);
  return (
    <section className="wrap py-16 cq">
      <h1 className="text-4xl sm:text-5xl">Shop</h1>
      {rows === null && <p className="mt-8">Loading…</p>}
      {rows && rows.length === 0 && bundles.length === 0 && <p className="mt-8 text-charcoal/70">Our first fragrances are launching soon. See the <a className="underline" href="/launch">launch page</a>.</p>}
      <div className="cq-grid mt-10 grid grid-cols-1 gap-6">
        {rows?.map((r) => (
          <article key={r.sku} className="card">
            <p className="text-xs uppercase tracking-[0.18em] text-bronze">{r.region_name}</p>
            <h2 className="mt-2 text-2xl">{r.product_name}</h2>
            <p className="text-sm text-charcoal/70">{r.family} · {r.size_ml} ml</p>
            <p className="mt-4">{rupees(r.price_paise)}</p>
            {!r.in_stock && <p className="mt-2 text-sm text-danger">Out of stock</p>}
          </article>
        ))}
        {bundles.map((b) => (
          <article key={b.code} className="card">
            <p className="text-xs uppercase tracking-[0.18em] text-bronze">Set</p>
            <h2 className="mt-2 text-2xl">{b.name}</h2>
            {b.description && <p className="text-sm text-charcoal/70">{b.description}</p>}
            <p className="mt-4">{rupees(b.price_paise)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
