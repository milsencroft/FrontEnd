"use client";
import { useEffect } from "react";

/**
 * Site-wide pointer and scroll polish, driven by data attributes so pages stay plain markup:
 *  .btn / .btn-light / .btn-ghost  magnetic pull toward the pointer
 *  [data-tilt]                     gentle 3D tilt with a light sheen
 *  [data-parallax="0.2"]           drifts at a fraction of scroll speed
 * Everything is off for reduced motion, and the pointer effects are off on touch screens.
 */
export function Motion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    if (fine) {
      const onMove = (e: PointerEvent) => {
        const t = e.target as Element | null;
        const mag = t?.closest<HTMLElement>(".btn, .btn-light, .btn-ghost");
        if (mag) {
          const r = mag.getBoundingClientRect();
          mag.style.setProperty("--mx", `${((e.clientX - (r.left + r.width / 2)) / r.width) * 10}px`);
          mag.style.setProperty("--my", `${((e.clientY - (r.top + r.height / 2)) / r.height) * 8}px`);
        }
        const tilt = t?.closest<HTMLElement>("[data-tilt]");
        if (tilt) {
          const r = tilt.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          tilt.style.setProperty("--ry", `${(x - 0.5) * 6}deg`); tilt.style.setProperty("--rx", `${(0.5 - y) * 5}deg`);
          tilt.style.setProperty("--sx", `${x * 100}%`); tilt.style.setProperty("--sy", `${y * 100}%`);
        }
      };
      const onLeave = (e: PointerEvent) => {
        const el = (e.target as Element | null)?.closest<HTMLElement>(".btn, .btn-light, .btn-ghost, [data-tilt]");
        if (!el) return;
        for (const v of ["--mx", "--my", "--rx", "--ry"]) el.style.removeProperty(v);
      };
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerout", onLeave, { passive: true });
      cleanups.push(() => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerout", onLeave); });
    }

    let raf = 0;
    const run = () => {
      raf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        el.style.setProperty("--py", `${((r.top + r.height / 2 - vh / 2) * -Number(el.dataset.parallax || 0.15)).toFixed(1)}px`);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(run); };
    window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll);
    run();
    cleanups.push(() => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); });
    return () => cleanups.forEach((f) => f());
  }, []);
  return null;
}
