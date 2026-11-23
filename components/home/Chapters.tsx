"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { smooth, useScrollProgress } from "@/lib/useScrollProgress";

const CHAPTERS = [
  { n: "I", title: "It begins with a place.", text: "Mazha is rain on Kerala’s monsoon forest. Seiran is a fresh breeze in early summer, Japan. Each fragrance starts as a place, not a formula." },
  { n: "II", title: "Made in small numbers.", text: "Every launch has one combined pool of 100 places, and one place for each customer. When the pool is allocated, the launch closes." },
  { n: "III", title: "Kept for the Society.", text: "Those who collect with us join the Milsen & Croft Society, with six tiers and numbered memberships." },
];

/** Three scenes that change as you scroll: the line draws itself and the colour moves from forest to ink to noir. */
export function Chapters() {
  const outer = useRef<HTMLElement>(null);
  const path = useRef<SVGPathElement>(null);
  const bgA = useRef<HTMLDivElement>(null), bgB = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const [still, setStill] = useState(false);
  useEffect(() => { setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);

  const onP = useCallback((p: number) => {
    if (path.current) { const len = path.current.getTotalLength(); path.current.style.strokeDasharray = String(len); path.current.style.strokeDashoffset = String(len * (1 - Math.min(1, p * 1.05))); }
    if (bgA.current) bgA.current.style.opacity = String(smooth(0.25, 0.42, p));
    if (bgB.current) bgB.current.style.opacity = String(smooth(0.62, 0.8, p));
    items.current.forEach((el, i) => {
      if (!el) return;
      const a = i / 3, b = (i + 1) / 3;
      const inn = i === 0 ? 1 : smooth(a - 0.06, a + 0.06, p), out = i === 2 ? 1 : 1 - smooth(b - 0.06, b + 0.06, p);
      const o = Math.min(inn, out);
      el.style.opacity = String(o); el.style.transform = `translateY(${(1 - o) * 24}px)`;
    });
  }, []);
  useScrollProgress(outer, onP);

  if (still) {
    return (
      <section aria-label="How we make fragrance" className="dark-surface bg-charcoal/80 py-20 text-ivory">
        <div className="wrap grid gap-12 md:grid-cols-3">{CHAPTERS.map((c) => <div key={c.n}><p className="font-serif text-5xl text-brass">{c.n}</p><h2 className="mt-3 text-3xl">{c.title}</h2><p className="mt-3 text-ivory/85">{c.text}</p></div>)}</div>
      </section>
    );
  }
  return (
    <section ref={outer} aria-label="How we make fragrance" className="dark-surface relative h-[300svh] bg-kerala/80 text-ivory">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={bgA} aria-hidden className="absolute inset-0 bg-japan/80" style={{ opacity: 0 }} />
        <div ref={bgB} aria-hidden className="absolute inset-0 bg-charcoal" style={{ opacity: 0 }} />
        <svg aria-hidden viewBox="0 0 1000 400" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[12%] h-[30%] w-full opacity-70">
          <path ref={path} d="M0 300 C 160 300, 200 120, 340 150 S 560 330, 680 200 S 880 60, 1000 120" fill="none" stroke="rgb(var(--c-bronze))" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="wrap relative grid h-full items-center">
          <div className="relative h-[60svh]">
            {CHAPTERS.map((c, i) => (
              <div key={c.n} ref={(el) => { items.current[i] = el; }} className="absolute inset-0 flex max-w-2xl flex-col justify-center" style={{ opacity: i === 0 ? 1 : 0 }}>
                <p className="font-serif text-7xl text-brass sm:text-9xl">{c.n}</p>
                <h2 className="mt-4 text-4xl sm:text-6xl">{c.title}</h2>
                <p className="mt-5 max-w-lg text-lg text-ivory/85">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
