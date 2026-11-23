"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { mediaUrl } from "@/lib/media";

interface Slot { kind: "image" | "video" | "embed"; path: string | null; poster: string | null; embed: string | null; alt: string }
type Slots = Record<string, Slot>;
let cache: Promise<Slots> | null = null;
const loadSlots = () => (cache ??= Promise.resolve(supabase.rpc("public_media_slots")).then(({ data }) => (data as Slots) ?? {}).catch((): Slots => ({})));

/* eslint-disable @next/next/no-img-element */
/** Shows the film or image staff placed in this slot. Renders nothing when the slot is empty. */
export function MediaSlot({ slot, className = "" }: { slot: string; className?: string }) {
  const [s, setS] = useState<Slot | null>(null);
  const [still, setStill] = useState(false);
  useEffect(() => {
    void loadSlots().then((all) => setS(all[slot] ?? null));
    try { setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch { /* ignore */ }
  }, [slot]);
  if (!s) return null;
  const frame = `dark-surface relative aspect-video w-full overflow-hidden bg-charcoal ${className}`;
  if (s.kind === "image" && s.path) return <figure className={frame}><img src={mediaUrl(s.path)} alt={s.alt} className="h-full w-full object-cover" loading="lazy" /></figure>;
  if (s.kind === "embed" && s.embed) return <div className={frame}><iframe src={s.embed} title={s.alt} className="absolute inset-0 h-full w-full" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>;
  if (s.kind === "video" && s.path) return (
    <figure className={frame}>
      <video src={mediaUrl(s.path)} poster={s.poster ? mediaUrl(s.poster) : undefined} aria-label={s.alt} className="h-full w-full object-cover"
        muted loop playsInline preload="metadata" autoPlay={!still} controls={still} />
    </figure>
  );
  return null;
}
