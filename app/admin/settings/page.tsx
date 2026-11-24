"use client";
import { useCallback, useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { Loader } from "@/components/Loader";
import { db } from "@/lib/api";
import { errorText } from "@/lib/labels";
const msg = (e: { message: string } | null) => (e ? `Not done. ${errorText(e.message, "Please check the details and try again.")}` : "Done.");

function Settings() {
  const [note, setNote] = useState<string | null>(null);
  const [gst, setGst] = useState<{ enabled: boolean; mode: string; gstin: string | null; default_rate_bps: number; seller_state_code: string } | null>(null);
  const [reason, setReason] = useState("");
  useEffect(() => { db.rpc("admin_get_setting", { p_key: "gst" }).then(({ data }) => setGst(data ?? null)); }, []);
  if (!gst) return <Loader />;
  const save = async (v: typeof gst) => { const { error } = await db.rpc("admin_update_setting", { p_key: "gst", p_value: v, p_reason: reason }); setNote(msg(error)); if (!error) setGst(v); };
  return (
    <div className="grid gap-4">
      <h1 className="text-3xl">Settings</h1>
      {note && <p role="status" className="text-sm">{note}</p>}
    <div className="card grid max-w-xl gap-4">
      <h2 className="text-2xl">GST</h2>
      <p className="text-sm text-charcoal/70">Tax is calculated by the server. Confirm rates and GSTIN with your accountant before enabling.</p>
      <div><label className="label" htmlFor="gr">Reason for change</label><input id="gr" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      <label className="flex min-h-[44px] items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={gst.enabled} disabled={!reason.trim()} onChange={(e) => save({ ...gst, enabled: e.target.checked })} />Charge GST on orders</label>
      <div><label className="label" htmlFor="gm">Prices are</label><select id="gm" className="field" value={gst.mode} disabled={!reason.trim()} onChange={(e) => save({ ...gst, mode: e.target.value })}><option value="inclusive">GST-inclusive</option><option value="exclusive">GST added at checkout</option></select></div>
      <div><label className="label" htmlFor="gs">GSTIN</label><input id="gs" className="field" defaultValue={gst.gstin ?? ""} disabled={!reason.trim()} onBlur={(e) => e.target.value !== (gst.gstin ?? "") && save({ ...gst, gstin: e.target.value || null })} /></div>
    </div>
    </div>
  );
}


export default function Page() { return <SignedInOnly><Settings /></SignedInOnly>; }
