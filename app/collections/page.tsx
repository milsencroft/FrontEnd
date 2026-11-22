"use client";
import Link from "next/link";
import { useLaunch } from "@/lib/useLaunch";
import { Flacon } from "@/components/Flacon";

/** Collections are grouped by region from the backend's published catalogue. Draft and concept products never appear. */
export default function Collections() {
  const { items } = useLaunch(60000);
  const regions = [...new Set(items.map((i) => i.region_name))];
  return (
    <section className="wrap py-20">
      <h1 className="text-5xl sm:text-7xl">Collections</h1>
      {regions.length === 0 && <p className="mt-8 text-charcoal/70">The first collection is launching soon.</p>}
      <div className="mt-12 grid gap-12">
        {regions.map((r) => (
          <div key={r} className="grid gap-8 border-t border-stone/60 pt-10 md:grid-cols-[1fr_2fr]">
            <h2 className="text-4xl">{r}</h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {items.filter((i) => i.region_name === r).map((i) => (
                <Link key={i.sku} href="/launch" className="block">
                  <Flacon tone={r === "Japan" ? "bronze" : "sage"} label={i.product_name.split(" ")[0]} />
                  <p className="mt-4 font-serif text-2xl">{i.product_name}</p>
                  <p className="text-sm text-charcoal/70">{i.family} · {i.size_ml} ml</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
