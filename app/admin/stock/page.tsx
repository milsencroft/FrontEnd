"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { Loader } from "@/components/Loader";
import { db } from "@/lib/api";
import { useSession } from "@/lib/session";

interface Row { variant_id: string; sku: string; product_name: string; size_ml: number; is_active: boolean; on_hand: number; reserved: number; available: number }
const ERR: Record<string, string> = {
  reason_required: "A reason is required.", invalid_quantity: "Enter a whole number from 0 to 100,000.", below_reserved: "That is fewer than the units currently held by customers who are paying.",
  forbidden: "You do not have permission for this.", not_found: "That item no longer exists.", unauthorized: "Please sign in again.",
};
const state = (r: Row) => (r.available <= 0 ? "Out of stock" : r.available <= 3 ? "Low stock" : "In stock");

function Stock() {
  const { permissions } = useSession();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [reason, setReason] = useState(""); const [msg, setMsg] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, string>>({});
  const load = useCallback(async () => { const { data } = await db.rpc("admin_inventory_list"); setRows((data as Row[]) ?? []); }, []);
  useEffect(() => { void load(); }, [load]);
  if (!permissions.includes("inventory.view")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  if (!rows) return <Loader />;
  const canManage = permissions.includes("inventory.manage");
  const ok = !!reason.trim();

  async function apply(r: Row, mode: "add" | "set") {
    setMsg(null);
    const n = Number(qty[r.sku]);
    if (!Number.isInteger(n) || n < (mode === "add" ? 1 : 0)) return setMsg(ERR.invalid_quantity);
    const { error } = mode === "add"
      ? await db.rpc("admin_adjust_stock", { p_variant: r.variant_id, p_delta: n, p_reason: reason })
      : await db.rpc("admin_set_stock", { p_variant: r.variant_id, p_quantity: n, p_reason: reason });
    if (error) return setMsg(ERR[error.message] ?? "Not done. Please check the details and try again.");
    setMsg(mode === "add" ? `Added ${n} to ${r.sku}.` : `Stock for ${r.sku} set to ${n}.`);
    setQty({ ...qty, [r.sku]: "" }); void load();
  }

  return (
    <section className="wrap grid gap-8 py-12 cq">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Stock</h1><Link href="/admin" className="text-sm underline underline-offset-4">Admin home</Link></div>
      <p className="max-w-2xl text-charcoal/70">Available = on hand minus units held by customers who are paying. The shop shows “Out of stock” when available reaches zero.</p>
      {canManage && <div className="admin-reason"><label className="label" htmlFor="why">Reason (required, recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: new batch received" /></div>}
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <ul className="cq-grid grid grid-cols-1 gap-4">{rows.map((r) => {
        const pct = r.on_hand > 0 ? Math.max(0, Math.min(100, Math.round((r.available / r.on_hand) * 100))) : 0;
        return (
          <li key={r.sku} className="card grid gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><p className="font-serif text-xl">{r.product_name}</p><p className="text-sm text-charcoal/70">{r.size_ml} ml · {r.sku}{r.is_active ? "" : " · inactive"}</p></div>
              <span className="chip" data-tone={r.available <= 0 ? "warn" : "good"}>{state(r)}</span>
            </div>
            <div><div className="admin-meter" role="img" aria-label={`${r.available} of ${r.on_hand} available`}><i style={{ width: `${pct}%` }} /></div>
              <p className="mt-1 text-sm text-charcoal/70">{r.available} available · {r.on_hand} on hand · {r.reserved} held</p></div>
            {canManage && <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor={`q-${r.sku}`}>Quantity for {r.sku}</label>
              <input id={`q-${r.sku}`} inputMode="numeric" placeholder="Qty" className="field w-24" value={qty[r.sku] ?? ""} onChange={(e) => setQty({ ...qty, [r.sku]: e.target.value.replace(/\D/g, "") })} />
              <button className="btn" disabled={!ok || !qty[r.sku]} onClick={() => apply(r, "add")}>Add</button>
              <button className="btn-ghost" disabled={!ok || !qty[r.sku]} onClick={() => apply(r, "set")}>Set to</button>
            </div>}
          </li>);
      })}</ul>
    </section>
  );
}
export default function Page() { return <SignedInOnly><Stock /></SignedInOnly>; }
