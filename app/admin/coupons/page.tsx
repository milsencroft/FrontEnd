"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { rupees } from "@/lib/money";
import { toCsv } from "@/lib/orders";

/* eslint-disable @typescript-eslint/no-explicit-any */
const ERR: Record<string, string> = { reason_required: "A reason is required.", invalid_input: "Please check the values.", invalid_code: "Codes use letters, numbers and hyphens (3–30 characters).", duplicate_code: "That code already exists.", forbidden: "You do not have permission for this.", could_not_generate: "Could not generate unique codes. Try a different prefix." };
const download = (name: string, text: string) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = name; a.click(); URL.revokeObjectURL(a.href); };

function Coupons() {
  const { permissions } = useSession();
  const [list, setList] = useState<any[]>([]); const [msg, setMsg] = useState<string | null>(null); const [reason, setReason] = useState("");
  const [f, setF] = useState({ code: "", count: "1", prefix: "", type: "percent", value: "", min: "", max: "", from: "", to: "", launch: false });
  const load = useCallback(async () => { const { data } = await supabase.rpc("admin_list_coupons"); setList((data as any[]) ?? []); }, []);
  useEffect(() => { void load(); }, [load]);
  if (!permissions.includes("coupons.manage")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  const set = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const value = f.type === "flat" ? Math.round(Number(f.value) * 100) : Number(f.value);
    const { data, error } = await supabase.rpc("admin_create_coupons", { p_code: f.code || null, p_count: Number(f.count) || 1, p_prefix: f.prefix || null, p_discount_type: f.type, p_value: value,
      p_min_order_paise: f.min ? Math.round(Number(f.min) * 100) : 0, p_max_uses: f.max ? Number(f.max) : null, p_starts_at: f.from ? new Date(f.from).toISOString() : null, p_ends_at: f.to ? new Date(f.to).toISOString() : null, p_allow_on_launch: f.launch, p_reason: reason });
    if (error) return setMsg(ERR[error.message] ?? "Could not create coupons.");
    const codes = data as string[]; setMsg(`Created ${codes.length} coupon${codes.length > 1 ? "s" : ""}.`); void load();
    if (codes.length > 1) download("coupon-codes.csv", toCsv(codes.map((code) => ({ code }))));
  }
  async function redemptions(code: string) {
    const { data } = await supabase.rpc("admin_coupon_redemptions", { p_code: code });
    const rows = (data as any[]) ?? []; if (rows.length === 0) return setMsg(`${code} has no redemptions yet.`);
    download(`redemptions-${code}.csv`, toCsv(rows.map((r) => ({ ...r, discount_rupees: r.discount_paise / 100 }))));
  }
  return (
    <section className="wrap py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Coupons</h1><Link href="/admin" className="text-sm underline underline-offset-4">Admin home</Link></div>
      <div className="mt-6 max-w-xl"><label className="label" htmlFor="why">Reason (required, recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      {msg && <p role="status" className="mt-4 text-sm">{msg}</p>}
      <form onSubmit={create} className="card mt-8 grid max-w-3xl gap-3">
        <h2 className="text-2xl">Create coupons</h2>
        <p className="text-sm text-charcoal/70">Enter a code for one custom coupon, or leave it empty and set a number to generate random single-use codes.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label className="label" htmlFor="cc">Custom code</label><input id="cc" className="field" value={f.code} onChange={set("code")} /></div>
          <div><label className="label" htmlFor="cn">How many random codes</label><input id="cn" type="number" min={1} max={500} className="field" value={f.count} onChange={set("count")} /></div>
          <div><label className="label" htmlFor="cx">Prefix for random codes</label><input id="cx" className="field" value={f.prefix} onChange={set("prefix")} /></div>
          <div><label className="label" htmlFor="ct">Discount type</label><select id="ct" className="field" value={f.type} onChange={set("type")}><option value="percent">Percent</option><option value="flat">Flat amount (₹)</option></select></div>
          <div><label className="label" htmlFor="cv">{f.type === "percent" ? "Percent off" : "Rupees off"}</label><input id="cv" type="number" min={1} required className="field" value={f.value} onChange={set("value")} /></div>
          <div><label className="label" htmlFor="cm">Minimum order (₹)</label><input id="cm" type="number" min={0} className="field" value={f.min} onChange={set("min")} /></div>
          <div><label className="label" htmlFor="cu">Total uses (blank = unlimited, random = 1)</label><input id="cu" type="number" min={1} className="field" value={f.max} onChange={set("max")} /></div>
          <div><label className="label" htmlFor="cf">Starts</label><input id="cf" type="datetime-local" className="field" value={f.from} onChange={set("from")} /></div>
          <div><label className="label" htmlFor="ce">Expires</label><input id="ce" type="datetime-local" className="field" value={f.to} onChange={set("to")} /></div>
        </div>
        <label className="flex min-h-[44px] items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5" checked={f.launch} onChange={set("launch")} />Allow on launch pre-orders</label>
        <div><button className="btn" disabled={!reason.trim()}>Create</button></div>
      </form>
      <ul className="mt-10 grid gap-3">{list.length === 0 && <li className="text-charcoal/70">No coupons yet.</li>}
        {list.map((c) => (
          <li key={c.code} className="flex flex-wrap items-center justify-between gap-3 border border-stone/60 bg-white p-4">
            <div><p className="font-medium">{c.code} <span className="text-sm text-charcoal/60">{c.is_active ? "Active" : "Disabled"}</span></p>
              <p className="text-sm text-charcoal/70">{c.discount_type === "percent" ? `${c.value}% off` : `${rupees(c.value)} off`}{c.min_order_paise ? ` · min ${rupees(c.min_order_paise)}` : ""} · used {c.redeemed}{c.max_uses ? ` of ${c.max_uses}` : ""}{c.ends_at ? ` · ends ${new Date(c.ends_at).toLocaleDateString("en-IN")}` : ""}</p></div>
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => redemptions(c.code)}>Redemptions CSV</button>
              <button className="btn-ghost" disabled={!reason.trim()} onClick={async () => { const { error } = await supabase.rpc("admin_set_coupon_active", { p_code: c.code, p_active: !c.is_active, p_reason: reason }); setMsg(error ? "Could not update." : "Updated."); void load(); }}>{c.is_active ? "Disable" : "Enable"}</button>
            </div>
          </li>))}</ul>
    </section>
  );
}
export default function Page() { return <SignedInOnly><Coupons /></SignedInOnly>; }
