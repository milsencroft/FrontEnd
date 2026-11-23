"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { SOURCE_LABEL, label } from "@/lib/labels";

type Sub = { id: string; email: string; source: string; consented_at: string; confirmed_at: string | null; unsubscribed_at: string | null };
const ERR: Record<string, string> = { reason_required: "A reason is required.", not_found: "Already unsubscribed.", forbidden: "You do not have permission for this." };

// Guards against spreadsheet formula injection in exported cells.
const csvCell = (v: string) => { const t = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v; return `"${t.replace(/"/g, '""')}"`; };

function List() {
  const { permissions } = useSession();
  const [list, setList] = useState<Sub[]>([]); const [reason, setReason] = useState(""); const [msg, setMsg] = useState<string | null>(null);
  const load = useCallback(async () => { const { data } = await supabase.rpc("admin_newsletter_list"); setList((data as Sub[]) ?? []); }, []);
  useEffect(() => { void load(); }, [load]);
  if (!permissions.includes("newsletter.manage")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  const active = list.filter((s) => !s.unsubscribed_at);
  async function unsub(id: string) {
    const { error } = await supabase.rpc("admin_newsletter_unsubscribe", { p_id: id, p_reason: reason });
    setMsg(error ? ERR[error.message] ?? "Could not unsubscribe." : "Unsubscribed."); if (!error) void load();
  }
  function exportCsv() {
    const rows = [["email", "source", "subscribed_at"], ...active.map((s) => [s.email, s.source, s.consented_at])];
    const blob = new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "newsletter-subscribers.csv"; a.click(); URL.revokeObjectURL(a.href);
  }
  return (
    <section className="wrap py-12 grid gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Newsletter</h1><Link href="/admin" className="text-sm underline underline-offset-4">Admin</Link></div>
      <p className="text-charcoal/80">{active.length} subscribed, {list.length - active.length} unsubscribed.</p>
      <div className="flex flex-wrap items-end gap-4"><div className="max-w-xl flex-1"><label className="label" htmlFor="why">Reason for unsubscribing someone (recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        <button className="btn-ghost" onClick={exportCsv} disabled={active.length === 0}>Download subscribers (CSV)</button></div>
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <ul className="grid gap-3">{list.length === 0 && <li className="text-charcoal/70">No subscribers yet.</li>}
        {list.map((s) => <li key={s.id} className="card flex flex-wrap items-center justify-between gap-3"><div><p className="break-all font-medium">{s.email}</p><p className="text-sm text-charcoal/70">{new Date(s.consented_at).toLocaleDateString("en-IN")} · {label(SOURCE_LABEL, s.source)}{s.unsubscribed_at ? " · unsubscribed" : ""}</p></div>
          {!s.unsubscribed_at && <button className="btn-ghost" disabled={!reason.trim()} onClick={() => unsub(s.id)}>Unsubscribe</button>}</li>)}</ul>
    </section>
  );
}
export default function Page() { return <SignedInOnly><List /></SignedInOnly>; }
