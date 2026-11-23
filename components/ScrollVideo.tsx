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

/** One fixed film behind the whole page. It plays while you scroll and rests when you stop. */
export function ScrollVideo() {
  const path = usePathname();
  const slot = slotFor(path);
  const [s, setS] = useState<Slot | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const veil = useRef<HTMLDivElement>(null);

  useEffect(() => { setS(null); if (slot) void loadSlots().then((all) => setS(all[slot] ?? null)); }, [slot]);

  useEffect(() => {
    let still = false, idle: ReturnType<typeof setTimeout> | undefined, lastY = scrollY, lastT = performance.now();
    try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* ignore */ }
    const v = video.current;
    const onScroll = () => {
      if (veil.current) veil.current.style.opacity = String(Math.min(0.9, Math.max(0, (scrollY / innerHeight - 0.35) * 0.9)));
      if (!v || still) return;
      // The film plays smoothly while you scroll, faster when you scroll faster, and rests when you stop.
      const now = performance.now(), speed = Math.abs(scrollY - lastY) / Math.max(1, now - lastT);
      lastY = scrollY; lastT = now;
      v.playbackRate = Math.min(2, Math.max(0.6, 0.6 + speed * 0.8));
      if (v.paused) void v.play().catch(() => {});
      clearTimeout(idle); idle = setTimeout(() => v.pause(), 220);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); clearTimeout(idle); };
  }, [s]);

  if (!slot || !s || s.kind === "embed" || !s.path) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-charcoal">
      {s.kind === "image"
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={mediaUrl(s.path)} alt="" className="h-full w-full object-cover" />
        : <video ref={video} key={s.path} src={mediaUrl(s.path)} poster={s.poster ? mediaUrl(s.poster) : undefined} className="h-full w-full object-cover" muted loop playsInline preload="auto" />}
      <div ref={veil} className="absolute inset-0 bg-ivory opacity-0" />
    </div>
  );
}
