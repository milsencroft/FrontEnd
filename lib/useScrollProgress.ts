"use client";
import { useEffect, type RefObject } from "react";

/** Calls onProgress(0..1) as the tall element scrolls past, only while it is near the screen. Cheap: one rAF per scroll frame, no React re-render. */
export function useScrollProgress(ref: RefObject<HTMLElement>, onProgress: (p: number) => void) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let near = true, raf = 0;
    const run = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      onProgress(Math.min(1, Math.max(0, -r.top / span)));
    };
    const tick = () => { if (near && !raf) raf = requestAnimationFrame(run); };
    const io = new IntersectionObserver(([e]) => { near = e.isIntersecting; tick(); }, { rootMargin: "200px 0px" });
    io.observe(el); run();
    window.addEventListener("scroll", tick, { passive: true }); window.addEventListener("resize", tick);
    return () => { io.disconnect(); window.removeEventListener("scroll", tick); window.removeEventListener("resize", tick); if (raf) cancelAnimationFrame(raf); };
  }, [ref, onProgress]);
}

export const usePrefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
export const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
