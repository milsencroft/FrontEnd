"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { errorText, type Address, type CheckoutResult } from "@/lib/api";
import { openCheckout } from "@/lib/razorpay";
import { db } from "@/lib/api";
import { useAddresses } from "@/lib/useSaved";

const STATES: [string, string][] = [["32", "Kerala"], ["29", "Karnataka"], ["33", "Tamil Nadu"], ["27", "Maharashtra"], ["07", "Delhi"], ["36", "Telangana"], ["19", "West Bengal"], ["24", "Gujarat"], ["09", "Uttar Pradesh"], ["08", "Rajasthan"]];

type Phase = "form" | "paying" | "confirming" | "paid" | "failed";

/** Collects the address, asks the backend to create the order, opens Razorpay, then waits for the webhook-confirmed status. */
export function CheckoutPanel({ start, onCancel, onPaid }: { start: (a: Address) => Promise<CheckoutResult>; onCancel?: () => void; onPaid?: () => void }) {
  const { session } = useSession();
  const [a, setA] = useState<Address>({ name: "", phone: "", line1: "", city: "", state_code: "32", pincode: "" });
  const { list: saved, reload } = useAddresses();
  const [sel, setSel] = useState<string | null>(null); const [adding, setAdding] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [msg, setMsg] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const set = (k: keyof Address) => (e: { target: { value: string } }) => setA({ ...a, [k]: e.target.value });

  const stateName = (code: string) => STATES.find(([c]) => c === code)?.[1] ?? "";
  const fill = (s: (typeof saved)[number]) => {
    const found = STATES.find(([, n]) => n.toLowerCase() === s.state.toLowerCase())?.[0];
    // A state we cannot match is never guessed: the form opens, prefilled, so the customer picks it.
    const code = found ?? "32"; if (!found) setAdding(true);
    setSel(s.id); setA({ name: s.recipient, phone: s.phone.replace(/\D/g, "").slice(-10), line1: s.line1, line2: s.line2 ?? "", city: s.city, state_code: code, pincode: s.pincode });
  };
  // Saved addresses are offered first, the default one already chosen, like a marketplace checkout.
  useEffect(() => { if (saved.length && sel === null && !adding) fill(saved.find((x) => x.is_default) ?? saved[0]); }, [saved]); // eslint-disable-line react-hooks/exhaustive-deps
  const same = (x: (typeof saved)[number]) => x.line1.trim().toLowerCase() === a.line1.trim().toLowerCase() && x.pincode === a.pincode && x.recipient.trim().toLowerCase() === a.name.trim().toLowerCase();
  /** Remembers a newly typed address once the order has been created, so the next checkout can pick it. */
  async function remember() {
    if (saved.some(same)) return;
    const { error } = await db.rpc("my_save_address", { p_id: null, p_label: "Home", p_recipient: a.name, p_phone: a.phone, p_line1: a.line1, p_line2: a.line2 ?? "", p_city: a.city, p_state: stateName(a.state_code), p_pincode: a.pincode, p_default: false });
    if (!error) void reload();
  }

  async function pollOrder(orderId: string) {
    setPhase("confirming");
    for (let i = 0; i < 30; i++) {
      const { data: s } = await db.rpc("my_order_status", { p_order: orderId });
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
      setOrderNo(r.order_number); void remember();
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
      {saved.length > 0 && !adding && (
        <fieldset className="grid gap-3"><legend className="label">Deliver to</legend>
          {saved.map((x) => (
            <label key={x.id} className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-2xl border p-4 ${sel === x.id ? "border-bronze bg-bone/60" : "border-stone/40"}`}>
              <input type="radio" name="addr" className="mt-1" checked={sel === x.id} onChange={() => fill(x)} />
              <span className="text-sm"><span className="font-medium">{x.recipient}</span> · {x.label}{x.is_default ? " (default)" : ""}<br />{x.line1}{x.line2 ? `, ${x.line2}` : ""}, {x.city}, {x.state} {x.pincode}<br />{x.phone}</span>
            </label>))}
          <button type="button" className="btn-ghost w-fit" onClick={() => { setAdding(true); setSel(null); setA({ name: "", phone: "", line1: "", city: "", state_code: "32", pincode: "" }); }}>Add a new address</button>
        </fieldset>)}
      {saved.length > 0 && adding && <button type="button" className="w-fit text-sm underline underline-offset-4" onClick={() => { setAdding(false); fill(saved.find((x) => x.is_default) ?? saved[0]); }}>Use a saved address instead</button>}
      {(saved.length === 0 || adding) && <>
      <div><label className="label" htmlFor="n">Full name</label><input id="n" className="field" required value={a.name} onChange={set("name")} autoComplete="name" /></div>
      <div><label className="label" htmlFor="p">Mobile (10 digits)</label><input id="p" className="field" required inputMode="numeric" pattern="[6-9][0-9]{9}" value={a.phone} onChange={set("phone")} autoComplete="tel-national" /></div>
      <div><label className="label" htmlFor="l1">Address</label><input id="l1" className="field" required value={a.line1} onChange={set("line1")} autoComplete="address-line1" /></div>
      <div><label className="label" htmlFor="l2">Address line 2 (optional)</label><input id="l2" className="field" value={a.line2 ?? ""} onChange={set("line2")} autoComplete="address-line2" /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="label" htmlFor="c">City</label><input id="c" className="field" required value={a.city} onChange={set("city")} autoComplete="address-level2" /></div>
        <div><label className="label" htmlFor="s">State</label><select id="s" className="field" value={a.state_code} onChange={set("state_code")}>{STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></div>
        <div><label className="label" htmlFor="z">PIN code</label><input id="z" className="field" required inputMode="numeric" pattern="[1-9][0-9]{5}" value={a.pincode} onChange={set("pincode")} autoComplete="postal-code" /></div>
      </div>
      </>}
      {msg && <p role="alert" className="text-sm text-danger">{msg}</p>}
      <div className="hinge-safe flex flex-wrap gap-3">
        <button className="btn" disabled={phase === "paying"}>{phase === "paying" ? "Opening payment…" : "Continue to payment"}</button>
        {onCancel && <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
      <p className="text-xs text-charcoal/70">The final amount is calculated securely by our server.</p>
    </form>
  );
}
