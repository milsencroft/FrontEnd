"use client";
import { Loader } from "@/components/Loader";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { db } from "@/lib/api";
import { useSession } from "@/lib/session";
import { refundOrder } from "@/lib/api";
import { rupees } from "@/lib/money";
import { shipMessage, trackingLink, whatsappLink, type Courier } from "@/lib/couriers";
import { FULFIL_LABEL, NEXT_ACTIONS, PAYMENT_LABEL, TYPE_LABEL, orderError } from "@/lib/orders";
import { HISTORY_KIND_LABEL, REFUND_LABEL, human, label } from "@/lib/labels";

/* eslint-disable @typescript-eslint/no-explicit-any */
function Packing({ id, onError }: { id: string; onError: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const load = useCallback(async () => { const { data } = await db.rpc("admin_order_packing", { p_order: id }); setItems((data as any[]) ?? []); }, [id]);
  useEffect(() => { void load(); }, [load]);
  const done = items.filter((i) => i.checked).length;
  return (
    <div className="card"><h2 className="text-2xl">Packing checklist</h2>
      <p className="text-sm text-charcoal/60">{done} of {items.length} done. All items must be ticked before the order can be marked as packed.</p>
      <ul className="mt-3 text-sm">{items.map((i) => (
        <li key={i.key} className="border-b border-stone/30"><label className="flex min-h-[44px] cursor-pointer items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={i.checked}
          onChange={async (e) => { const { error } = await db.rpc("admin_pack_check", { p_order: id, p_key: i.key, p_checked: e.target.checked }); if (error) onError(orderError(error.message)); void load(); }} />{i.label}</label></li>))}</ul>
    </div>
  );
}

function Detail() {
  const { id } = useParams<{ id: string }>();
  const { permissions } = useSession();
  const can = (p: string) => permissions.includes(p);
  const [couriers, setCouriers] = useState<Courier[]>([]); const [updates, setUpdates] = useState<any[]>([]); const [text, setText] = useState<string | null>(null);
  const [d, setD] = useState<any>(null); const [msg, setMsg] = useState<string | null>(null);
  const [t, setT] = useState({ courier: "", tracking: "", url: "", eta: "", note: "" }); const [note, setNote] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await db.rpc("admin_order_detail", { p_order: id });
    if (error) return setMsg(error.message === "not_found" ? "Order not found." : "Could not load this order."); setD(data);
  }, [id]);
  const loadUpdates = useCallback(async () => { const { data } = await db.rpc("admin_order_updates", { p_order: id }); setUpdates((data as any[]) ?? []); }, [id]);
  useEffect(() => { void load(); void loadUpdates(); void Promise.resolve(db.rpc("admin_list_couriers")).then(({ data }) => setCouriers((data as Courier[]) ?? [])); }, [load, loadUpdates]);
  if (!d) return <Loader />;
  const o = d.order, c = d.customer, a = o.shipping_address ?? {};
  const courierName = t.courier || o.courier; const trackingNo = t.tracking || o.tracking_number;
  const autoUrl = trackingLink(couriers, courierName, trackingNo);
  const shownLink: string | null = t.url || o.tracking_url || autoUrl;
  const message = text ?? shipMessage({ name: c.name, order: o.order_number, courier: o.courier, tracking: o.tracking_number, link: o.tracking_url ?? trackingLink(couriers, o.courier, o.tracking_number), eta: o.estimated_delivery });
  const wa = c.whatsapp_consent ? whatsappLink(c.phone ?? a.phone, message) : null;
  const actions = o.payment_status === "captured" ? NEXT_ACTIONS[o.fulfilment_status] ?? [] : [];

  async function act(to: string) {
    const { error } = await db.rpc("admin_set_fulfilment", { p_order: id, p_status: to, p_courier: t.courier || null, p_tracking: t.tracking || null, p_tracking_url: t.url || autoUrl || null, p_estimated_delivery: t.eta || null, p_note: t.note || null });
    setMsg(error ? orderError(error.message) : "Status updated."); if (!error) setT({ ...t, note: "" }); void load();
  }
  const row = (k: string, v: any) => <div className="flex justify-between gap-4 border-b border-stone/30 py-1.5"><dt className="text-charcoal/60">{k}</dt><dd className="text-right">{v ?? "—"}</dd></div>;

  return (
    <section className="wrap py-12">
      <Link href="/admin/orders" className="text-sm underline underline-offset-4">All orders</Link>
      <h1 className="mt-4 text-4xl sm:text-5xl">{o.order_number}</h1>
      <p className="mt-2">{TYPE_LABEL[o.order_type]}{d.launch ? ` · ${d.launch.name} (${d.launch.code})` : ""} · {PAYMENT_LABEL[o.payment_status]} · {FULFIL_LABEL[o.fulfilment_status]}</p>
      {msg && <p role="status" className="mt-4 text-sm">{msg}</p>}
      <div className="cq mt-10"><div className="cq-grid grid grid-cols-1 gap-8">
        <div className="card"><h2 className="text-2xl">Customer</h2><dl className="mt-3 text-sm">{row("Name", c.name)}{row("Customer ID", c.internal_id)}{row("Google email", c.email)}{row("Phone", c.phone ?? a.phone)}{row("WhatsApp consent", c.whatsapp_consent ? "Yes" : "No")}
          {row("Ship to", [a.name, a.line1, a.line2, a.city, a.pincode].filter(Boolean).join(", "))}</dl></div>
        <div className="card"><h2 className="text-2xl">Items</h2><ul className="mt-3 text-sm">{d.items.map((i: any) => <li key={i.id} className="flex justify-between gap-4 border-b border-stone/30 py-1.5"><span>{i.name_snapshot} <span className="text-charcoal/60">{i.sku_snapshot}</span> × {i.quantity}</span><span>{rupees(i.line_total_paise)}</span></li>)}</ul>
          <dl className="mt-3 text-sm">{row("Subtotal", rupees(o.subtotal_paise))}{row("Discount", rupees(o.discount_paise))}{row("Shipping", rupees(o.shipping_paise))}{row("Tax", rupees(o.tax_paise))}{row("Total", <strong>{rupees(o.total_paise)}</strong>)}</dl></div>
        <div className="card"><h2 className="text-2xl">Payment</h2><dl className="mt-3 text-sm">{row("Status", PAYMENT_LABEL[o.payment_status])}{row("Gateway order", d.payment?.razorpay_order_id)}{row("Transaction", d.payment?.razorpay_payment_id)}{row("Confirmed at", d.payment?.status === "captured" ? new Date(d.payment.updated_at).toLocaleString("en-IN") : null)}{row("Failure", d.payment?.failure_reason)}
          {d.refunds.map((r: any, i: number) => row(`Refund ${i + 1}`, `${rupees(r.amount_paise)} · ${label(REFUND_LABEL, r.status)}`))}</dl>
          {can("payments.refund") && ["captured", "refund_pending"].includes(o.payment_status) && <button className="btn-ghost mt-4" onClick={async () => { const reason = window.prompt("Reason for full refund?"); if (!reason) return; try { await refundOrder(id, reason); setMsg("Refund started."); } catch { setMsg("Refund failed."); } void load(); }}>Refund in full</button>}</div>
      </div></div>

      {can("orders.manage") && (
        <div className="card mt-8 grid gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-2xl">Fulfilment</h2><Link href="/admin/couriers" className="text-sm underline underline-offset-4">Couriers</Link></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><label className="label" htmlFor="co">Courier</label><input id="co" list="courier-list" className="field" placeholder={o.courier ?? ""} value={t.courier} onChange={(e) => setT({ ...t, courier: e.target.value })} /></div>
            <div><label className="label" htmlFor="tn">Tracking number</label><input id="tn" className="field" placeholder={o.tracking_number ?? ""} value={t.tracking} onChange={(e) => setT({ ...t, tracking: e.target.value })} /></div>
            <div><label className="label" htmlFor="tu">Tracking URL</label><input id="tu" className="field" placeholder={autoUrl ?? o.tracking_url ?? "Filled in from the courier, if saved"} value={t.url} onChange={(e) => setT({ ...t, url: e.target.value })} /></div>
            <datalist id="courier-list">{couriers.filter((x) => x.is_active).map((x) => <option key={x.name} value={x.name} />)}</datalist>
            <div><label className="label" htmlFor="te">Estimated delivery</label><input id="te" type="date" className="field" value={t.eta} onChange={(e) => setT({ ...t, eta: e.target.value })} /></div>
          </div>
          <div><label className="label" htmlFor="tr">Reason or note (optional)</label><input id="tr" className="field" value={t.note} onChange={(e) => setT({ ...t, note: e.target.value })} /></div>
          <div className="flex flex-wrap gap-3">
            {actions.map((x) => <button key={x.to} className="btn" onClick={() => act(x.to)}>{x.label}</button>)}
            {o.payment_status !== "captured" && !["cancelled"].includes(o.fulfilment_status) && <button className="btn-ghost" onClick={() => act("cancelled")}>Cancel order</button>}
            {actions.length === 0 && o.payment_status === "captured" && <p className="text-sm text-charcoal/70">No further actions from this status.</p>}
          </div>
          <p className="text-sm text-charcoal/70">Shipped: {o.shipped_at ? new Date(o.shipped_at).toLocaleDateString("en-IN") : "—"} · Courier: {o.courier ?? "—"} · Tracking: {o.tracking_number ?? "—"} · Estimated delivery: {o.estimated_delivery ?? "—"}</p>
        </div>)}

      {can("orders.manage") && o.tracking_number && (
        <div className="card mt-8 grid max-w-3xl gap-3">
          <h2 className="text-2xl">Send tracking update</h2>
          <p className="text-sm text-charcoal/70">Courier: {o.courier ?? "—"} · Tracking: {o.tracking_number}{shownLink ? <> · <a className="underline underline-offset-4" href={shownLink} target="_blank" rel="noopener noreferrer">Open tracking page</a></> : " · No tracking link saved for this courier"}</p>
          <label className="label" htmlFor="msg">Message</label>
          <textarea id="msg" className="field" rows={4} value={message} onChange={(e) => setText(e.target.value)} />
          <div className="flex flex-wrap gap-3">
            {wa ? <a className="btn" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => { void db.rpc("admin_log_order_update", { p_order: id, p_channel: "whatsapp" }).then(loadUpdates); }}>Open WhatsApp with this message</a>
              : <button className="btn" disabled>Open WhatsApp with this message</button>}
            <button className="btn-ghost" onClick={async () => { try { await navigator.clipboard.writeText(message); setMsg("Message copied."); await db.rpc("admin_log_order_update", { p_order: id, p_channel: "copy" }); void loadUpdates(); } catch { setMsg("Could not copy. Select the message and copy it."); } }}>Copy message</button>
          </div>
          {!wa && <p className="text-sm text-charcoal/70">{c.whatsapp_consent ? "This customer has no usable phone number." : "This customer has not agreed to WhatsApp updates. Copy the message and use another channel."}</p>}
          <p className="text-sm text-charcoal/60">Opening WhatsApp only prepares the message. Nothing is marked as delivered.</p>
          {updates.length > 0 && <ul className="text-sm text-charcoal/70">{updates.map((u, i) => <li key={i}>{new Date(u.at).toLocaleString("en-IN")} · {u.channel === "whatsapp" ? "WhatsApp opened" : "Message copied"} · {u.by ?? "Staff"}</li>)}</ul>}
        </div>)}

      {o.payment_status === "captured" && o.fulfilment_status === "processing" && can("orders.manage") && <div className="mt-8 max-w-2xl"><Packing id={id} onError={setMsg} /></div>}

      <div className="cq mt-8"><div className="cq-grid grid grid-cols-1 gap-8">
        <div className="card"><h2 className="text-2xl">Status history</h2><ol className="mt-3 text-sm">{d.history.map((h: any, i: number) => <li key={i} className="border-b border-stone/30 py-1.5">{new Date(h.at).toLocaleString("en-IN")} · {label(HISTORY_KIND_LABEL, h.kind)} · {h.from ? (PAYMENT_LABEL[h.from] ?? FULFIL_LABEL[h.from] ?? human(h.from)) : "—"} → {PAYMENT_LABEL[h.to] ?? FULFIL_LABEL[h.to] ?? human(h.to)}{h.note ? ` · ${h.note}` : ""}</li>)}</ol></div>
        <div className="card"><h2 className="text-2xl">Internal notes</h2><p className="text-sm text-charcoal/60">Never shown to customers.</p>
          <ul className="mt-3 text-sm">{d.notes.map((n: any, i: number) => <li key={i} className="border-b border-stone/30 py-1.5">{n.note}<br /><span className="text-charcoal/60">{n.by ?? "Staff"} · {new Date(n.at).toLocaleString("en-IN")}</span></li>)}</ul>
          {can("orders.manage") && <form className="mt-4 flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!note.trim()) return; const { error } = await db.rpc("admin_add_order_note", { p_order: id, p_note: note }); setMsg(error ? "Could not add the note." : "Note added."); setNote(""); void load(); }}>
            <label className="sr-only" htmlFor="nn">Add a note</label><input id="nn" className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" /><button className="btn">Add</button></form>}</div>
      </div></div>
    </section>
  );
}
export default function Page() { return <SignedInOnly><Detail /></SignedInOnly>; }
