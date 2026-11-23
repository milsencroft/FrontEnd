"use client";
import { useState } from "react";
import { useSession } from "@/lib/session";
import { errorText, type Address, type CheckoutResult } from "@/lib/api";
import { openCheckout } from "@/lib/razorpay";
import { supabase } from "@/lib/supabase";
import { useAddresses } from "@/lib/useSaved";

const STATES: [string, string][] = [["32", "Kerala"], ["29", "Karnataka"], ["33", "Tamil Nadu"], ["27", "Maharashtra"], ["07", "Delhi"], ["36", "Telangana"], ["19", "West Bengal"], ["24", "Gujarat"], ["09", "Uttar Pradesh"], ["08", "Rajasthan"]];

type Phase = "form" | "paying" | "confirming" | "paid" | "failed";

/** Collects the address, asks the backend to create the order, opens Razorpay, then waits for the webhook-confirmed status. */
export function CheckoutPanel({ start, onCancel, onPaid }: { start: (a: Address) => Promise<CheckoutResult>; onCancel?: () => void; onPaid?: () => void }) {
  const { session } = useSession();
  const [a, setA] = useState<Address>({ name: "", phone: "", line1: "", city: "", state_code: "32", pincode: "" });
  const { list: saved } = useAddresses();
  const [phase, setPhase] = useState<Phase>("form");
  const [msg, setMsg] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const set = (k: keyof Address) => (e: { target: { value: string } }) => setA({ ...a, [k]: e.target.value });

  async function pollOrder(orderId: string) {
    setPhase("confirming");
    for (let i = 0; i < 30; i++) {
      const { data } = await supabase.from("orders").select("payment_status").eq("id", orderId).maybeSingle();
      const s = data?.payment_status;
      if (s === "captured") { onPaid?.(); return setPhase("paid"); }
      if (s === "refund_pending" || s === "refunded") { setMsg("We could not complete this order and your payment is being refunded."); return setPhase("failed"); }
      await new Promise((r) => setTimeout(r, 2000));
    }
    setMsg("Your payment is being confirmed. Check your account in a moment; you will not be charged twice.");
    setPhase("failed");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setPhase("paying");
    try {
      const r = await start(a);
      setOrderNo(r.order_number);
      await openCheckout({
        keyId: r.razorpay_key_id, razorpayOrderId: r.razorpay_order_id, amountPaise: r.amount_paise, name: a.name, email: session?.user.email, phone: a.phone,
        onSubmitted: () => void pollOrder(r.order_id), onDismiss: () => setPhase((p) => (p === "paying" ? "form" : p)),
      });
    } catch (err) { setMsg(errorText(err)); setPhase("form"); }
  }

  if (phase === "paid") return <div className="card"><h2 className="text-2xl">Thank you</h2><p className="mt-2">Order {orderNo} is confirmed. You can follow it in your account.</p></div>;
  if (phase === "confirming") return <div className="card" role="status"><p>Confirming your payment…</p></div>;
  return (
    <form onSubmit={submit} className="card grid gap-4" aria-label="Delivery details">
      <h2 className="text-2xl">Delivery details</h2>
      {saved.length > 0 && (
        <div><label className="label" htmlFor="sv">Use a saved address</label>
          <select id="sv" className="field" defaultValue="" onChange={(e) => {
            const s = saved.find((x) => x.id === e.target.value); if (!s) return;
            const code = STATES.find(([, n]) => n.toLowerCase() === s.state.toLowerCase())?.[0] ?? a.state_code;
            setA({ name: s.recipient, phone: s.phone.replace(/\D/g, "").slice(-10), line1: s.line1, line2: s.line2 ?? "", city: s.city, state_code: code, pincode: s.pincode });
          }}><option value="">Enter a new address</option>{saved.map((x) => <option key={x.id} value={x.id}>{x.label}: {x.line1}, {x.city}</option>)}</select></div>)}
      <div><label className="label" htmlFor="n">Full name</label><input id="n" className="field" required value={a.name} onChange={set("name")} autoComplete="name" /></div>
      <div><label className="label" htmlFor="p">Mobile (10 digits)</label><input id="p" className="field" required inputMode="numeric" pattern="[6-9][0-9]{9}" value={a.phone} onChange={set("phone")} autoComplete="tel-national" /></div>
      <div><label className="label" htmlFor="l1">Address</label><input id="l1" className="field" required value={a.line1} onChange={set("line1")} autoComplete="address-line1" /></div>
      <div><label className="label" htmlFor="l2">Address line 2 (optional)</label><input id="l2" className="field" value={a.line2 ?? ""} onChange={set("line2")} autoComplete="address-line2" /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="label" htmlFor="c">City</label><input id="c" className="field" required value={a.city} onChange={set("city")} autoComplete="address-level2" /></div>
        <div><label className="label" htmlFor="s">State</label><select id="s" className="field" value={a.state_code} onChange={set("state_code")}>{STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></div>
        <div><label className="label" htmlFor="z">PIN code</label><input id="z" className="field" required inputMode="numeric" pattern="[1-9][0-9]{5}" value={a.pincode} onChange={set("pincode")} autoComplete="postal-code" /></div>
      </div>
      {msg && <p role="alert" className="text-sm text-danger">{msg}</p>}
      <div className="hinge-safe flex flex-wrap gap-3">
        <button className="btn" disabled={phase === "paying"}>{phase === "paying" ? "Opening payment…" : "Continue to payment"}</button>
        {onCancel && <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
      <p className="text-xs text-charcoal/60">The final amount is calculated securely by our server.</p>
    </form>
  );
}
