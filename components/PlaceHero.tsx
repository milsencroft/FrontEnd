"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Photo } from "./ProductImage";
import { imagesOf } from "@/lib/media";
import { Flacon, type Tone } from "./Flacon";
import { useLaunch } from "@/lib/useLaunch";
import { Split } from "./Split";
import { rupees } from "@/lib/money";

const PLACES = [
  { id: "kerala", tab: "Kerala", name: "Mazha", region: "Kerala", bg: "bg-kerala", tone: "stone" as Tone, line: "Mazha is the Malayalam word for rain." },
  { id: "japan", tab: "Japan", name: "Seiran", region: "Japan", bg: "bg-japan", tone: "bronze" as Tone, line: "Seiran is the Japanese word for a fresh breeze in early summer." },
] as const;

export function PlaceHero() {
  const [i, setI] = useState(0);
  const p = PLACES[i];
  const box = useRef<HTMLElement>(null);
  const { state, items } = useLaunch();
  const item = items.find((x) => x.region_name.toLowerCase() === p.region.toLowerCase());
  const open = state?.status === "preorder_active";

  const light = (e: React.PointerEvent) => {
    const el = box.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`); el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); setI((i + 1) % PLACES.length); }
  };

  return (
    <section ref={box} onPointerMove={light} aria-label="Kerala and Japan" className={`dark-surface relative isolate overflow-hidden text-ivory transition-colors duration-700 ${p.bg}/55`}>
      <div aria-hidden className="absolute inset-0 -z-[1] bg-gradient-to-t from-black/80 via-black/50 to-black/55" />
      <div aria-hidden className="grain" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(520px circle at var(--x, 70%) var(--y, 30%), rgb(var(--c-ivory) / 0.16), transparent 60%)" }} />
      <div className="wrap relative grid min-h-[640px] items-center gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div>
          <Split as="h1" delay={150} className="text-5xl sm:text-6xl lg:text-[5.5rem]" text="A sense of place. A lasting impression." />
          <div role="tablist" aria-label="Choose a place" onKeyDown={onKey} className="hero-in hero-in-2 mt-10 flex gap-8">
            {PLACES.map((x, n) => (
              <button key={x.id} role="tab" aria-selected={n === i} tabIndex={n === i ? 0 : -1} onClick={() => setI(n)}
                className={`min-h-[44px] border-b pb-1 font-serif text-2xl ${n === i ? "border-ivory" : "border-transparent text-ivory/80 hover:text-ivory"}`}>{x.tab}</button>
            ))}
          </div>
          <div key={p.id} role="tabpanel" className="hero-in hero-in-3 mt-6 max-w-md" aria-live="polite">
            <p className="font-serif text-3xl">{item?.product_name ?? `${p.name} Fresh`}</p>
            <p className="mt-2 text-ivory/80">{p.line}</p>
            <p className="mt-4 text-ivory/80">50 ml{item ? ` · ${rupees(item.launch_price_paise)} launch price` : ""}</p>
          </div>
          <div className="hero-in hero-in-3 mt-10 flex flex-wrap gap-4">
            <Link href="/launch" className="btn-light">{open ? "Reserve your place" : "See the launch"}</Link>
            <Link href="/shop" className="inline-flex min-h-[48px] items-center border border-ivory/60 px-8 text-xs font-medium uppercase tracking-[0.2em] hover:bg-ivory hover:text-charcoal">Shop</Link>
          </div>
        </div>
        {imagesOf(item?.images)[0]
          ? <div data-parallax="0.12" className="hero-in hero-in-2 mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden border border-bronze/40 shadow-2xl"><Photo image={imagesOf(item?.images)[0]} /></div>
          : <Flacon tone={p.tone} label={p.name} className="hero-in hero-in-2" />}
      </div>
    </section>
  );
}
