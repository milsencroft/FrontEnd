"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import type { Courier } from "@/lib/couriers";
import { Modal } from "@/components/Modal";

const ERR: Record<string, string> = { reason_required: "A reason is required.", invalid_input: "Enter a courier name.", invalid_template: "The link must start with https:// and contain {tracking} where the number goes.", forbidden: "You do not have permission for this." };

function Couriers() {
  const { permissions } = useSession();
  const [list, setList] = useState<Courier[]>([]); const [reason, setReason] = useState(""); const [msg, setMsg] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", tpl: "" }); const [open, setOpen] = useState(false);
  const load = useCallback(async () => { const { data } = await supabase.rpc("admin_list_couriers"); setList((data as Courier[]) ?? []); }, []);
  useEffect(() => { void load(); }, [load]);
  if (!permissions.includes("orders.manage")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  const canEdit = permissions.includes("settings.manage");
  async function save(c: Courier) {
    const { error } = await supabase.rpc("admin_save_courier", { p_name: c.name, p_url_template: c.url_template, p_active: c.is_active, p_reason: reason });
    setMsg(error ? ERR[error.message] ?? "Could not save." : "Saved."); if (!error) { setF({ name: "", tpl: "" }); setOpen(false); void load(); }
  }
  return (
    <section className="wrap py-12 grid gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Couriers</h1><div className="flex items-center gap-4">{canEdit && <button className="btn" onClick={() => { setMsg(null); setF({ name: "", tpl: "" }); setOpen(true); }}>Add courier</button>}<Link href="/admin/orders" className="text-sm underline underline-offset-4">Orders</Link></div></div>
      <p className="max-w-2xl text-charcoal/80">Save each courier&apos;s tracking page address once, with <code>{"{tracking}"}</code> where the tracking number goes. When you ship an order, the tracking link fills in by itself. Copy the address from the courier&apos;s own website.</p>
      {canEdit && <div className="max-w-xl"><label className="label" htmlFor="why">Reason (required, recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>}
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <ul className="grid max-w-2xl gap-3">{list.length === 0 && <li className="text-charcoal/70">No couriers yet.</li>}
        {list.map((c) => <li key={c.name} className="card flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">{c.name} {!c.is_active && <span className="text-sm text-charcoal/60">(off)</span>}</p><p className="break-all text-sm text-charcoal/70">{c.url_template ?? "No tracking link saved"}</p></div>
          {canEdit && <div className="flex gap-2"><button className="btn-ghost" onClick={() => { setMsg(null); setF({ name: c.name, tpl: c.url_template ?? "" }); setOpen(true); }}>Edit</button><button className="btn-ghost" disabled={!reason.trim()} onClick={() => save({ ...c, is_active: !c.is_active })}>{c.is_active ? "Turn off" : "Turn on"}</button></div>}</li>)}</ul>
      {canEdit && <Modal open={open} onClose={() => setOpen(false)} title="Add or update a courier"><form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void save({ name: f.name, url_template: f.tpl || null, is_active: true }); }}>
        <div><label className="label" htmlFor="cn">Courier name</label><input id="cn" className="field" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="label" htmlFor="ct">Tracking page address (optional)</label><input id="ct" className="field" placeholder="https://courier.example/track/{tracking}" value={f.tpl} onChange={(e) => setF({ ...f, tpl: e.target.value })} /></div>
        <div><label className="label" htmlFor="cwhy">Reason (required, recorded in the audit log)</label><input id="cwhy" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        {msg && <p role="alert" className="text-sm">{msg}</p>}
        <div><button className="btn" disabled={!reason.trim()}>Save courier</button></div></form></Modal>}
    </section>
  );
}
export default function Page() { return <SignedInOnly><Couriers /></SignedInOnly>; }
