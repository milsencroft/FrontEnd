"use client";
import { Loader } from "@/components/Loader";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { db } from "@/lib/api";
import { useSession } from "@/lib/session";
import { CHANNEL_LABEL, human, label } from "@/lib/labels";

/* eslint-disable @typescript-eslint/no-explicit-any */
const STATUSES = ["pending", "sent", "delivered", "failed", "cancelled"];
const LABEL: Record<string, string> = { pending: "Waiting to send", sent: "Sent", delivered: "Delivered", failed: "Failed", cancelled: "Cancelled" };
const ERR: Record<string, string> = { reason_required: "A reason is required.", not_failed: "Only failed messages can be retried.", not_cancellable: "This message can no longer be cancelled.", forbidden: "You do not have permission for this." };

function Notifications() {
  const { permissions } = useSession();
  const [d, setD] = useState<any>(null); const [status, setStatus] = useState<string>(""); const [reason, setReason] = useState(""); const [msg, setMsg] = useState<string | null>(null);
  const load = useCallback(async () => { const { data } = await db.rpc("admin_outbox_overview", { p_status: status || null, p_limit: 200 }); setD(data); }, [status]);
  useEffect(() => { void load(); }, [load]);
  if (!permissions.includes("notifications.view")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  if (!d) return <Loader />;
  const canManage = permissions.includes("notifications.manage");
  async function act(fn: "admin_outbox_retry" | "admin_outbox_cancel", id: string, done: string) {
    const { error } = await db.rpc(fn, { p_id: id, p_reason: reason }); setMsg(error ? ERR[error.message] ?? "Something went wrong." : done); void load();
  }
  return (
    <section className="wrap py-12 grid gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Notifications</h1><Link href="/admin" className="text-sm underline underline-offset-4">Admin home</Link></div>
      <p className="max-w-2xl text-charcoal/80">Every customer and staff message is queued here first, so a failed message never blocks or duplicates an order. A message only counts as delivered when the provider confirms it.</p>
      <p className="max-w-2xl rounded border border-stone/60 bg-white p-4 text-sm" role="note">Sending is not switched on yet. Email starts once the domain and email provider are connected. Until then, messages wait in the queue.</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        <button className={status === "" ? "btn" : "btn-ghost"} aria-pressed={status === ""} onClick={() => setStatus("")}>All</button>
        {STATUSES.map((s) => <button key={s} className={status === s ? "btn" : "btn-ghost"} aria-pressed={status === s} onClick={() => setStatus(s)}>{LABEL[s]} ({d.counts[s] ?? 0})</button>)}
      </div>
      {canManage && <div className="max-w-xl"><label className="label" htmlFor="why">Reason for retry or cancel (recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>}
      {msg && <p role="status" className="text-sm">{msg}</p>}
      {(d.items as any[]).length === 0 ? <p className="text-charcoal/70">No messages here.</p> : (
        <ul className="grid gap-3">{(d.items as any[]).map((i) => (
          <li key={i.id} className="card flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 text-sm"><p className="font-medium">{human(i.template)} <span className="text-charcoal/70">via {label(CHANNEL_LABEL, i.channel)}</span></p>
              <p className="break-all text-charcoal/70">{i.recipient ?? "Staff"}{i.order_number ? ` · ${i.order_number}` : ""}</p>
              <p className="text-charcoal/70">{LABEL[i.status]} · tried {i.attempts} time{i.attempts === 1 ? "" : "s"} · queued {new Date(i.created_at).toLocaleString("en-IN")}{i.delivered_at ? ` · delivered ${new Date(i.delivered_at).toLocaleString("en-IN")}` : ""}</p>
              {i.last_error && <p className="text-danger">Last error: {i.last_error}</p>}</div>
            {canManage && <div className="flex gap-2">
              {i.status === "failed" && <button className="btn-ghost" disabled={!reason.trim()} onClick={() => act("admin_outbox_retry", i.id, "Queued for another try.")}>Retry</button>}
              {["pending", "failed"].includes(i.status) && <button className="btn-ghost" disabled={!reason.trim()} onClick={() => act("admin_outbox_cancel", i.id, "Cancelled.")}>Cancel</button>}</div>}
          </li>))}</ul>)}
    </section>
  );
}
export default function Page() { return <SignedInOnly><Notifications /></SignedInOnly>; }
