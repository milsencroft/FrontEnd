"use client";
import { Empty } from "@/components/admin/Empty";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { db } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Modal } from "@/components/Modal";
import { PAGE_LABEL, label } from "@/lib/labels";

type Row = { slug: string; kind: string; title: string; summary: string | null; body: string; status: string; updated_at: string };
const ERR: Record<string, string> = { reason_required: "A reason is required.", invalid_input: "Check the address (lowercase letters, numbers, dashes), title and length.", not_found: "Page not found.", forbidden: "You do not have permission for this." };
const empty = { slug: "", kind: "journal", title: "", summary: "", body: "" };

function Editor() {
  const { permissions } = useSession();
  const [list, setList] = useState<Row[]>([]); const [f, setF] = useState(empty); const [reason, setReason] = useState(""); const [msg, setMsg] = useState<string | null>(null); const [open, setOpen] = useState(false);
  const load = useCallback(async () => { const { data } = await db.rpc("admin_list_pages"); setList((data as Row[]) ?? []); }, []);
  useEffect(() => { void load(); }, [load]);
  if (!permissions.includes("content.manage")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await db.rpc("admin_save_page", { p_slug: f.slug, p_kind: f.kind, p_title: f.title, p_summary: f.summary, p_body: f.body, p_reason: reason });
    setMsg(error ? ERR[error.message] ?? "Could not save." : "Saved as a draft until you publish it."); if (!error) { setOpen(false); void load(); }
  }
  async function setStatus(slug: string, status: string) {
    const { error } = await db.rpc("admin_set_page_status", { p_slug: slug, p_status: status, p_reason: reason });
    setMsg(error ? ERR[error.message] ?? "Could not change status." : `Now ${status}.`); if (!error) void load();
  }
  const path = (r: Row) => (r.kind === "journal" ? `/journal/${r.slug}` : `/legal/${r.slug}`);
  return (
    <section className="wrap py-12 grid gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Content</h1><div className="flex items-center gap-4"><button className="btn" onClick={() => { setMsg(null); setF(empty); setOpen(true); }}>Write a page</button><Link href="/admin" className="text-sm underline underline-offset-4">Admin</Link></div></div>
      <p className="max-w-2xl text-charcoal/80">Write journal entries and policy pages here. Only published pages appear on the website. Separate paragraphs with a blank line.</p>
      <div className="admin-reason"><label className="label" htmlFor="why">Reason (required, recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <ul className="grid max-w-3xl gap-3">{list.length === 0 && <li><Empty art="content">No pages yet.</Empty></li>}
        {list.map((r) => <li key={r.slug} className="card flex flex-wrap items-center justify-between gap-3">
          <div><p className="font-medium">{r.title}</p><p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-charcoal/70"><span className="chip" data-tone={r.status === "published" ? "good" : undefined}>{label(PAGE_LABEL, r.status)}</span>{path(r)}</p></div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => { setMsg(null); setF({ slug: r.slug, kind: r.kind, title: r.title, summary: r.summary ?? "", body: r.body }); setOpen(true); }}>Edit</button>
            {r.status !== "published" ? <button className="btn" disabled={!reason.trim()} onClick={() => setStatus(r.slug, "published")}>Publish</button> : <button className="btn-ghost" disabled={!reason.trim()} onClick={() => setStatus(r.slug, "draft")}>Unpublish</button>}
            {r.status !== "archived" && <button className="btn-ghost" disabled={!reason.trim()} onClick={() => setStatus(r.slug, "archived")} aria-label={`Archive ${r.title}`}>Archive</button>}
          </div></li>)}</ul>
      <Modal open={open} onClose={() => setOpen(false)} title="Write or edit a page">
      <form onSubmit={save} className="grid gap-3">
        <div><label className="label" htmlFor="k">Type</label><select id="k" className="field" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}><option value="journal">Journal entry</option><option value="legal">Policy page (privacy, terms, shipping, returns)</option></select></div>
        <div><label className="label" htmlFor="s">Page address (e.g. privacy, shipping, a-morning-in-munnar)</label><input id="s" className="field" required pattern="[a-z0-9\-]{2,60}" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} /></div>
        <div><label className="label" htmlFor="t">Title</label><input id="t" className="field" required maxLength={160} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
        <div><label className="label" htmlFor="su">Short summary (journal list)</label><input id="su" className="field" maxLength={400} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} /></div>
        <div><label className="label" htmlFor="b">Text</label><textarea id="b" className="field min-h-[260px]" maxLength={20000} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></div>
        <div><label className="label" htmlFor="cwhy">Reason (required, recorded in the audit log)</label><input id="cwhy" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        {msg && <p role="alert" className="text-sm">{msg}</p>}
        <div><button className="btn" disabled={!reason.trim()}>Save</button></div>
      </form>
      </Modal>
    </section>
  );
}
export default function Page() { return <SignedInOnly><Editor /></SignedInOnly>; }
