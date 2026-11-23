"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const CANDIDATES = "main :is(h1, h2, h3, .card, article, form, figure, table, ul > li, ol > li, [data-rv])";
const SKIP = ".sticky, dialog, [data-still], header, footer, nav, [role=tablist], .rv-off";

/** Page-wide scroll behaviour: a thin reading-progress line and a calm one-time reveal of content as it arrives. */
export function ScrollEffects() {
  const path = usePathname();
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => { document.documentElement.dataset.area = path.startsWith("/admin") ? "admin" : "site"; }, [path]);

  useEffect(() => {
    let raf = 0;
    const draw = () => { raf = 0; const h = document.documentElement.scrollHeight - innerHeight; if (bar.current) bar.current.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; };
    const on = () => { if (!raf) raf = requestAnimationFrame(draw); };
    draw(); addEventListener("scroll", on, { passive: true }); addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, [path]);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("rv-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    const scan = () => {
      const items = Array.from(document.querySelectorAll<HTMLElement>(CANDIDATES)).filter((el) => !seen.has(el) && !el.closest(SKIP) && !(el.parentElement?.closest(".rv")));
      let n = 0, last: Element | null = null;
      for (const el of items) {
        seen.add(el);
        n = last && last.parentElement === el.parentElement ? n + 1 : 0; last = el;
        el.style.setProperty("--rv-d", `${Math.min(n, 5) * 70}ms`);
        el.classList.add("rv"); io.observe(el);
      }
    };
    let t = 0; const later = () => { if (!t) t = requestAnimationFrame(() => { t = 0; scan(); }); };
    scan();
    const mo = new MutationObserver(later); const main = document.querySelector("main"); if (main) mo.observe(main, { childList: true, subtree: true });
    return () => { mo.disconnect(); io.disconnect(); if (t) cancelAnimationFrame(t); document.querySelectorAll(".rv").forEach((el) => el.classList.remove("rv", "rv-in")); };
  }, [path]);

  return <div ref={bar} className="scroll-progress" aria-hidden />;
}
