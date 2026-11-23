"use client";
import { Loader } from "@/components/Loader";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { Photo } from "@/components/ProductImage";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { Modal } from "@/components/Modal";
import { mediaError, mediaUrl } from "@/lib/media";

/* eslint-disable @typescript-eslint/no-explicit-any */
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const VEXT: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm" };

function Media() {
  const { permissions } = useSession();
  const [d, setD] = useState<any>(null); const [reason, setReason] = useState(""); const [msg, setMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<"image" | "video" | "link">("image"); const [poster, setPoster] = useState<File | null>(null); const [link, setLink] = useState(""); const [file, setFile] = useState<File | null>(null); const [alt, setAlt] = useState(""); const [busy, setBusy] = useState(false); const [adding, setAdding] = useState(false);
  const [alts, setAlts] = useState<Record<string, string>>({}); const [sel, setSel] = useState<Record<string, string[]>>({});
  const load = useCallback(async () => { const { data } = await supabase.rpc("admin_list_media"); setD(data); }, []);
  useEffect(() => { void load(); }, [load]);
  if (!permissions.includes("media.manage")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  if (!d) return <Loader />;
  const ok = !!reason.trim();
  const canAssign = permissions.includes("catalog.manage");

  async function upload(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const bucket = supabase.storage.from("product-media");
    if (mode === "link") {
      const { error } = await supabase.rpc("admin_register_embed", { p_url: link, p_alt: alt, p_reason: reason });
      setMsg(error ? mediaError(error.message) : "Link added."); if (!error) { setLink(""); setAlt(""); setAdding(false); void load(); } return;
    }
    if (!file) return;
    const ext = (mode === "image" ? EXT : VEXT)[file.type];
    if (!ext) return setMsg(mode === "image" ? "Use a JPG, PNG, WebP or AVIF image." : "Use an MP4 or WebM video.");
    if (file.size > (mode === "image" ? 5 : 50) * 1024 * 1024) return setMsg(mode === "image" ? "The image must be under 5 MB." : "The video must be under 50 MB. For longer films, add a YouTube or Vimeo link instead.");
    if (poster && !EXT[poster.type]) return setMsg("The poster must be a JPG, PNG, WebP or AVIF image.");
    setBusy(true);
    const id = crypto.randomUUID(); const path = `${mode === "image" ? "products" : "videos"}/${id}.${ext}`;
    const up = await bucket.upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) { setBusy(false); return setMsg("Upload failed. Please try again."); }
    let posterPath: string | null = null;
    if (mode === "video" && poster) {
      posterPath = `posters/${crypto.randomUUID()}.${EXT[poster.type]}`;
      const pu = await bucket.upload(posterPath, poster, { contentType: poster.type, upsert: false });
      if (pu.error) { await bucket.remove([path]); setBusy(false); return setMsg("Poster upload failed. Please try again."); }
    }
    const { error } = mode === "image" ? await supabase.rpc("admin_register_media", { p_path: path, p_alt: alt, p_reason: reason })
      : await supabase.rpc("admin_register_video", { p_path: path, p_poster: posterPath, p_alt: alt, p_reason: reason });
    if (error) await bucket.remove([path, ...(posterPath ? [posterPath] : [])]);
    setBusy(false); setMsg(error ? mediaError(error.message) : "Added.");
    if (!error) { setAdding(false); setFile(null); setPoster(null); setAlt(""); (document.getElementById("file") as HTMLInputElement | null)?.setAttribute("value", ""); void load(); }
  }
  async function remove(m: any) {
    if (!confirm("Delete this image permanently?")) return;
    const { data, error } = await supabase.rpc("admin_delete_media", { p_id: m.id, p_reason: reason });
    if (error) return setMsg(mediaError(error.message));
    await supabase.storage.from("product-media").remove(data as string[]); setMsg("Image deleted."); void load();
  }
  const current = (p: any) => sel[p.code] ?? p.paths;
  const toggle = (p: any, path: string) => { const c = current(p); setSel({ ...sel, [p.code]: c.includes(path) ? c.filter((x: string) => x !== path) : [...c, path] }); };

  return (
    <section className="wrap py-12 grid gap-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Media library</h1><div className="flex items-center gap-4"><button className="btn" onClick={() => { setMsg(null); setAdding(true); }}>Add media</button><Link href="/admin" className="text-sm underline underline-offset-4">Admin home</Link></div></div>
      <div className="max-w-xl"><label className="label" htmlFor="why">Reason (required, recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      {msg && <p role="status" className="text-sm">{msg}</p>}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add media">
      <form onSubmit={upload} className="grid gap-3" key={mode}>
        <fieldset><legend className="label">Type</legend><div className="flex flex-wrap gap-3">{(["image", "video", "link"] as const).map((k) => (
          <label key={k} className={`flex min-h-[44px] cursor-pointer items-center border px-5 ${mode === k ? "border-charcoal bg-charcoal text-ivory" : "border-stone"}`}><input type="radio" name="mode" className="sr-only" checked={mode === k} onChange={() => setMode(k)} />{k === "image" ? "Image" : k === "video" ? "Short video" : "YouTube or Vimeo link"}</label>))}</div></fieldset>
        {mode !== "link" && <div><label className="label" htmlFor="file">{mode === "image" ? "Image (JPG, PNG, WebP or AVIF, up to 5 MB)" : "Video (MP4 or WebM, up to 50 MB; about 15 MB or less loads best)"}</label><input id="file" type="file" accept={mode === "image" ? "image/jpeg,image/png,image/webp,image/avif" : "video/mp4,video/webm"} className="field" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>}
        {mode === "video" && <div><label className="label" htmlFor="poster">Poster image shown before the video plays (optional)</label><input id="poster" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="field" onChange={(e) => setPoster(e.target.files?.[0] ?? null)} /></div>}
        {mode === "link" && <div><label className="label" htmlFor="link">YouTube or Vimeo link</label><input id="link" className="field" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." /></div>}
        <div><label className="label" htmlFor="mwhy">Reason (required, recorded in the audit log)</label><input id="mwhy" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        <div><label className="label" htmlFor="alt">Description for screen readers</label><input id="alt" className="field" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder={mode === "image" ? "Glass bottle on a pale stone ledge" : "Rain falling on a banana leaf"} /></div>
        <div><button className="btn" disabled={!ok || busy || (mode === "link" ? !link : !file)}>{busy ? "Uploading…" : mode === "link" ? "Add link" : "Upload"}</button></div>
        {msg && <p role="alert" className="text-sm">{msg}</p>}
      </form>
      </Modal>

      <div><h2 className="mb-4 text-2xl">Where media appears</h2>
        <ul className="grid max-w-2xl gap-3">{(d.slots as any[]).map((sl) => (
          <li key={sl.slot} className="card grid gap-2"><label className="label" htmlFor={`sl-${sl.slot}`}>{sl.label}</label>
            <select id={`sl-${sl.slot}`} className="field" value={sl.media_id ?? ""} disabled={!ok} onChange={async (e) => { const { error } = await supabase.rpc("admin_set_media_slot", { p_slot: sl.slot, p_media: e.target.value || null, p_reason: reason }); setMsg(error ? mediaError(error.message) : "Placement saved."); void load(); }}>
              <option value="">Nothing (hidden)</option>{(d.media as any[]).map((m) => <option key={m.id} value={m.id}>{m.kind === "image" ? "Image" : m.kind === "video" ? "Video" : "Link"}: {m.alt}</option>)}</select></li>))}</ul>
        {!ok && <p className="mt-2 text-sm text-charcoal/70">Enter a reason above to change placements.</p>}
      </div>

      <div><h2 className="mb-4 text-2xl">Library</h2>
        {(d.media as any[]).length === 0 && <p className="text-charcoal/70">No images yet.</p>}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(d.media as any[]).map((m) => (
          <li key={m.id} className="card grid gap-3">
            <div className="aspect-square overflow-hidden bg-stone/20">{m.kind === "image" ? <Photo image={{ path: m.path, alt: m.alt }} /> : m.kind === "video" ? <video src={mediaUrl(m.path)} poster={m.poster ? mediaUrl(m.poster) : undefined} controls muted preload="metadata" className="h-full w-full object-cover" aria-label={m.alt} /> : <div className="grid h-full place-items-center p-4 text-center text-sm">YouTube or Vimeo link<br />{m.embed}</div>}</div>
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
            {(d.media as any[]).filter((m) => m.kind === "image").length === 0 ? <p className="text-sm text-charcoal/70">Add images to the library first.</p> :
              <div className="flex flex-wrap gap-3">{(d.media as any[]).filter((m) => m.kind === "image").map((m) => { const on = current(p).includes(m.path); return (
                <label key={m.id} className={`block h-24 w-24 cursor-pointer overflow-hidden border-2 ${on ? "border-charcoal" : "border-transparent opacity-60"}`}>
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(p, m.path)} /><Photo image={{ path: m.path, alt: m.alt }} /></label>); })}</div>}
            <div><button className="btn-ghost" disabled={!ok || !sel[p.code]} onClick={async () => { const { error } = await supabase.rpc("admin_set_product_images", { p_code: p.code, p_paths: sel[p.code], p_reason: reason }); setMsg(error ? mediaError(error.message) : `Saved images for ${p.code}.`); setSel({ ...sel, [p.code]: undefined as never }); void load(); }}>Save images</button></div>
          </li>))}</ul></div>}
    </section>
  );
}
export default function Page() { return <SignedInOnly><Media /></SignedInOnly>; }
