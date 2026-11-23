"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { Photo } from "@/components/ProductImage";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { mediaError } from "@/lib/media";

/* eslint-disable @typescript-eslint/no-explicit-any */
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

function Media() {
  const { permissions } = useSession();
  const [d, setD] = useState<any>(null); const [reason, setReason] = useState(""); const [msg, setMsg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null); const [alt, setAlt] = useState(""); const [busy, setBusy] = useState(false);
  const [alts, setAlts] = useState<Record<string, string>>({}); const [sel, setSel] = useState<Record<string, string[]>>({});
  const load = useCallback(async () => { const { data } = await supabase.rpc("admin_list_media"); setD(data); }, []);
  useEffect(() => { void load(); }, [load]);
  if (!permissions.includes("media.manage")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  if (!d) return <p className="wrap py-16">Loading…</p>;
  const ok = !!reason.trim();
  const canAssign = permissions.includes("catalog.manage");

  async function upload(e: React.FormEvent) {
    e.preventDefault(); if (!file) return;
    const ext = EXT[file.type];
    if (!ext) return setMsg("Use a JPG, PNG, WebP or AVIF image.");
    if (file.size > 5 * 1024 * 1024) return setMsg("The image must be under 5 MB.");
    setBusy(true); setMsg(null);
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from("product-media").upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) { setBusy(false); return setMsg("Upload failed. Please try again."); }
    const { error } = await supabase.rpc("admin_register_media", { p_path: path, p_alt: alt, p_reason: reason });
    if (error) await supabase.storage.from("product-media").remove([path]);
    setBusy(false); setMsg(error ? mediaError(error.message) : "Image added."); if (!error) { setFile(null); setAlt(""); (document.getElementById("file") as HTMLInputElement).value = ""; void load(); }
  }
  async function remove(m: any) {
    if (!confirm("Delete this image permanently?")) return;
    const { data, error } = await supabase.rpc("admin_delete_media", { p_id: m.id, p_reason: reason });
    if (error) return setMsg(mediaError(error.message));
    await supabase.storage.from("product-media").remove([data as string]); setMsg("Image deleted."); void load();
  }
  const current = (p: any) => sel[p.code] ?? p.paths;
  const toggle = (p: any, path: string) => { const c = current(p); setSel({ ...sel, [p.code]: c.includes(path) ? c.filter((x: string) => x !== path) : [...c, path] }); };

  return (
    <section className="wrap py-12 grid gap-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Media library</h1><Link href="/admin" className="text-sm underline underline-offset-4">Admin home</Link></div>
      <div className="max-w-xl"><label className="label" htmlFor="why">Reason (required, recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      {msg && <p role="status" className="text-sm">{msg}</p>}

      <form onSubmit={upload} className="card grid max-w-xl gap-3">
        <h2 className="text-2xl">Add an image</h2>
        <div><label className="label" htmlFor="file">Image (JPG, PNG, WebP or AVIF, up to 5 MB)</label><input id="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="field" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
        <div><label className="label" htmlFor="alt">Description for screen readers</label><input id="alt" className="field" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Glass bottle on a pale stone ledge" /></div>
        <div><button className="btn" disabled={!ok || !file || busy}>{busy ? "Uploading…" : "Upload"}</button></div>
      </form>

      <div><h2 className="mb-4 text-2xl">Library</h2>
        {(d.media as any[]).length === 0 && <p className="text-charcoal/70">No images yet.</p>}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(d.media as any[]).map((m) => (
          <li key={m.id} className="card grid gap-3">
            <div className="aspect-square overflow-hidden bg-stone/20"><Photo image={{ path: m.path, alt: m.alt }} /></div>
            <label className="label" htmlFor={`a${m.id}`}>Description</label>
            <input id={`a${m.id}`} className="field" value={alts[m.id] ?? m.alt} onChange={(e) => setAlts({ ...alts, [m.id]: e.target.value })} />
            <p className="text-sm text-charcoal/70">{m.used_by.length ? `Used by ${m.used_by.join(", ")}` : "Not used yet"}</p>
            <div className="flex gap-2">
              <button className="btn-ghost" disabled={!ok} onClick={async () => { const { error } = await supabase.rpc("admin_update_media_alt", { p_id: m.id, p_alt: alts[m.id] ?? m.alt, p_reason: reason }); setMsg(error ? mediaError(error.message) : "Description saved."); void load(); }}>Save description</button>
              <button className="btn-ghost" disabled={!ok} onClick={() => remove(m)}>Delete</button>
            </div>
          </li>))}</ul>
      </div>

      {canAssign && <div><h2 className="mb-4 text-2xl">Product images</h2>
        <p className="mb-3 max-w-2xl text-sm text-charcoal/70">Tick the images each product shows. The first one is the main image.</p>
        <ul className="grid gap-4">{(d.products as any[]).map((p) => (
          <li key={p.code} className="card grid gap-3"><p className="font-medium">{p.name} <span className="text-sm text-charcoal/60">{p.code}</span></p>
            {(d.media as any[]).length === 0 ? <p className="text-sm text-charcoal/70">Add images to the library first.</p> :
              <div className="flex flex-wrap gap-3">{(d.media as any[]).map((m) => { const on = current(p).includes(m.path); return (
                <label key={m.id} className={`block h-24 w-24 cursor-pointer overflow-hidden border-2 ${on ? "border-charcoal" : "border-transparent opacity-60"}`}>
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(p, m.path)} /><Photo image={{ path: m.path, alt: m.alt }} /></label>); })}</div>}
            <div><button className="btn-ghost" disabled={!ok || !sel[p.code]} onClick={async () => { const { error } = await supabase.rpc("admin_set_product_images", { p_code: p.code, p_paths: sel[p.code], p_reason: reason }); setMsg(error ? mediaError(error.message) : `Saved images for ${p.code}.`); setSel({ ...sel, [p.code]: undefined as never }); void load(); }}>Save images</button></div>
          </li>))}</ul></div>}
    </section>
  );
}
export default function Page() { return <SignedInOnly><Media /></SignedInOnly>; }
