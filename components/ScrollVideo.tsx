"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { mediaUrl } from "@/lib/media";

interface Slot { kind: "image" | "video" | "embed"; path: string | null; poster: string | null; alt: string }
let cache: Promise<Record<string, Slot>> | null = null;
const loadSlots = () => (cache ??= Promise.resolve(supabase.rpc("public_media_slots")).then(({ data }) => (data as Record<string, Slot>) ?? {}).catch((): Record<string, Slot> => ({})));

/** Which film sits behind which page. Every public page gets one. */
function slotFor(path: string): string | null {
  if (path.startsWith("/admin") || path.startsWith("/auth")) return null;
  if (path === "/") return "home.hero";
  if (path.startsWith("/launch")) return "launch.hero";
  if (path.startsWith("/shop") || path.startsWith("/collections")) return "launch.story";
  if (path.startsWith("/philosophy") || path.startsWith("/journal")) return "philosophy.banner";
  return "society.banner";
}

/** One fixed film behind the whole page. Scrolling down plays it forward, scrolling up plays it backward. */
export function ScrollVideo() {
  const path = usePathname();
  const slot = slotFor(path);
  const [s, setS] = useState<Slot | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const veil = useRef<HTMLDivElement>(null);

  useEffect(() => { setS(null); if (slot) void loadSlots().then((all) => setS(all[slot] ?? null)); }, [slot]);

  useEffect(() => {
    let raf = 0, cur = 0, still = false;
    try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* ignore */ }
    const v = video.current;
    const tick = () => {
      if (veil.current) veil.current.style.opacity = String(Math.min(0.9, Math.max(0, (scrollY / innerHeight - 0.35) * 0.9)));
      if (v && !still && v.readyState >= 2 && Number.isFinite(v.duration) && v.duration > 0) {
        // Scrolling down moves the film forward; scrolling up moves it back. The files have a full frame every frame, so seeking is instant.
        const p = Math.min(1, Math.max(0, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
        const target = p * (v.duration - 0.05);
        cur += (target - cur) * 0.22;
        // Never queue a new seek while one is running; queued seeks are what makes phones stutter.
        if (!v.seeking && Math.abs(cur - v.currentTime) > 0.04) v.currentTime = cur;
      }
      raf = requestAnimationFrame(tick);
    };
    if (v) v.pause();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [s]);

  if (!slot || !s || s.kind === "embed" || !s.path) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-charcoal">
      {s.kind === "image"
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={mediaUrl(s.path)} alt="" className="h-full w-full object-cover" />
        : <video ref={video} key={s.path} src={mediaUrl(s.path)} poster={s.poster ? mediaUrl(s.poster) : undefined} className="h-full w-full object-cover [transform:translateZ(0)]" muted playsInline preload="auto" />}
      <div ref={veil} className="absolute inset-0 bg-ivory opacity-0" />
    </div>
  );
}
