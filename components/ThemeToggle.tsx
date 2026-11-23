"use client";
import { useEffect, useState } from "react";

type Mode = "system" | "light" | "dark";
const NEXT: Record<Mode, Mode> = { system: "light", light: "dark", dark: "system" };
const TEXT: Record<Mode, string> = { system: "Theme: match device", light: "Theme: light", dark: "Theme: dark" };

/** Follows the device theme by default; one tap cycles device, light, dark and remembers the choice. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("system");
  useEffect(() => { try { const t = localStorage.getItem("mc_theme"); if (t === "light" || t === "dark") setMode(t); } catch {} }, []);
  const apply = (m: Mode) => {
    setMode(m);
    const root = document.documentElement;
    if (m === "system") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", m);
    try { if (m === "system") localStorage.removeItem("mc_theme"); else localStorage.setItem("mc_theme", m); } catch {}
  };
  return <button type="button" className={className} onClick={() => apply(NEXT[mode])} aria-label={`${TEXT[mode]}. Press to change.`}>{mode === "system" ? "Auto" : mode === "light" ? "Light" : "Dark"}</button>;
}
