"use client";
import { Empty } from "@/components/admin/Empty";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { Modal } from "@/components/Modal";
import { db } from "@/lib/api";
import { rupees } from "@/lib/money";
import { useSession } from "@/lib/session";

/* eslint-disable @typescript-eslint/no-explicit-any */
const ERR: Record<string, string> = { reason_required: "Add a reason so the change is recorded.", invalid_input: "Please check the values. Buy and free items together can be at most 5.", forbidden: "You do not have permission for this.", not_found: "That offer no longer exists." };

interface Form { id: string | null; title: string; kind: string; type: "buy_get" | "percent" | "flat"; value: string; buy: string; get: string; scope: "all" | "products" | "regions"; products: string[]; regions: string[]; audience: string; tiers: number[]; from: string; to: string; stack: boolean }
const BLANK: Form = { id: null, title: "", kind: "sale", type: "percent", value: "10", buy: "1", get: "1", scope: "products", products: [], regions: [], audience: "everyone", tiers: [], from: "", to: "", stack: false };
const PRESETS: { label: string; set: Partial<Form> }[] = [
  { label: "Buy 1 Get 1", set: { title: "Buy 1 Get 1 free", kind: "bogo", type: "buy_get", buy: "1", get: "1" } },
  { label: "Buy 2 Get 1", set: { title: "Buy 2 Get 1 free", kind: "bogo", type: "buy_get", buy: "2", get: "1" } },
  { label: "Buy 2 Get 2", set: { title: "Buy 2 Get 2 free", kind: "bogo", type: "buy_get", buy: "2", get: "2" } },
  { label: "Clearance sale", set: { title: "Clearance sale", kind: "clearance", type: "percent", value: "30" } },
  { label: "Festive sale", set: { title: "Festive sale", kind: "festive", type: "percent", value: "15" } },
  { label: "Society members", set: { title: "Society members offer", kind: "member", type: "percent", value: "10", audience: "society_members", scope: "all" } },
  { label: "Welcome offer", set: { title: "Welcome offer", kind: "new_customer", type: "percent", value: "10", audience: "new_customers", scope: "all" } },
];
const AUDIENCE: Record<string, string> = { everyone: "Everyone", new_customers: "New customers (first order)", returning_customers: "Returning customers", society_members: "Society members" };
const toggle = <T,>(a: T[], v: T) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]);
const local = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
const what = (o: any) => (o.type === "buy_get" ? `Buy ${o.buy_qty}, get ${o.get_qty} free` : o.type === "percent" ? `${o.value}% off` : `${rupees(o.value)} off each`);
const where = (o: any) => (o.scope === "all" ? "All fragrances" : o.scope === "products" ? (o.product_names ?? []).join(", ") : `Whole region: ${(o.region_names ?? []).join(", ")}`);
const status = (o: any) => { const n = Date.now(); if (!o.is_active) return "Switched off"; if (o.ends_at && new Date(o.ends_at).getTime() < n) return "Ended"; if (o.starts_at && new Date(o.starts_at).getTime() > n) return "Scheduled"; return "Live"; };

function Offers() {
  const { permissions } = useSession();
  const [list, setList] = useState<any[]>([]); const [choices, setChoices] = useState<any>({ products: [], regions: [], tiers: [] });
  const [f, setF] = useState<Form | null>(null); const [reason, setReason] = useState(""); const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { const { data } = await db.rpc("admin_list_offers"); setList((data as any[]) ?? []); }, []);
  useEffect(() => { void load(); void db.rpc("admin_offer_choices").then(({ data }) => data && setChoices(data)); }, [load]);
  if (!permissions.includes("coupons.manage")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;

  const edit = (o: any) => { setMsg(null); setReason(""); setF({ id: o.id, title: o.title, kind: o.kind, type: o.type, value: o.type === "flat" ? String((o.value ?? 0) / 100) : String(o.value ?? 10), buy: String(o.buy_qty ?? 1), get: String(o.get_qty ?? 1), scope: o.scope, products: o.product_ids ?? [], regions: o.region_ids ?? [], audience: o.audience, tiers: o.tiers ?? [], from: local(o.starts_at), to: local(o.ends_at), stack: o.stack_with_coupons }); };
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!f) return; setBusy(true); setMsg(null);
    const { error } = await db.rpc("admin_save_offer", {
      p_id: f.id, p_title: f.title, p_kind: f.kind, p_type: f.type, p_value: f.type === "buy_get" ? null : f.type === "flat" ? Math.round(Number(f.value) * 100) : Number(f.value),
      p_buy_qty: f.type === "buy_get" ? Number(f.buy) : null, p_get_qty: f.type === "buy_get" ? Number(f.get) : null, p_scope: f.scope,
      p_product_ids: f.scope === "products" ? f.products : null, p_region_ids: f.scope === "regions" ? f.regions : null, p_audience: f.audience,
      p_tiers: f.audience === "society_members" && f.tiers.length ? f.tiers : null, p_starts_at: f.from ? new Date(f.from).toISOString() : null,
      p_ends_at: f.to ? new Date(f.to).toISOString() : null, p_stack: f.stack, p_reason: reason });
    setBusy(false);
    if (error) return setMsg(ERR[error.message] ?? "Could not save the offer.");
    setF(null); setReason(""); setMsg("Offer saved."); void load();
  }
  async function flip(o: any) {
    if (!reason.trim()) return setMsg("Type a reason in the box above the list first.");
    const { error } = await db.rpc("admin_set_offer_active", { p_id: o.id, p_active: !o.is_active, p_reason: reason });
    setMsg(error ? ERR[error.message] ?? "Could not update." : o.is_active ? "Offer switched off." : "Offer switched on."); void load();
  }
  const set = (k: keyof Form) => (e: any) => setF((x) => (x ? { ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value } : x));

  return (
    <section className="wrap py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Offers</h1><div className="flex items-center gap-4"><button className="btn" onClick={() => { setMsg(null); setReason(""); setF({ ...BLANK }); }}>Create offer</button><Link href="/admin" className="text-sm underline underline-offset-4">Admin home</Link></div></div>
      <p className="mt-3 max-w-2xl text-sm text-charcoal/70">Offers apply by themselves at checkout, no code needed. Customers see the saving in their cart. If several offers fit one item, the best one is used. Discount codes live under Coupons.</p>
      <div className="admin-reason"><label className="label" htmlFor="why">Reason for switching an offer on or off (recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      {msg && <p role="status" className="mt-4 text-sm">{msg}</p>}

      <ul className="mt-8 grid gap-3">{list.length === 0 && <li><Empty art="coupons">No offers yet. Create one to get started.</Empty></li>}
        {list.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 surface p-4">
            <div><p className="font-medium">{o.title} <span className="chip" data-tone={status(o) === "Live" ? "good" : undefined}>{status(o)}</span></p>
              <p className="text-sm text-charcoal/80">{what(o)} · {where(o)}</p>
              <p className="text-sm text-charcoal/70">{AUDIENCE[o.audience]}{o.audience === "society_members" && o.tiers ? ` (tier ${o.tiers.join(", ")})` : ""}{o.starts_at ? ` · from ${new Date(o.starts_at).toLocaleDateString("en-IN")}` : ""}{o.ends_at ? ` · until ${new Date(o.ends_at).toLocaleDateString("en-IN")}` : ""} · {o.stack_with_coupons ? "works with coupons" : "not with coupons"} · used on {o.used} order{o.used === 1 ? "" : "s"}</p></div>
            <div className="flex gap-2"><button className="btn-ghost" onClick={() => edit(o)}>Edit</button><button className="btn-ghost" onClick={() => flip(o)}>{o.is_active ? "Switch off" : "Switch on"}</button></div>
          </li>))}</ul>

      <Modal open={f !== null} onClose={() => setF(null)} title={f?.id ? "Edit offer" : "Create offer"}>
        {f && (
          <form onSubmit={save} className="grid gap-4">
            {!f.id && <div><p className="label">Start from</p><div className="flex flex-wrap gap-2">{PRESETS.map((p) => <button key={p.label} type="button" className="btn-ghost" onClick={() => setF({ ...f, ...p.set } as Form)}>{p.label}</button>)}</div></div>}
            <div><label className="label" htmlFor="ot">Offer name (customers see this in the cart)</label><input id="ot" className="field" required minLength={3} maxLength={80} value={f.title} onChange={set("title")} /></div>
            <fieldset className="grid gap-3 sm:grid-cols-3"><legend className="label">What the customer gets</legend>
              <div><label className="label" htmlFor="oy">Type</label><select id="oy" className="field" value={f.type} onChange={set("type")}><option value="buy_get">Buy some, get some free</option><option value="percent">Percent off</option><option value="flat">Rupees off each bottle</option></select></div>
              {f.type === "buy_get" ? <><div><label className="label" htmlFor="ob">Buy</label><input id="ob" type="number" min={1} max={4} className="field" value={f.buy} onChange={set("buy")} /></div><div><label className="label" htmlFor="og">Get free</label><input id="og" type="number" min={1} max={4} className="field" value={f.get} onChange={set("get")} /></div></>
                : <div><label className="label" htmlFor="ov">{f.type === "percent" ? "Percent off" : "Rupees off"}</label><input id="ov" type="number" min={1} max={f.type === "percent" ? 100 : undefined} required className="field" value={f.value} onChange={set("value")} /></div>}
            </fieldset>
            <fieldset><legend className="label">Applies to</legend>
              <div className="flex flex-wrap gap-x-6">{([["products", "Chosen fragrances"], ["regions", "A whole region"], ["all", "All fragrances"]] as const).map(([v, l]) => <label key={v} className="flex min-h-[44px] items-center gap-2 text-sm"><input type="radio" name="sc" className="h-5 w-5" checked={f.scope === v} onChange={() => setF({ ...f, scope: v })} />{l}</label>)}</div>
              {f.scope === "products" && <div className="mt-2"><p className="text-xs text-charcoal/70">Only fragrances that are in stock are listed.</p><div className="flex flex-wrap gap-x-6">{choices.products.length === 0 && <p className="text-sm">No fragrance is in stock right now.</p>}{choices.products.map((p: any) => <label key={p.id} className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={f.products.includes(p.id)} onChange={() => setF({ ...f, products: toggle(f.products, p.id) })} />{p.name} <span className="text-charcoal/60">({p.region}, {p.available} in stock)</span></label>)}</div></div>}
              {f.scope === "regions" && <div className="flex flex-wrap gap-x-6">{choices.regions.map((r: any) => <label key={r.id} className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={f.regions.includes(r.id)} onChange={() => setF({ ...f, regions: toggle(f.regions, r.id) })} />{r.name}</label>)}</div>}
            </fieldset>
            <fieldset><legend className="label">Who gets it</legend>
              <div className="flex flex-wrap gap-x-6">{Object.entries(AUDIENCE).map(([v, l]) => <label key={v} className="flex min-h-[44px] items-center gap-2 text-sm"><input type="radio" name="au" className="h-5 w-5" checked={f.audience === v} onChange={() => setF({ ...f, audience: v })} />{l}</label>)}</div>
              {f.audience === "society_members" && <div className="flex flex-wrap gap-x-6"><p className="w-full text-xs text-charcoal/70">Leave all tiers unticked for every member.</p>{choices.tiers.map((t: number) => <label key={t} className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={f.tiers.includes(t)} onChange={() => setF({ ...f, tiers: toggle(f.tiers, t) })} />Tier {t}</label>)}</div>}
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-2"><div><label className="label" htmlFor="of">Starts (optional)</label><input id="of" type="datetime-local" className="field" value={f.from} onChange={set("from")} /></div><div><label className="label" htmlFor="oe">Ends (optional)</label><input id="oe" type="datetime-local" className="field" value={f.to} onChange={set("to")} /></div></div>
            <label className="flex min-h-[44px] items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5" checked={f.stack} onChange={set("stack")} />Customers can also use a discount code with this offer</label>
            <div><label className="label" htmlFor="orr">Reason (recorded in the audit log)</label><input id="orr" className="field" required value={reason} onChange={(e) => setReason(e.target.value)} /></div>
            {msg && <p role="alert" className="text-sm text-danger">{msg}</p>}
            <div className="flex gap-3"><button className="btn" disabled={busy || !reason.trim()}>{busy ? "Saving…" : "Save offer"}</button><button type="button" className="btn-ghost" onClick={() => setF(null)}>Cancel</button></div>
          </form>)}
      </Modal>
    </section>
  );
}
export default function Page() { return <SignedInOnly><Offers /></SignedInOnly>; }
