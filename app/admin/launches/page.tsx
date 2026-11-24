"use client";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { Loader } from "@/components/Loader";
import { db } from "@/lib/api";
import { LAUNCH_LABEL, errorText, label } from "@/lib/labels";
const LAUNCH_STATUS = ["draft", "pending_approval", "preorder_active", "paused", "closed", "post_launch_review", "published_in_shop", "completed", "postponed", "cancelled", "archived"];
const msg = (e: { message: string } | null) => (e ? `Not done. ${errorText(e.message, "Please check the details and try again.")}` : "Done.");

function Launches() {
  const [note, setNote] = useState<string | null>(null);
  const [rows, setRows] = useState<{ id: string; code: string; name: string; status: string; capacity: number }[]>([]);
  const [reason, setReason] = useState("");
  const load = useCallback(() => db.rpc("admin_launch_list").then(({ data }) => setRows(data ?? [])), []);
  useEffect(() => { void load(); }, [load]);
  return (
    <div className="grid gap-4">
      <h1 className="text-3xl">Launches</h1>
      {note && <p role="status" className="text-sm">{note}</p>}
      <div className="admin-reason"><label className="label" htmlFor="r">Reason (required for every change, recorded in the audit log)</label><input id="r" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      {rows.map((l) => (
        <div key={l.id} className="card grid gap-3 sm:grid-cols-[1fr_auto_auto] items-end">
          <div><p className="font-serif text-xl">{l.name} <span className="text-sm">({l.code})</span></p><p className="text-sm">Capacity {l.capacity}</p></div>
          <div><label className="label" htmlFor={`s${l.id}`}>Status</label>
            <select id={`s${l.id}`} className="field" value={l.status} disabled={!reason.trim()} onChange={async (e) => { const { error } = await db.rpc("admin_set_launch_status", { p_launch: l.id, p_status: e.target.value, p_reason: reason }); setNote(msg(error)); void load(); }}>
              {LAUNCH_STATUS.map((s) => <option key={s} value={s}>{label(LAUNCH_LABEL, s)}</option>)}</select></div>
          <div><label className="label" htmlFor={`c${l.id}`}>Capacity</label>
            <input id={`c${l.id}`} className="field" type="number" min={1} defaultValue={l.capacity} disabled={!reason.trim()} onBlur={async (e) => { const n = Number(e.target.value); if (n === l.capacity) return; const { error } = await db.rpc("admin_set_launch_capacity", { p_launch: l.id, p_capacity: n, p_reason: reason }); setNote(msg(error)); void load(); }} /></div>
        </div>))}
    </div>
  );
}


export default function Page() { return <SignedInOnly><Launches /></SignedInOnly>; }
