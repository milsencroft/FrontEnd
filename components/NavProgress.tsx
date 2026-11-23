"use client";
/* eslint-disable @next/next/no-img-element */

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Shows a brass progress line at the top while the next page is on its way, and a soft veil with the logo if it is slow. */
export function NavProgress() {
  const path = usePathname();
  const [phase, setPhase] = useState<"idle" | "line" | "slow">("idle");
  const [curtain, setCurtain] = useState<"off" | "in" | "out">("off");
  const first = useRef(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => {
    clear(); setPhase("idle");
    if (first.current) { first.current = false; return; }
    setCurtain((c) => (c === "in" ? "out" : "off"));
    const t = setTimeout(() => setCurtain("off"), 700);
    return () => clearTimeout(t);
  }, [path]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      clear();
      timers.current = [setTimeout(() => setPhase("line"), 80), setTimeout(() => setPhase("slow"), 900), setTimeout(() => { setPhase("idle"); setCurtain("off"); }, 12000)];
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setCurtain("in");
    };
    document.addEventListener("click", onClick, true);
    return () => { document.removeEventListener("click", onClick, true); clear(); };
  }, []);

  if (phase === "idle" && curtain === "off") return null;
  return (
    <>
      {curtain !== "off" && <div aria-hidden className={`nav-curtain nav-curtain-${curtain}`}><img src="/logo.png" alt="" width={56} height={56} className="h-14 w-14" /></div>}
      {phase !== "idle" && <div aria-hidden className="nav-line" />}
      {phase === "slow" && curtain === "off" && (
        <div role="status" aria-live="polite" className="nav-veil">
          <img src="/logo.png" alt="" width={64} height={64} className="loader-logo h-16 w-16" />
          <span className="sr-only">Loading page</span>
        </div>
      )}
    </>
  );
}
