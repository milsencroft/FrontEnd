"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase, signInWithGoogle } from "@/lib/supabase";
import { env } from "@/lib/env";
import { useSession } from "@/lib/session";
import { rupees } from "@/lib/money";
import { checkoutLaunch } from "@/lib/api";
import { CheckoutPanel } from "@/components/CheckoutPanel";
import { Flacon } from "@/components/Flacon";
import { MediaSlot } from "@/components/MediaSlot";

interface State { code: string; name: string; status: string; capacity: number; allocated: number; held: number; remaining: number }
interface Item { sku: string; product_name: string; family: string; region_name: string; story: string | null; size_ml: number; launch_price_paise: number; regular_price_paise: number; in_stock: boolean }

export default function LaunchPage() {
  const { session } = useSession();
  const code = env.currentLaunch;
  const [st, setSt] = useState<State | null | undefined>(undefined);
  const [items, setItems] = useState<Item[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [holdUntil, setHoldUntil] = useState<Date | null>(null);
  const [left, setLeft] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [s, c] = await Promise.all([supabase.rpc("public_launch_state", { p_code: code }), supabase.rpc("launch_catalogue", { p_code: code })]);
    setSt(((s.data as State[]) ?? [])[0] ?? null); setItems((c.data as Item[]) ?? []);
  }, [code]);
  useEffect(() => { void load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);
  useEffect(() => {
    if (!holdUntil) return;
    const t = setInterval(() => { const s = Math.max(0, Math.floor((holdUntil.getTime() - Date.now()) / 1000)); setLeft(s); if (s === 0) { setHoldUntil(null); setPick(null); setErr("Your slot hold expired. You can try again if slots remain."); void load(); } }, 1000);
    return () => clearInterval(t);
  }, [holdUntil, load]);

  async function reserve(sku: string) {
    setErr(null); setBusy(true);
    const { data, error } = await supabase.rpc("my_reserve_launch_slot", { p_code: code });
    setBusy(false);
    const r = ((data as { r_result: string; r_expires_at: string }[]) ?? [])[0];
    if (error || !r) return setErr("Could not reserve a slot. Please try again.");
    if (r.r_result === "reserved" && r.r_expires_at) { setPick(sku); const d = new Date(r.r_expires_at); setHoldUntil(d); setLeft(Math.max(0, Math.floor((d.getTime() - Date.now()) / 1000))); void load(); return; }
    const text: Record<string, string> = { full: "Fully Allocated", closed: "Fully Allocated", existing: "You already hold a slot for this launch.", not_found: "This launch is not open." };
    setErr(text[r.r_result] ?? "This launch is not available right now."); void load();
  }

  if (st === undefined) return <p className="wrap py-16">Loading…</p>;
  if (st === null || st.status === "draft") return <section className="wrap py-16"><h1 className="text-4xl">Launch</h1><p className="mt-6 text-charcoal/70">Our first launch opens soon.</p></section>;
  const open = st.status === "preorder_active";
  const full = st.remaining <= 0 && st.held === 0 && st.allocated >= st.capacity;
  const mins = String(Math.floor(left / 60)).padStart(2, "0"), secs = String(left % 60).padStart(2, "0");

  return (
    <section className="wrap py-16 cq">
      <p className="text-sm text-bronze">Pre-order launch</p>
      <h1 className="mt-2 text-5xl sm:text-7xl">{st.name}</h1>
      <MediaSlot slot="launch.hero" className="mt-8" />
      <div className="mt-8 border-y border-stone/60 py-6" aria-live="polite">
        <p className="font-serif text-3xl">{st.allocated} / {st.capacity} allocated, {st.remaining} remaining</p>
        {st.held > 0 && <p className="mt-1 text-sm text-charcoal/70">{st.held} slot{st.held > 1 ? "s are" : " is"} temporarily held by customers mid-payment and may become available.</p>}
        <div className="mt-4 h-2 bg-stone/40" role="progressbar" aria-valuemin={0} aria-valuemax={st.capacity} aria-valuenow={st.allocated}><div className="h-2 bg-sage" style={{ width: `${Math.min(100, (st.allocated / st.capacity) * 100)}%` }} /></div>
      </div>
      {(full || st.status === "closed") && <p className="mt-8 text-2xl font-serif">Fully Allocated</p>}
      {!open && !full && st.status !== "closed" && <p className="mt-8 text-charcoal/70">This launch is currently {st.status.replace(/_/g, " ")}.</p>}
      <MediaSlot slot="launch.story" className="mt-10" />
      {err && <p role="alert" className="mt-6 text-danger">{err}</p>}
      {holdUntil && <p className="mt-6 text-lg" role="timer">Your slot is held for {mins}:{secs}</p>}

      {open && !full && !pick && (
        <div className="cq-grid mt-10 grid grid-cols-1 gap-6">
          {items.map((i) => (
            <article key={i.sku} className="border border-stone/60 bg-white p-6">
              <Flacon tone={i.region_name === "Japan" ? "bronze" : "sage"} label={i.product_name.split(" ")[0]} className="mb-4" />
              <p className="text-sm text-bronze">{i.region_name}</p>
              <h2 className="mt-1 text-3xl">{i.product_name}</h2>
              <p className="text-sm text-charcoal/70">{i.family} · {i.size_ml} ml</p>
              {i.story && <p className="mt-3 text-sm">{i.story}</p>}
              <p className="mt-4 text-xl">{rupees(i.launch_price_paise)} <span className="text-sm text-charcoal/50 line-through">{rupees(i.regular_price_paise)}</span></p>
              <div className="hinge-safe mt-4">
                {!session ? <button className="btn" onClick={() => signInWithGoogle()}>Sign in to reserve</button>
                  : <button className="btn" disabled={busy || !i.in_stock} onClick={() => reserve(i.sku)}>{i.in_stock ? "Reserve my slot" : "Out of stock"}</button>}
              </div>
            </article>
          ))}
        </div>
      )}
      {pick && holdUntil && <div className="mt-10"><CheckoutPanel start={(a) => checkoutLaunch(code, pick, a)} onCancel={() => { setPick(null); setHoldUntil(null); }} /></div>}
    </section>
  );
}
