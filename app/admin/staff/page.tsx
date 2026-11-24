"use client";
import { Fold } from "@/components/admin/Fold";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { Loader } from "@/components/Loader";
import { db } from "@/lib/api";
import { ROLE_LABEL, errorText, label } from "@/lib/labels";
const ROLES = ["admin", "product_manager", "order_manager", "content_manager", "customer_support"];
const msg = (e: { message: string } | null) => (e ? `Not done. ${errorText(e.message, "Please check the details and try again.")}` : "Done.");

function Staff() {
  const [note, setNote] = useState<string | null>(null);
  const [rows, setRows] = useState<{ customer_id: string; email: string; full_name: string | null; role: string; is_active: boolean }[]>([]);
  const [email, setEmail] = useState(""); const [role, setRole] = useState(ROLES[0]); const [reason, setReason] = useState(""); const [result, setResult] = useState<string | null>(null);
  const load = useCallback(() => db.rpc("admin_list_staff").then(({ data }) => setRows(data ?? [])), []);
  useEffect(() => { void load(); }, [load]);
  return (
    <div className="grid gap-6">
      <h1 className="text-3xl">Staff</h1>
      {note && <p role="status" className="text-sm">{note}</p>}
      <div className="admin-reason"><label className="label" htmlFor="why">Reason (needed to grant or revoke access, recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      <Fold title="Grant access" hint="Give a teammate access to the admin."><div className="grid max-w-xl gap-3">
        <p className="text-sm text-charcoal/70">The person must have signed in with Google once. A Google account alone never gives admin access.</p>
        <input aria-label="Email" className="field" type="email" placeholder="email@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select aria-label="Role" className="field" value={role} onChange={(e) => setRole(e.target.value)}>{ROLES.map((r) => <option key={r} value={r}>{label(ROLE_LABEL, r)}</option>)}</select>
        <button className="btn" disabled={!email || !reason} onClick={async () => { const { error } = await db.rpc("admin_grant_staff", { p_email: email.trim(), p_role: role, p_reason: reason }); const m = msg(error); setNote(m); setResult(m); if (!error) { setEmail(""); setReason(""); } void load(); }}>Grant</button>
        {(!email || !reason) && <p className="text-sm text-charcoal/70">Fill in the email and the reason above to turn on the Grant button.</p>}
        {result && <p role="status" className="text-sm">{result}</p>}
      </div></Fold>
      <ul className="grid gap-3">{rows.map((s) => (
        <li key={s.customer_id} className="card flex flex-wrap items-center justify-between gap-3"><div><p>{s.full_name ?? s.email}</p><p className="mt-1 flex flex-wrap items-center gap-2 text-sm"><span className="chip" data-tone={s.is_active ? "good" : undefined}>{label(ROLE_LABEL, s.role)}{s.is_active ? "" : " · inactive"}</span>{s.email}</p></div>
          <button className="btn-ghost" disabled={!reason} onClick={async () => { const { error } = await db.rpc("admin_revoke_staff", { p_customer: s.customer_id, p_reason: reason }); setNote(msg(error)); void load(); }}>Revoke</button></li>))}</ul>
    </div>
  );
}


export default function Page() { return <SignedInOnly><Staff /></SignedInOnly>; }
