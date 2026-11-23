"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { db } from "@/lib/api";
import { useSession } from "@/lib/session";
import { rupees } from "@/lib/money";
import { toCsv } from "@/lib/orders";
import { Modal } from "@/components/Modal";

/* eslint-disable @typescript-eslint/no-explicit-any */
const ERR: Record<string, string> = { reason_required: "A reason is required.", invalid_input: "Please check the values.", invalid_code: "Codes use letters, numbers and hyphens (3–30 characters).", duplicate_code: "That code already exists.", forbidden: "You do not have permission for this.", could_not_generate: "Could not generate unique codes. Try a different prefix." };
const download = (name: string, text: string) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = name; a.click(); URL.revokeObjectURL(a.href); };

function Coupons() {
  const { permissions } = useSession();
  const [list, setList] = useState<any[]>([]); const [msg, setMsg] = useState<string | null>(null); const [reason, setReason] = useState("");
  const [f, setF] = useState({ code: "", count: "1", prefix: "", type: "percent", value: "", min: "", max: "", from: "", to: "", launch: false });
  const load = useCallback(async () => { const { data } = await db.rpc("admin_list_coupons"); setList((data as any[]) ?? []); }, []);
  const [products, setProducts] = useState<{ id: string; code: string; name: string }[]>([]);
  const [tiers, setTiers] = useState<number[]>([]);
  const [editing, setEditing] = useState<string | null>(null); const [adding, setAdding] = useState(false);
  const [rules, setRules] = useState({ per: "", cap: "", products: [] as string[], tiers: [] as number[] });
  useEffect(() => { void load(); void db.rpc("admin_product_names").then(({ data }) => setProducts((data as typeof products) ?? [])); void db.rpc("admin_tier_numbers").then(({ data }) => setTiers(((data as { tier: number }[]) ?? []).map((t) => t.tier))); }, [load]);
  if (!permissions.includes("coupons.manage")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  const set = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const value = f.type === "flat" ? Math.round(Number(f.value) * 100) : Number(f.value);
    const { data, error } = await db.rpc("admin_create_coupons", { p_code: f.code || null, p_count: Number(f.count) || 1, p_prefix: f.prefix || null, p_discount_type: f.type, p_value: value,
      p_min_order_paise: f.min ? Math.round(Number(f.min) * 100) : 0, p_max_uses: f.max ? Number(f.max) : null, p_starts_at: f.from ? new Date(f.from).toISOString() : null, p_ends_at: f.to ? new Date(f.to).toISOString() : null, p_allow_on_launch: f.launch, p_reason: reason });
    if (error) return setMsg(ERR[error.message] ?? "Could not create coupons.");
    const codes = data as string[]; setMsg(`Created ${codes.length} coupon${codes.length > 1 ? "s" : ""}.`); setAdding(false); void load();
    if (codes.length > 1) download("coupon-codes.csv", toCsv(codes.map((code) => ({ code }))));
  }
  function startEdit(c: any) {
    setEditing(c.code); setRules({ per: c.max_per_customer ? String(c.max_per_customer) : "", cap: c.max_discount_paise ? String(c.max_discount_paise / 100) : "", products: c.product_ids ?? [], tiers: c.tiers ?? [] });
  }
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  async function saveRules(code: string) {
    const { error } = await db.rpc("admin_set_coupon_rules", { p_code: code, p_max_per_customer: rules.per ? Number(rules.per) : null, p_max_discount_paise: rules.cap ? Math.round(Number(rules.cap) * 100) : null,
      p_product_ids: rules.products.length ? rules.products : null, p_tiers: rules.tiers.length ? rules.tiers : null, p_reason: reason });
    setMsg(error ? ERR[error.message] ?? "Could not save the rules." : "Rules saved."); if (!error) { setEditing(null); void load(); }
  }
  async function redemptions(code: string) {
    const { data } = await db.rpc("admin_coupon_redemptions", { p_code: code });
    const rows = (data as any[]) ?? []; if (rows.length === 0) return setMsg(`${code} has no redemptions yet.`);
    download(`redemptions-${code}.csv`, toCsv(rows.map((r) => ({ ...r, discount_rupees: r.discount_paise / 100 }))));
  }
  return (
    <section className="wrap py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Coupons</h1><div className="flex items-center gap-4"><button className="btn" onClick={() => { setMsg(null); setAdding(true); }}>Add coupons</button><Link href="/admin" className="text-sm underline underline-offset-4">Admin home</Link></div></div>
      <div className="mt-6 max-w-xl"><label className="label" htmlFor="why">Reason (required, recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      {msg && <p role="status" className="mt-4 text-sm">{msg}</p>}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add coupons">
      <form onSubmit={create} className="grid gap-3">
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
        <div><label className="label" htmlFor="cwhy">Reason (required, recorded in the audit log)</label><input id="cwhy" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        {msg && <p role="alert" className="text-sm">{msg}</p>}
        <div><button className="btn" disabled={!reason.trim()}>Create</button></div>
      </form>
      </Modal>
      <ul className="mt-10 grid gap-3">{list.length === 0 && <li className="text-charcoal/70">No coupons yet.</li>}
        {list.map((c) => (
          <li key={c.code} className="flex flex-wrap items-center justify-between gap-3 surface p-4">
            <div><p className="font-medium">{c.code} <span className="text-sm text-charcoal/70">{c.is_active ? "Active" : "Disabled"}</span></p>
              <p className="text-sm text-charcoal/70">{c.discount_type === "percent" ? `${c.value}% off` : `${rupees(c.value)} off`}{c.min_order_paise ? ` · min ${rupees(c.min_order_paise)}` : ""} · used {c.redeemed}{c.max_uses ? ` of ${c.max_uses}` : ""}{c.ends_at ? ` · ends ${new Date(c.ends_at).toLocaleDateString("en-IN")}` : ""}</p>
              <p className="text-sm text-charcoal/70">{[c.max_per_customer ? `${c.max_per_customer} per customer` : null, c.max_discount_paise ? `discount up to ${rupees(c.max_discount_paise)}` : null, c.product_ids ? `${c.product_ids.length} product${c.product_ids.length > 1 ? "s" : ""} only` : null, c.tiers ? `Society tier ${c.tiers.join(", ")} only` : null].filter(Boolean).join(" · ") || "No extra rules"}</p></div>
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => (editing === c.code ? setEditing(null) : startEdit(c))}>Rules</button>
              <button className="btn-ghost" onClick={() => redemptions(c.code)}>Redemptions CSV</button>
              <button className="btn-ghost" disabled={!reason.trim()} onClick={async () => { const { error } = await db.rpc("admin_set_coupon_active", { p_code: c.code, p_active: !c.is_active, p_reason: reason }); setMsg(error ? "Could not update." : "Updated."); void load(); }}>{c.is_active ? "Disable" : "Enable"}</button>
            </div>
            {editing === c.code && (
              <div className="grid w-full gap-3 border-t border-stone/60 pt-4">
                <p className="text-sm text-charcoal/70">Leave a field empty for no limit. Only one coupon code can be used per order.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="label" htmlFor={`pc${c.code}`}>Uses per customer</label><input id={`pc${c.code}`} type="number" min={1} className="field" value={rules.per} onChange={(e) => setRules({ ...rules, per: e.target.value })} /></div>
                  <div><label className="label" htmlFor={`mc${c.code}`}>Largest discount (₹)</label><input id={`mc${c.code}`} type="number" min={1} className="field" value={rules.cap} onChange={(e) => setRules({ ...rules, cap: e.target.value })} /></div>
                </div>
                <fieldset><legend className="label">Only these products (discount applies to them alone)</legend>
                  <div className="flex flex-wrap gap-x-6">{products.map((p) => <label key={p.id} className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={rules.products.includes(p.id)} onChange={() => setRules({ ...rules, products: toggle(rules.products, p.id) })} />{p.name}</label>)}</div></fieldset>
                <fieldset><legend className="label">Only Society members in these tiers</legend>
                  <div className="flex flex-wrap gap-x-6">{tiers.map((t) => <label key={t} className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={rules.tiers.includes(t)} onChange={() => setRules({ ...rules, tiers: toggle(rules.tiers, t) })} />Tier {t}</label>)}</div></fieldset>
                <div><button className="btn" disabled={!reason.trim()} onClick={() => saveRules(c.code)}>Save rules</button></div>
              </div>)}
          </li>))}</ul>
    </section>
  );
}
export default function Page() { return <SignedInOnly><Coupons /></SignedInOnly>; }
