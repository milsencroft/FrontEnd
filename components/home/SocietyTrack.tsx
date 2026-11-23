"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";

const TIERS = [
  ["Origin Circle", "Numbered card, certificate, collector package and Society access."],
  ["Collector Circle", "Updated card and certificate, and selected early access."],
  ["Connoisseur Circle", "Discovery offers, previews and announcements."],
  ["Prestige Circle", "Priority limited releases and selected offers."],
  ["Grand Reserve", "Private previews and exclusive products or experiences."],
  ["Privé Circle", "Store-opening invitations, VIP shopping, private events and selected exclusive products."],
];

/** Scrolling down slides the six Society circles sideways. */
export function SocietyTrack() {
  const outer = useRef<HTMLElement>(null), track = useRef<HTMLUListElement>(null);
  const [still, setStill] = useState(false);
  useEffect(() => { setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  const onP = useCallback((p: number) => {
    const t = track.current; if (!t) return;
    const max = Math.max(0, t.scrollWidth - t.parentElement!.clientWidth);
    t.style.transform = `translateX(${-p * max}px)`;
  }, []);
  useScrollProgress(outer, onP);

  const cards = TIERS.map(([n, d], i) => (
    <li key={n} className="w-[78vw] max-w-sm shrink-0 border border-stone/60 bg-white p-6 sm:w-80">
      <p className="font-serif text-5xl text-bronze">{i + 1}</p>
      <h3 className="mt-6 text-2xl">{n}</h3>
      <p className="mt-3 text-sm text-charcoal/80">{d}</p>
    </li>
  ));
  const head = (
    <div className="wrap">
      <h2 className="max-w-2xl text-4xl sm:text-5xl">The Society</h2>
      <p className="mt-4 max-w-xl text-charcoal/80">Each launch opens a limited number of places. A confirmed pre-order qualifies a new customer for one membership.</p>
      <Link href="/society" className="btn-ghost mt-6">About the Society</Link>
    </div>
  );
  if (still) return <section className="py-24">{head}<ul className="wrap mt-10 grid gap-4 sm:grid-cols-2">{cards}</ul></section>;
  return (
    <section ref={outer} aria-label="The Society" className="relative h-[300svh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center gap-10 overflow-hidden pt-20">
        {head}
        <div className="wrap overflow-visible"><ul ref={track} className="flex w-max gap-5 will-change-transform">{cards}</ul></div>
      </div>
    </section>
  );
}
