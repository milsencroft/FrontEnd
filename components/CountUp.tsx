"use client";
import { useEffect, useRef, useState } from "react";

/** A number that counts up once when it scrolls into view. Shows the real value straight away for reduced motion. */
export function CountUp({ value, className = "" }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(value); return; }
    if (done.current) { setN(value); return; }
    setN(0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect(); done.current = true;
      const t0 = performance.now(), dur = 1400;
      const step = (t: number) => { const k = Math.min(1, (t - t0) / dur); setN(Math.round(value * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return <span ref={ref} className={className} aria-label={String(value)}>{n}</span>;
}
