"use client";
import { useRef } from "react";

export type Tone = "sage" | "bronze" | "stone";
const LIQUID: Record<Tone, string> = { sage: "fill-sage", bronze: "fill-bronze", stone: "fill-stone" };

/** A quiet glass flacon drawn in SVG. It leans toward the pointer; colours come from design tokens only. */
export function Flacon({ tone, label, interactive = true, className = "" }: { tone: Tone; label: string; interactive?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (!interactive || !ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2, y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    ref.current.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 5}deg)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div className={className} onPointerMove={move} onPointerLeave={leave}>
      <div ref={ref} className="flacon mx-auto w-full max-w-[260px]">
        <svg viewBox="0 0 200 320" role="img" aria-label={`${label}, 50 ml flacon`} className="block h-auto w-full">
          <defs>
            <linearGradient id={`sheen-${tone}`} x1="0" x2="1">
              <stop offset="0" stopColor="rgb(var(--c-white))" stopOpacity="0.55" />
              <stop offset="0.35" stopColor="rgb(var(--c-white))" stopOpacity="0" />
              <stop offset="0.85" stopColor="rgb(var(--c-white))" stopOpacity="0.12" />
            </linearGradient>
            <clipPath id={`glass-${tone}`}><rect x="36" y="118" width="128" height="174" rx="10" /></clipPath>
          </defs>
          <ellipse cx="100" cy="302" rx="70" ry="7" className="fill-charcoal" opacity="0.18" />
          <rect x="82" y="22" width="36" height="58" rx="3" className={tone === "bronze" ? "fill-ivory" : "fill-charcoal"} />
          <rect x="88" y="80" width="24" height="38" className="fill-stone" opacity="0.7" />
          <g clipPath={`url(#glass-${tone})`}>
            <rect x="36" y="118" width="128" height="174" className="fill-white" opacity="0.35" />
            <rect x="36" y="150" width="128" height="142" className={`liquid ${LIQUID[tone]}`} opacity="0.85" />
          </g>
          <rect x="36" y="118" width="128" height="174" rx="10" fill={`url(#sheen-${tone})`} className="stroke-stone" strokeWidth="1.5" />
          <rect x="62" y="190" width="76" height="62" className="fill-ivory" />
          <text x="100" y="216" textAnchor="middle" className="fill-charcoal" style={{ fontFamily: "var(--font-serif)", fontSize: 11 }}>Milsen &amp; Croft</text>
          <line x1="78" y1="224" x2="122" y2="224" className="stroke-bronze" strokeWidth="0.8" />
          <text x="100" y="240" textAnchor="middle" className="fill-charcoal" style={{ fontFamily: "var(--font-sans)", fontSize: 7, letterSpacing: 1.5 }}>{label.toUpperCase()}</text>
        </svg>
      </div>
    </div>
  );
}
