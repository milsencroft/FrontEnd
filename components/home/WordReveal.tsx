"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";

/** A statement whose words darken one by one as you scroll through it. */
export function WordReveal({ text }: { text: string }) {
  const outer = useRef<HTMLElement>(null);
  const words = text.split(" ");
  const [still, setStill] = useState(false);
  useEffect(() => { setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  const onP = useCallback((p: number) => {
    const spans = outer.current?.querySelectorAll<HTMLElement>("[data-w]"); if (!spans) return;
    const f = Math.min(1, p * 1.15) * spans.length;
    spans.forEach((s, i) => { s.style.opacity = String(Math.min(1, Math.max(0.18, f - i + 0.18))); });
  }, []);
  useScrollProgress(outer, onP);
  return (
    <section ref={outer} className={still ? "py-24" : "h-[240svh]"}>
      <div className={still ? "wrap" : "wrap sticky top-0 flex h-[100svh] items-center"}>
        <p className="max-w-4xl font-serif text-4xl leading-[1.15] sm:text-6xl">
          {words.map((w, i) => <span key={i} data-w style={{ opacity: still ? 1 : 0.18 }}>{w}{" "}</span>)}
        </p>
      </div>
    </section>
  );
}
