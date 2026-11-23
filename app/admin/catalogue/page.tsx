"use client";
import { Loader } from "@/components/Loader";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { db } from "@/lib/api";
import { useSession } from "@/lib/session";
import { rupees } from "@/lib/money";
import { PAGE_LABEL, PRODUCT_LABEL, label } from "@/lib/labels";
import { Modal } from "@/components/Modal";

/* eslint-disable @typescript-eslint/no-explicit-any */
const REGION_STATUS = ["draft", "published", "archived"];
const PRODUCT_STATUS = ["concept", "draft", "approved", "published", "archived"];
const ERR: Record<string, string> = { reason_required: "A reason is required.", invalid_code: "Use the code format shown.", invalid_input: "Please check the fields.", duplicate_code: "That code already exists.", region_not_found: "Region not found.", launch_locked: "Only draft launches can be edited.", sku_not_found: "Unknown SKU.", invalid_price: "Enter a price above zero.", forbidden: "You do not have permission for this." };
const say = (e: { message: string } | null) => (e ? ERR[e.message] ?? "Could not save." : "Saved.");

function Catalogue() {
  const { permissions } = useSession();
  const [cat, setCat] = useState<any>(null); const [msg, setMsg] = useState<string | null>(null); const [reason, setReason] = useState("");
  const load = useCallback(async () => { const { data } = await db.rpc("admin_catalogue"); setCat(data); }, []);
  useEffect(() => { void load(); }, [load]);
  const [r, setR] = useState({ code: "", name: "", country: "", description: "", story: "" });
  const [p, setP] = useState({ code: "", name: "", region: "", family: "", story: "", notes: "" });
  const [l, setL] = useState({ code: "", name: "", regions: "", story: "" });
  const [lv, setLv] = useState({ code: "", lines: "" });
  const [dlg, setDlg] = useState<null | "region" | "product" | "launch" | "lines">(null);
  if (!permissions.includes("catalog.manage")) return <div className="wrap py-16"><h1 className="text-3xl">No access</h1></div>;
  if (!cat) return <Loader />;
  const run = async (fn: string, args: Record<string, unknown>) => { const { error } = await db.rpc(fn, args); setMsg(say(error)); if (!error) { setDlg(null); void load(); } };
  const need = !reason.trim();

  return (
    <section className="wrap py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4"><h1 className="text-5xl">Catalogue</h1><Link href="/admin" className="text-sm underline underline-offset-4">Admin home</Link></div>
      <div className="mt-6 max-w-xl"><label className="label" htmlFor="why">Reason for your changes (required, recorded in the audit log)</label><input id="why" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      {msg && <p role="status" className="mt-4 text-sm">{msg}</p>}

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3"><h2 className="text-3xl">Regions</h2><button className="btn" onClick={() => { setMsg(null); setR({ code: "", name: "", country: "", description: "", story: "" }); setDlg("region"); }}>Add region</button></div>
      <ul className="mt-4 grid gap-3">{cat.regions.map((x: any) => (
        <li key={x.code} className="flex flex-wrap items-center justify-between gap-3 border border-stone/60 bg-white p-4">
          <div><p className="font-serif text-xl">{x.name} <span className="text-sm text-charcoal/70">{x.code} · {x.country}</span></p></div>
          <div className="flex items-center gap-2"><label className="sr-only" htmlFor={`rs${x.code}`}>Status of {x.name}</label>
            <select id={`rs${x.code}`} className="field w-auto" value={x.status} disabled={need} onChange={(e) => run("admin_set_region_status", { p_region: x.id, p_status: e.target.value, p_reason: reason })}>{REGION_STATUS.map((s) => <option key={s} value={s}>{label(PAGE_LABEL, s)}</option>)}</select>
            <button className="btn-ghost" onClick={() => { setMsg(null); setR({ code: x.code, name: x.name, country: x.country, description: x.description ?? "", story: x.story ?? "" }); setDlg("region"); }}>Edit</button></div>
        </li>))}</ul>
      <Modal open={dlg === "region"} onClose={() => setDlg(null)} title="Add or edit a region"><form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void run("admin_save_region", { p_code: r.code, p_name: r.name, p_country: r.country, p_description: r.description || null, p_story: r.story || null, p_cover_image_url: null, p_seo_title: null, p_seo_description: null, p_reason: reason }); }}>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label className="label" htmlFor="rc">Code (2–6 capitals)</label><input id="rc" className="field" required pattern="[A-Z]{2,6}" value={r.code} onChange={(e) => setR({ ...r, code: e.target.value.toUpperCase() })} /></div>
          <div><label className="label" htmlFor="rn">Name</label><input id="rn" className="field" required value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} /></div>
          <div><label className="label" htmlFor="ry">Country</label><input id="ry" className="field" required value={r.country} onChange={(e) => setR({ ...r, country: e.target.value })} /></div></div>
        <div><label className="label" htmlFor="rd">Description</label><textarea id="rd" className="field py-2" rows={2} value={r.description} onChange={(e) => setR({ ...r, description: e.target.value })} /></div>
        <div><label className="label" htmlFor="rt">Regional story</label><textarea id="rt" className="field py-2" rows={4} value={r.story} onChange={(e) => setR({ ...r, story: e.target.value })} /></div>
        <div><label className="label" htmlFor="cwhy">Reason (required, recorded in the audit log)</label><input id="cwhy" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        {msg && <p role="alert" className="text-sm">{msg}</p>}
        <div><button className="btn" disabled={need}>Save region</button></div>
      </form></Modal>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-3"><h2 className="text-3xl">Products</h2><button className="btn" onClick={() => { setMsg(null); setP({ code: "", name: "", region: "", family: "", story: "", notes: "" }); setDlg("product"); }}>Add product</button></div>
      <ul className="mt-4 grid gap-3">{cat.products.map((x: any) => (
        <li key={x.code} className="border border-stone/60 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-serif text-xl">{x.name} <span className="text-sm text-charcoal/70">{x.code} · {x.region_code} · {x.family}</span></p>
              <p className="text-sm text-charcoal/70">{x.variants.map((v: any) => `${v.size_ml} ml ${rupees(v.price_paise)} (${v.sku})`).join(" · ") || "No sizes yet"}</p></div>
            <div className="flex items-center gap-2"><label className="sr-only" htmlFor={`ps${x.code}`}>Status of {x.name}</label>
              <select id={`ps${x.code}`} className="field w-auto" value={x.status} disabled={need} onChange={(e) => run("admin_set_product_status", { p_product: x.id, p_status: e.target.value, p_reason: reason })}>{PRODUCT_STATUS.map((s) => <option key={s} value={s}>{label(PRODUCT_LABEL, s)}</option>)}</select>
              <button className="btn-ghost" onClick={() => { setMsg(null); setP({ code: x.code, name: x.name, region: x.region_code, family: x.family, story: x.story ?? "", notes: Array.isArray(x.notes) ? x.notes.join(", ") : "" }); setDlg("product"); }}>Edit</button></div>
          </div></li>))}</ul>
      <Modal open={dlg === "product"} onClose={() => setDlg(null)} title="Add or edit a product"><form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void run("admin_save_product", { p_code: p.code, p_name: p.name, p_region_code: p.region, p_family: p.family, p_story: p.story || null, p_notes: p.notes.split(",").map((s) => s.trim()).filter(Boolean), p_seo_title: null, p_seo_description: null, p_reason: reason }); }}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="pc">Code (MC-KOR-001)</label><input id="pc" className="field" required pattern="MC-[A-Z]{3}-[0-9]{3}" value={p.code} onChange={(e) => setP({ ...p, code: e.target.value.toUpperCase() })} /></div>
          <div><label className="label" htmlFor="pn">Name</label><input id="pn" className="field" required value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></div>
          <div><label className="label" htmlFor="pr">Region</label><select id="pr" className="field" required value={p.region} onChange={(e) => setP({ ...p, region: e.target.value })}><option value="">Choose</option>{cat.regions.map((x: any) => <option key={x.code} value={x.code}>{x.name}</option>)}</select></div>
          <div><label className="label" htmlFor="pf">Fragrance family</label><input id="pf" className="field" required value={p.family} onChange={(e) => setP({ ...p, family: e.target.value })} /></div></div>
        <div><label className="label" htmlFor="ps">Product story</label><textarea id="ps" className="field py-2" rows={4} value={p.story} onChange={(e) => setP({ ...p, story: e.target.value })} /></div>
        <div><label className="label" htmlFor="pnotes">Approved notes (comma separated)</label><input id="pnotes" className="field" value={p.notes} onChange={(e) => setP({ ...p, notes: e.target.value })} /></div>
        <div><label className="label" htmlFor="cwhy">Reason (required, recorded in the audit log)</label><input id="cwhy" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        {msg && <p role="alert" className="text-sm">{msg}</p>}
        <div><button className="btn" disabled={need}>Save product</button></div>
      </form></Modal>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-3"><h2 className="text-3xl">Launches</h2><div className="flex gap-2"><button className="btn" onClick={() => { setMsg(null); setDlg("launch"); }}>New launch</button><button className="btn-ghost" onClick={() => { setMsg(null); setDlg("lines"); }}>Sizes and prices</button></div></div>
      <p className="mt-2 max-w-2xl text-sm text-charcoal/70">Launches start as drafts with 100 shared places. Add the sizes and launch prices while it is a draft, then ask a Super Admin to publish it from the Launches tab.</p>
      <Modal open={dlg === "launch"} onClose={() => setDlg(null)} title="New launch"><form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void run("admin_create_launch", { p_code: l.code, p_name: l.name, p_region_codes: l.regions.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean), p_story: l.story || null, p_reason: reason }); }}>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label className="label" htmlFor="lc">Launch code</label><input id="lc" className="field" required pattern="[A-Z]{2,6}" value={l.code} onChange={(e) => setL({ ...l, code: e.target.value.toUpperCase() })} /></div>
          <div><label className="label" htmlFor="ln">Launch name</label><input id="ln" className="field" required value={l.name} onChange={(e) => setL({ ...l, name: e.target.value })} /></div>
          <div><label className="label" htmlFor="lr">Region codes (comma separated)</label><input id="lr" className="field" required value={l.regions} onChange={(e) => setL({ ...l, regions: e.target.value })} /></div></div>
        <div><label className="label" htmlFor="ls">Launch story</label><textarea id="ls" className="field py-2" rows={3} value={l.story} onChange={(e) => setL({ ...l, story: e.target.value })} /></div>
        <div><label className="label" htmlFor="cwhy">Reason (required, recorded in the audit log)</label><input id="cwhy" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        {msg && <p role="alert" className="text-sm">{msg}</p>}
        <div><button className="btn" disabled={need}>Create draft launch</button></div>
      </form></Modal>
      <Modal open={dlg === "lines"} onClose={() => setDlg(null)} title="Launch sizes and prices"><form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); const items = lv.lines.split("\n").map((s) => s.trim()).filter(Boolean).map((s) => { const [sku, rupee] = s.split(/[\s,]+/); return { sku, launch_price_paise: Math.round(Number(rupee) * 100) }; }); void run("admin_set_launch_variants", { p_code: lv.code, p_items: items, p_reason: reason }); }}>
        <div><label className="label" htmlFor="lvc">Launch code (draft only)</label><input id="lvc" className="field max-w-xs" required value={lv.code} onChange={(e) => setLv({ ...lv, code: e.target.value.toUpperCase() })} /></div>
        <div><label className="label" htmlFor="lvl">One per line: SKU, price in rupees</label><textarea id="lvl" className="field py-2 font-mono text-sm" rows={4} required value={lv.lines} onChange={(e) => setLv({ ...lv, lines: e.target.value })} placeholder="MC-KOR-001-50ML, 999" /></div>
        <div><label className="label" htmlFor="cwhy">Reason (required, recorded in the audit log)</label><input id="cwhy" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        {msg && <p role="alert" className="text-sm">{msg}</p>}
        <div><button className="btn" disabled={need}>Replace launch items</button></div>
      </form></Modal>
    </section>
  );
}
export default function Page() { return <SignedInOnly><Catalogue /></SignedInOnly>; }
