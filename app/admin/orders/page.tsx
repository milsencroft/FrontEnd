"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { db } from "@/lib/api";
import { useSession } from "@/lib/session";
import { rupees } from "@/lib/money";
import { FULFIL_LABEL, PAYMENT_LABEL, TYPE_LABEL, toCsv } from "@/lib/orders";

interface Row { id: string; order_number: string; created_at: string; customer_name: string | null; phone: string | null; order_type: string; items: string | null; total_paise: number; payment_status: string; fulfilment_status: string; courier: string | null; tracking_number: string | null; total_count: number }
const PAGE = 25;

function Orders() {
  const { permissions } = useSession();
  const [f, setF] = useState({ q: "", payment: "", fulfilment: "", type: "", from: "", to: "" });
  const [rows, setRows] = useState<Row[]>([]); const [page, setPage] = useState(0); const [err, setErr] = useState<string | null>(null);
  const args = (offset: number, limit: number) => ({ p_q: f.q || null, p_payment: f.payment || null, p_fulfilment: f.fulfilment || null, p_type: f.type || null, p_from: f.from || null, p_to: f.to || null, p_limit: limit, p_offset: offset });
  const load = useCallback(async () => {
    const { data, error } = await db.rpc("admin_search_orders", args(page * PAGE, PAGE));
    if (error) { setErr("Could not load orders."); return; } setErr(null); setRows((data as Row[]) ?? []);
  }, [f, page]); // eslint-disable-line
  useEffect(() => { void load(); }, [load]);
  const total = rows[0]?.total_count ?? 0;

  async function exportCsv() {
    const all: Row[] = [];
    for (let off = 0; off < 2000; off += 200) { const { data } = await db.rpc("admin_search_orders", args(off, 200)); const d = (data as Row[]) ?? []; all.push(...d); if (d.length < 200) break; }
    const csv = toCsv(all.map(({ total_count, ...r }) => ({ ...r, total_rupees: r.total_paise / 100 })));
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "orders.csv"; a.click(); URL.revokeObjectURL(url);
  }
  if (!permissions.includes("orders.view")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setPage(0); setF({ ...f, [k]: e.target.value }); };

  return (
    <section className="wrap py-12 cq">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Orders</h1><Link href="/admin" className="text-sm underline underline-offset-4">Admin home</Link></div>
      <form className="mt-8 flex flex-wrap items-end gap-3" role="search" onSubmit={(e) => e.preventDefault()}>
        <div><label className="label" htmlFor="oq">Search</label><input id="oq" className="field w-64" placeholder="Order ID, name, phone, email, product, tracking" value={f.q} onChange={set("q")} /></div>
        <div><label className="label" htmlFor="op">Payment</label><select id="op" className="field w-auto" value={f.payment} onChange={set("payment")}><option value="">All</option>{Object.entries(PAYMENT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label className="label" htmlFor="of">Status</label><select id="of" className="field w-auto" value={f.fulfilment} onChange={set("fulfilment")}><option value="">All</option>{Object.entries(FULFIL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label className="label" htmlFor="ot">Type</label><select id="ot" className="field w-auto" value={f.type} onChange={set("type")}><option value="">All</option>{Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label className="label" htmlFor="od1">From</label><input id="od1" type="date" className="field w-auto" value={f.from} onChange={set("from")} /></div>
        <div><label className="label" htmlFor="od2">To</label><input id="od2" type="date" className="field w-auto" value={f.to} onChange={set("to")} /></div>
        <button type="button" className="btn-ghost" onClick={exportCsv}>Export CSV</button>
      </form>
      {err && <p role="alert" className="mt-4 text-danger">{err}</p>}
      {!err && rows.length === 0 && <p className="mt-10 text-charcoal/70">No orders match.</p>}
      <p className="mt-6 text-sm text-charcoal/70" aria-live="polite">{total} order{total === 1 ? "" : "s"}</p>
      {/* Wide: table. Narrow or folded: cards. Chosen by the container width, not the device. */}
      <div className="mt-4 hidden orders-table"><table className="w-full text-left text-sm">
        <thead><tr className="border-b border-stone/60 text-charcoal/70">{["Order", "Date", "Customer", "Type", "Items", "Total", "Payment", "Status", "Courier", "Tracking", ""].map((h) => <th key={h} className="py-2 pr-3 font-normal">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id} className="border-b border-stone/30 align-top">
            <td className="py-3 pr-3 font-medium">{r.order_number}</td><td className="pr-3">{new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
            <td className="pr-3">{r.customer_name}<br /><span className="text-charcoal/70">{r.phone}</span></td><td className="pr-3">{TYPE_LABEL[r.order_type]}</td><td className="pr-3 max-w-[14rem]">{r.items}</td>
            <td className="pr-3">{rupees(r.total_paise)}</td><td className="pr-3">{PAYMENT_LABEL[r.payment_status]}</td><td className="pr-3">{FULFIL_LABEL[r.fulfilment_status]}</td>
            <td className="pr-3">{r.courier}</td><td className="pr-3">{r.tracking_number}</td><td><Link className="underline underline-offset-4" href={`/admin/orders/${r.id}`}>View</Link></td>
          </tr>))}</tbody></table></div>
      <ul className="mt-4 grid gap-3 orders-cards">{rows.map((r) => (
        <li key={r.id} className="border border-stone/60 bg-white p-4">
          <div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{r.order_number}</p><p>{rupees(r.total_paise)}</p></div>
          <p className="text-sm">{r.customer_name} · {r.phone}</p><p className="text-sm text-charcoal/70">{TYPE_LABEL[r.order_type]} · {r.items}</p>
          <p className="mt-1 text-sm">{PAYMENT_LABEL[r.payment_status]} · {FULFIL_LABEL[r.fulfilment_status]}</p>
          <Link className="mt-2 inline-flex min-h-[44px] items-center underline underline-offset-4" href={`/admin/orders/${r.id}`}>View order</Link>
        </li>))}</ul>
      <div className="mt-8 flex items-center gap-4">
        <button className="btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
        <span className="text-sm">Page {page + 1} of {Math.max(1, Math.ceil(total / PAGE))}</span>
        <button className="btn-ghost" disabled={(page + 1) * PAGE >= total} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </section>
  );
}
export default function Page() { return <SignedInOnly><Orders /></SignedInOnly>; }
