"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { LAUNCH_LABEL, ROLE_LABEL, errorText, human, label } from "@/lib/labels";
import { rupees } from "@/lib/money";

type Tab = "overview" | "launches" | "orders" | "catalogue" | "coupons" | "media" | "reports" | "notifications" | "newsletter" | "content" | "society" | "settings" | "staff";
const LAUNCH_STATUS = ["draft", "pending_approval", "preorder_active", "paused", "closed", "post_launch_review", "published_in_shop", "completed", "postponed", "cancelled", "archived"];
const ROLES = ["admin", "product_manager", "order_manager", "content_manager", "customer_support"];

const msg = (e: { message: string } | null) => (e ? `Not done. ${errorText(e.message, "Please check the details and try again.")}` : "Done.");

function Admin() {
  const { permissions } = useSession();
  const can = (p: string) => permissions.includes(p);
  const [tab, setTab] = useState<Tab>("overview");
  const [note, setNote] = useState<string | null>(null);
  const tabs: [Tab, string, boolean][] = [["overview", "Overview", can("orders.view")], ["launches", "Launches", can("launches.manage")], ["orders", "Orders", can("orders.view")], ["catalogue", "Catalogue", can("catalog.manage")], ["coupons", "Coupons", can("coupons.manage")], ["media", "Media", can("media.manage")], ["reports", "Reports", can("payments.view")], ["notifications", "Notifications", can("notifications.view")], ["newsletter", "Newsletter", can("newsletter.manage")], ["content", "Content", can("content.manage")], ["society", "Society", can("society.manage")], ["settings", "Settings", can("settings.manage")], ["staff", "Staff", can("staff.manage")]];
  if (permissions.length === 0) return <div className="wrap py-16"><h1 className="text-3xl">No admin access</h1><p className="mt-2">Your Google account is not a staff account.</p></div>;
  return (
    <section className="wrap py-10">
      <h1 className="text-4xl">Admin</h1>
      <div role="tablist" className="mt-6 flex flex-wrap gap-2">
        {tabs.filter((t) => t[2]).map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setNote(null); }} className={tab === k ? "btn" : "btn-ghost"}>{l}</button>)}
      </div>
      {note && <p role="status" className="mt-4 text-sm">{note}</p>}
      <div className="mt-8">
        {tab === "overview" && <Overview />}
        {tab === "launches" && <Launches setNote={setNote} />}
        {tab === "orders" && <div><Link href="/admin/orders" className="btn">Open order management</Link></div>}
        {tab === "catalogue" && <div><Link href="/admin/catalogue" className="btn">Open catalogue management</Link></div>}
        {tab === "coupons" && <div><Link href="/admin/coupons" className="btn">Open coupon management</Link></div>}
        {tab === "media" && <div><Link href="/admin/media" className="btn">Open media library</Link></div>}
        {tab === "reports" && <div><Link href="/admin/reports" className="btn">Open reports</Link></div>}
        {tab === "content" && <div><Link href="/admin/content" className="btn">Open content editor</Link></div>}
        {tab === "newsletter" && <div><Link href="/admin/newsletter" className="btn">Open newsletter list</Link></div>}
        {tab === "notifications" && <div><Link href="/admin/notifications" className="btn">Open notifications</Link></div>}
        {tab === "society" && <div><Link href="/admin/society" className="btn">Open Society management</Link></div>}
        {tab === "settings" && <Settings setNote={setNote} />}
        {tab === "staff" && <Staff setNote={setNote} />}
      </div>
    </section>
  );
}

function Overview() {
  const [s, setS] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { supabase.rpc("admin_summary").then(({ data }) => setS((data as Record<string, unknown>) ?? {})); }, []);
  if (!s) return <p>Loading…</p>;
  const cards: [string, string][] = [["Paid orders", String(s.orders_paid ?? 0)], ["Sales so far", rupees(Number(s.revenue_paise ?? 0))], ["Orders to pack", String(s.to_pack ?? 0)], ["Refunds in progress", String(s.refunds_pending ?? 0)]];
  return <dl className="cq"><div className="cq-grid grid grid-cols-1 gap-4">{cards.map(([k, v]) => <div key={k} className="card"><dt className="label">{k}</dt><dd className="font-serif text-3xl">{v}</dd></div>)}</div></dl>;
}

function Launches({ setNote }: { setNote: (s: string) => void }) {
  const [rows, setRows] = useState<{ id: string; code: string; name: string; status: string; capacity: number }[]>([]);
  const [reason, setReason] = useState("");
  const load = useCallback(() => supabase.from("launches").select("id,code,name,status,capacity").then(({ data }) => setRows(data ?? [])), []);
  useEffect(() => { void load(); }, [load]);
  return (
    <div className="grid gap-4">
      <div><label className="label" htmlFor="r">Reason (required for every change, recorded in the audit log)</label><input id="r" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      {rows.map((l) => (
        <div key={l.id} className="card grid gap-3 sm:grid-cols-[1fr_auto_auto] items-end">
          <div><p className="font-serif text-xl">{l.name} <span className="text-sm">({l.code})</span></p><p className="text-sm">Capacity {l.capacity}</p></div>
          <div><label className="label" htmlFor={`s${l.id}`}>Status</label>
            <select id={`s${l.id}`} className="field" value={l.status} disabled={!reason.trim()} onChange={async (e) => { const { error } = await supabase.rpc("admin_set_launch_status", { p_launch: l.id, p_status: e.target.value, p_reason: reason }); setNote(msg(error)); void load(); }}>
              {LAUNCH_STATUS.map((s) => <option key={s} value={s}>{label(LAUNCH_LABEL, s)}</option>)}</select></div>
          <div><label className="label" htmlFor={`c${l.id}`}>Capacity</label>
            <input id={`c${l.id}`} className="field" type="number" min={1} defaultValue={l.capacity} disabled={!reason.trim()} onBlur={async (e) => { const n = Number(e.target.value); if (n === l.capacity) return; const { error } = await supabase.rpc("admin_set_launch_capacity", { p_launch: l.id, p_capacity: n, p_reason: reason }); setNote(msg(error)); void load(); }} /></div>
        </div>))}
    </div>
  );
}

function Settings({ setNote }: { setNote: (s: string) => void }) {
  const [gst, setGst] = useState<{ enabled: boolean; mode: string; gstin: string | null; default_rate_bps: number; seller_state_code: string } | null>(null);
  const [reason, setReason] = useState("");
  useEffect(() => { supabase.from("store_settings").select("value").eq("key", "gst").maybeSingle().then(({ data }) => setGst(data?.value ?? null)); }, []);
  if (!gst) return <p>Loading…</p>;
  const save = async (v: typeof gst) => { const { error } = await supabase.rpc("admin_update_setting", { p_key: "gst", p_value: v, p_reason: reason }); setNote(msg(error)); if (!error) setGst(v); };
  return (
    <div className="card grid max-w-xl gap-4">
      <h2 className="text-2xl">GST</h2>
      <p className="text-sm text-charcoal/70">Tax is calculated by the server. Confirm rates and GSTIN with your accountant before enabling.</p>
      <div><label className="label" htmlFor="gr">Reason for change</label><input id="gr" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      <label className="flex min-h-[44px] items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={gst.enabled} disabled={!reason.trim()} onChange={(e) => save({ ...gst, enabled: e.target.checked })} />Charge GST on orders</label>
      <div><label className="label" htmlFor="gm">Prices are</label><select id="gm" className="field" value={gst.mode} disabled={!reason.trim()} onChange={(e) => save({ ...gst, mode: e.target.value })}><option value="inclusive">GST-inclusive</option><option value="exclusive">GST added at checkout</option></select></div>
      <div><label className="label" htmlFor="gs">GSTIN</label><input id="gs" className="field" defaultValue={gst.gstin ?? ""} disabled={!reason.trim()} onBlur={(e) => e.target.value !== (gst.gstin ?? "") && save({ ...gst, gstin: e.target.value || null })} /></div>
    </div>
  );
}

function Staff({ setNote }: { setNote: (s: string) => void }) {
  const [rows, setRows] = useState<{ customer_id: string; email: string; full_name: string | null; role: string; is_active: boolean }[]>([]);
  const [email, setEmail] = useState(""); const [role, setRole] = useState(ROLES[0]); const [reason, setReason] = useState("");
  const load = useCallback(() => supabase.rpc("admin_list_staff").then(({ data }) => setRows(data ?? [])), []);
  useEffect(() => { void load(); }, [load]);
  return (
    <div className="grid gap-6">
      <div className="card grid max-w-xl gap-3">
        <h2 className="text-2xl">Grant access</h2>
        <p className="text-sm text-charcoal/70">The person must have signed in with Google once. A Google account alone never gives admin access.</p>
        <input aria-label="Email" className="field" type="email" placeholder="email@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select aria-label="Role" className="field" value={role} onChange={(e) => setRole(e.target.value)}>{ROLES.map((r) => <option key={r} value={r}>{label(ROLE_LABEL, r)}</option>)}</select>
        <input aria-label="Reason" className="field" placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <button className="btn" disabled={!email || !reason} onClick={async () => { const { error } = await supabase.rpc("admin_grant_staff", { p_email: email, p_role: role, p_reason: reason }); setNote(msg(error)); void load(); }}>Grant</button>
      </div>
      <ul className="grid gap-3">{rows.map((s) => (
        <li key={s.customer_id} className="card flex flex-wrap items-center justify-between gap-3"><div><p>{s.full_name ?? s.email}</p><p className="text-sm">{s.email} · {label(ROLE_LABEL, s.role)}{s.is_active ? "" : " (inactive)"}</p></div>
          <button className="btn-ghost" disabled={!reason} onClick={async () => { const { error } = await supabase.rpc("admin_revoke_staff", { p_customer: s.customer_id, p_reason: reason }); setNote(msg(error)); void load(); }}>Revoke</button></li>))}</ul>
    </div>
  );
}

export default function Page() { return <SignedInOnly><Admin /></SignedInOnly>; }
