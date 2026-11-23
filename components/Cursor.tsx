"use client";
import { useEffect, useRef } from "react";

/** A soft brass ring that trails the pointer and opens over links and buttons. The normal cursor stays visible. Mouse and trackpad only. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ring.current; if (!el) return;
    let x = -100, y = -100, cx = x, cy = y, raf = 0;
    const loop = () => {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY; el.dataset.on = "1";
      const hot = (e.target as Element | null)?.closest("a, button, summary, [role=button], .btn, .btn-light, .btn-ghost, [data-tilt]");
      el.dataset.hot = hot ? "1" : "0";
      el.dataset.field = (e.target as Element | null)?.closest("input, textarea, select") ? "1" : "0";
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const leave = () => { el.dataset.on = "0"; };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => { document.removeEventListener("pointermove", move); document.documentElement.removeEventListener("pointerleave", leave); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ring} aria-hidden className="cursor-ring" data-on="0" />;
}
