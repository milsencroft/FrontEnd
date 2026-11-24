"use client";
import Link from "next/link";
import { CountUp } from "@/components/CountUp";
import { useLaunch } from "@/lib/useLaunch";

/** Live allocation, drawn as a ring. The numbers come from the backend. */
export function LaunchBand() {
  const { state } = useLaunch();
  // Only while pre-orders are running (or paused / fully allocated). Once a launch has ended its fragrances are simply in the shop.
  if (!state || !["preorder_active", "paused", "closed"].includes(state.status)) return null;
  const pct = state.capacity ? Math.min(1, state.allocated / state.capacity) : 0;
  const R = 54, C = 2 * Math.PI * R;
  const full = state.remaining <= 0 && state.held === 0;
  return (
    <section className="dark-surface bg-charcoal/80 text-ivory" aria-label="Launch progress">
      <div className="wrap grid items-center gap-10 py-20 md:grid-cols-[auto_1fr_auto]">
        <svg viewBox="0 0 140 140" className="h-40 w-40" role="img" aria-label={`${state.allocated} of ${state.capacity} allocated`}>
          <circle cx="70" cy="70" r={R} fill="none" className="stroke-ivory" strokeOpacity="0.15" strokeWidth="2" />
          <circle cx="70" cy="70" r={R} fill="none" className="stroke-bronze" strokeWidth="2" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
          <text x="70" y="76" textAnchor="middle" className="fill-ivory" style={{ fontFamily: "var(--font-serif)", fontSize: 30 }}>{state.allocated}</text>
          <text x="70" y="96" textAnchor="middle" className="fill-stone" style={{ fontFamily: "var(--font-sans)", fontSize: 9 }}>of {state.capacity}</text>
        </svg>
        <div>
          <h2 className="text-4xl sm:text-5xl">{state.name}</h2>
          <p className="mt-4 text-ivory/80" aria-live="polite">{full ? "Fully allocated." : <><CountUp value={state.remaining} /> of {state.capacity} places remain.</>}{state.held > 0 && !full ? ` ${state.held} held by people paying now.` : ""}</p>
        </div>
        <Link href="/launch" className="btn-light">{state.status === "preorder_active" && !full ? "Reserve your place" : "View launch"}</Link>
      </div>
    </section>
  );
}
