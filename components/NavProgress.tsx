"use client";
/* eslint-disable @next/next/no-img-element */

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Shows a brass progress line at the top while the next page is on its way, and a soft veil with the logo if it is slow. */
export function NavProgress() {
  const path = usePathname();
  const [phase, setPhase] = useState<"idle" | "line" | "slow">("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => { clear(); setPhase("idle"); }, [path]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      clear();
      timers.current = [setTimeout(() => setPhase("line"), 80), setTimeout(() => setPhase("slow"), 900), setTimeout(() => setPhase("idle"), 12000)];
    };
    document.addEventListener("click", onClick, true);
    return () => { document.removeEventListener("click", onClick, true); clear(); };
  }, []);

  if (phase === "idle") return null;
  return (
    <>
      <div aria-hidden className="nav-line" />
      {phase === "slow" && (
        <div role="status" aria-live="polite" className="nav-veil">
          <img src="/logo.png" alt="" width={64} height={64} className="loader-logo h-16 w-16" />
          <span className="sr-only">Loading page</span>
        </div>
      )}
    </>
  );
}
