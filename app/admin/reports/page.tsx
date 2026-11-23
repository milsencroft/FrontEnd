"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { rupees } from "@/lib/money";
import { toCsv, FULFIL_LABEL, TYPE_LABEL } from "@/lib/orders";
import { fillDays, presetRange, type Preset } from "@/lib/reports";

/* eslint-disable @typescript-eslint/no-explicit-any */
const download = (name: string, rows: Record<string, unknown>[]) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv" })); a.download = name; a.click(); URL.revokeObjectURL(a.href); };

function Bars({ rows }: { rows: { day: string; orders: number; gross_paise: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.gross_paise)); const w = 100 / Math.max(rows.length, 1);
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={`Daily sales, highest day ${rupees(max)}`} className="h-44 w-full text-sage">
      {rows.map((r, i) => <rect key={r.day} x={i * w + w * 0.12} width={w * 0.76} y={38 - (r.gross_paise / max) * 36} height={(r.gross_paise / max) * 36 + 0.0001} fill="currentColor"><title>{`${r.day}: ${rupees(r.gross_paise)}, ${r.orders} orders`}</title></rect>)}
      <line x1="0" x2="100" y1="38" y2="38" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
    </svg>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  if (rows.length === 0) return <p className="text-sm text-charcoal/70">Nothing in this period.</p>;
  return (
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{head.map((h, i) => <th key={h} scope="col" className={`border-b border-stone/60 py-2 pr-4 font-medium ${i > 0 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={`border-b border-stone/30 py-2 pr-4 ${j > 0 ? "text-right" : ""}`}>{c}</td>)}</tr>)}</tbody></table></div>
  );
}

function Reports() {
  const { permissions } = useSession();
  const [range, setRange] = useState(() => presetRange("30")); const [r, setR] = useState<any>(null); const [err, setErr] = useState<string | null>(null);
  const load = useCallback(async () => {
    setErr(null); const { data, error } = await supabase.rpc("admin_report", { p_from: range.from, p_to: range.to });
    if (error) { setR(null); return setErr(error.message === "invalid_range" ? "Choose a start date before the end date, within one year." : "Could not load the report."); } setR(data);
  }, [range]);
  useEffect(() => { void load(); }, [load]);
  if (!permissions.includes("payments.view")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  const s = r?.summary;
  const tile = (k: string, v: string) => <div className="border-t border-stone/60 py-3"><dt className="text-sm text-charcoal/70">{k}</dt><dd className="font-serif text-2xl">{v}</dd></div>;
  return (
    <section className="wrap py-12 grid gap-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Reports</h1><Link href="/admin" className="text-sm underline underline-offset-4">Admin home</Link></div>
      <div className="flex flex-wrap items-end gap-4">
        <div><label className="label" htmlFor="f">From</label><input id="f" type="date" className="field" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></div>
        <div><label className="label" htmlFor="t">To</label><input id="t" type="date" className="field" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></div>
        {([["7", "Last 7 days"], ["30", "Last 30 days"], ["month", "This month"], ["year", "This year"]] as [Preset, string][]).map(([p, l]) => <button key={p} className="btn-ghost" onClick={() => setRange(presetRange(p))}>{l}</button>)}
      </div>
      {err && <p role="alert" className="text-danger">{err}</p>}
      {!r && !err && <p>Loading…</p>}
      {r && <>
        <p className="max-w-2xl text-sm text-charcoal/70">Counts paid orders only, by India date. Refunds are taken off in the period they were made. All amounts include tax.</p>
        <dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {tile("Paid orders", String(s.orders))}{tile("Sales", rupees(s.gross_paise))}{tile("Refunds", rupees(s.refunded_paise))}{tile("Net sales", rupees(s.net_paise))}
          {tile("Average order", rupees(s.aov_paise))}{tile("Customers", String(s.customers))}{tile("Repeat customers", String(s.repeat_customers))}{tile("Discounts given", rupees(s.discount_paise))}
          {tile("Tax collected", rupees(s.tax_paise))}{tile("Shipping charged", rupees(s.shipping_paise))}
        </dl>
        <div><div className="mb-2 flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-2xl">Sales by day</h2>
          <button className="btn-ghost" onClick={() => download("sales-by-day.csv", fillDays(r.daily, range.from, range.to).map((d) => ({ date: d.day, orders: d.orders, sales_rupees: d.gross_paise / 100 })))}>Export CSV</button></div>
          <Bars rows={fillDays(r.daily, range.from, range.to)} /></div>
        <div className="cq"><div className="cq-grid grid grid-cols-1 gap-10">
          <div><h2 className="mb-3 text-2xl">By order type</h2><Table head={["Type", "Orders", "Sales"]} rows={r.by_type.map((x: any) => [TYPE_LABEL[x.type] ?? x.type, x.orders, rupees(x.gross_paise)])} /></div>
          <div><h2 className="mb-3 text-2xl">By launch</h2><Table head={["Launch", "Orders", "Sales"]} rows={r.by_launch.map((x: any) => [`${x.name} (${x.code})`, x.orders, rupees(x.gross_paise)])} /></div>
        </div></div>
        <div><div className="mb-3 flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-2xl">Top products</h2>
          <button className="btn-ghost" onClick={() => download("top-products.csv", r.products.map((p: any) => ({ product: p.name, sku: p.sku, units: p.units, sales_rupees: p.revenue_paise / 100 })))}>Export CSV</button></div>
          <Table head={["Product", "SKU", "Units", "Sales"]} rows={r.products.map((p: any) => [p.name, p.sku, p.units, rupees(p.revenue_paise)])} /></div>
        <div><div className="mb-3 flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-2xl">Coupons used</h2>
          <button className="btn-ghost" onClick={() => download("coupons-used.csv", r.coupons.map((c: any) => ({ code: c.code, orders: c.orders, discount_rupees: c.discount_paise / 100 })))}>Export CSV</button></div>
          <Table head={["Code", "Orders", "Discount given"]} rows={r.coupons.map((c: any) => [c.code, c.orders, rupees(c.discount_paise)])} /></div>
        <div className="cq"><div className="cq-grid grid grid-cols-1 gap-10">
          <div><h2 className="mb-3 text-2xl">Orders right now</h2><p className="mb-2 text-sm text-charcoal/70">Paid orders by status, all time.</p>
            <Table head={["Status", "Orders"]} rows={Object.entries(r.fulfilment).map(([k, v]) => [FULFIL_LABEL[k] ?? k, v as number])} /></div>
          <div><h2 className="mb-3 text-2xl">Launch places</h2><Table head={["Launch", "Status", "Allocated"]} rows={r.launches.map((l: any) => [`${l.name} (${l.code})`, l.status.replace(/_/g, " "), `${l.allocated} / ${l.capacity}`])} /></div>
          <div><h2 className="mb-3 text-2xl">Society</h2><Table head={["Tier", "Active", "Cap"]} rows={r.society.map((t: any) => [`${t.tier}. ${t.name}`, t.active, t.cap])} /></div>
        </div></div>
      </>}
    </section>
  );
}
export default function Page() { return <SignedInOnly><Reports /></SignedInOnly>; }
