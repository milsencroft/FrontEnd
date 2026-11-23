"use client";
import { Loader } from "@/components/Loader";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { societyError } from "@/lib/society";
import { toCsv } from "@/lib/orders";
import { LAUNCH_LABEL, MEMBERSHIP_LABEL, label } from "@/lib/labels";

/* eslint-disable @typescript-eslint/no-explicit-any */
const download = (name: string, text: string) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = name; a.click(); URL.revokeObjectURL(a.href); };
const date = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-IN") : "not yet");

function Society() {
  const { permissions } = useSession();
  const [o, setO] = useState<any>(null); const [reason, setReason] = useState(""); const [msg, setMsg] = useState<string | null>(null);
  const [q, setQ] = useState(""); const [benefits, setBenefits] = useState<Record<number, string>>({});
  const load = useCallback(async () => { const { data } = await supabase.rpc("admin_society_overview"); setO(data); }, []);
  useEffect(() => { void load(); }, [load]);
  if (!permissions.includes("society.manage")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  if (!o) return <Loader />;
  const ok = !!reason.trim();
  async function run(p: PromiseLike<{ data: any; error: { message: string } | null }>, done: string) {
    const { error } = await p; setMsg(error ? societyError(error.message) : done); void load();
  }
  const members = (o.members as any[]).filter((m) => `${m.name ?? ""} ${m.email ?? ""} ${m.number}`.toLowerCase().includes(q.toLowerCase()));
  const lastLaunch = (o.launches as any[])[0];

  return (
    <section className="wrap py-12 grid gap-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Society</h1><Link href="/admin" className="text-sm underline underline-offset-4">Admin home</Link></div>
      <div className="max-w-xl"><label className="label" htmlFor="why">Reason (required, recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      {msg && <p role="status" className="text-sm">{msg}</p>}

      <div><h2 className="text-2xl mb-4">Tiers</h2>
        <ul className="grid gap-3">{(o.tiers as any[]).map((t) => (
          <li key={t.tier} className="card grid gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-serif text-2xl">{t.tier}. {t.name}</p><p className="text-sm">{t.active} / {t.cap} active · {t.queue} waiting</p></div>
            <label className="label" htmlFor={`b${t.tier}`}>Benefits</label>
            <textarea id={`b${t.tier}`} className="field" rows={2} value={benefits[t.tier] ?? t.benefits} onChange={(e) => setBenefits({ ...benefits, [t.tier]: e.target.value })} />
            <div><button className="btn-ghost" disabled={!ok} onClick={() => run(supabase.rpc("admin_set_tier_benefits", { p_tier: t.tier, p_benefits: benefits[t.tier] ?? t.benefits, p_reason: reason }), "Benefits saved.")}>Save benefits</button></div>
          </li>))}</ul>
        <p className="mt-3 text-sm text-charcoal/70">Tier names and caps are edited under Settings.</p>
        <button className="btn-ghost mt-3" disabled={!ok} onClick={() => run(supabase.rpc("admin_run_society_queues", { p_reason: reason }), "Queues checked.")}>Fill open places from queues</button>
      </div>

      <div><h2 className="text-2xl mb-4">Launch results</h2>
        <p className="mb-3 max-w-2xl text-sm text-charcoal/70">After a launch has closed, process it once. Members who did not take part get a missed launch; two in a row move them down a tier, or end membership at Tier 1. Cancelled or postponed launches never count.</p>
        {(o.launches as any[]).length === 0 && <p className="text-charcoal/70">No finished Society launches yet.</p>}
        <ul className="grid gap-3">{(o.launches as any[]).map((l) => (
          <li key={l.id} className="card flex flex-wrap items-center justify-between gap-3"><p>{l.code}: {l.name} <span className="text-sm text-charcoal/60">({label(LAUNCH_LABEL, l.status)})</span></p>
            {l.processed ? <span className="text-sm">Processed</span> : <button className="btn" disabled={!ok} onClick={() => { if (confirm(`Process results for ${l.code}? This cannot be repeated.`)) void run(supabase.rpc("admin_process_launch_cycle", { p_launch: l.id, p_reason: reason }), `Launch ${l.code} processed.`); }}>Process results</button>}</li>))}</ul>
      </div>

      <div><h2 className="text-2xl mb-4">Waiting lists</h2>
        {(o.waiting as any[]).length === 0 && <p className="text-charcoal/70">Nobody is waiting.</p>}
        <ul className="grid gap-3">{(o.waiting as any[]).map((w) => (
          <li key={`${w.customer_id}-${w.tier}`} className="card flex flex-wrap items-center justify-between gap-3">
            <p>{w.name ?? w.email} <span className="text-sm text-charcoal/60">{w.tier === 1 ? "Tier 1 re-entry list" : `Tier ${w.tier} queue`} since {date(w.since)}</span></p>
            {w.tier === 1 && lastLaunch && <button className="btn-ghost" disabled={!ok} onClick={() => run(supabase.rpc("admin_admit_reentry", { p_customer: w.customer_id, p_launch: lastLaunch.id, p_reason: reason }), "Admitted.")}>Admit to Tier 1</button>}
          </li>))}</ul>
      </div>

      <div><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><h2 className="text-2xl">Members</h2>
        <div className="flex gap-3"><div><label className="label" htmlFor="s">Search</label><input id="s" className="field" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="btn-ghost self-end" onClick={() => download("society-members.csv", toCsv(members.map((m) => ({ number: m.number, tier: m.tier, status: m.status, name: m.name, email: m.email, missed: m.missed, joined: m.joined_at }))))}>Export CSV</button></div></div>
        <ul className="grid gap-3">{members.map((m) => (
          <li key={m.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-medium">{m.number} <span className="text-sm text-charcoal/60">Tier {m.tier} · {label(MEMBERSHIP_LABEL, m.status)}{m.missed ? ` · missed ${m.missed}` : ""}</span></p>
              <p className="text-sm text-charcoal/70">{m.name ?? ""} {m.email}</p><p className="text-sm text-charcoal/70">Card sent: {date(m.card_dispatched_at)} · Package sent: {date(m.package_dispatched_at)}</p></div>
            {m.status === "active" && <div className="flex gap-2">
              <button className="btn-ghost" disabled={!ok || !!m.card_dispatched_at} onClick={() => run(supabase.rpc("admin_society_dispatch", { p_membership: m.id, p_item: "card", p_reason: reason }), "Marked card as sent.")}>Card sent</button>
              <button className="btn-ghost" disabled={!ok || !!m.package_dispatched_at} onClick={() => run(supabase.rpc("admin_society_dispatch", { p_membership: m.id, p_item: "package", p_reason: reason }), "Marked package as sent.")}>Package sent</button></div>}
          </li>))}</ul>
      </div>
    </section>
  );
}
export default function Page() { return <SignedInOnly><Society /></SignedInOnly>; }
