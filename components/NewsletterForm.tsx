"use client";
import { useState } from "react";
import { db } from "@/lib/api";

const ERR: Record<string, string> = {
  invalid_email: "Enter a valid email address.",
  rate_limited: "Too many attempts. Please try again later.",
};

export function NewsletterForm() {
  const [email, setEmail] = useState(""); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<string | null>(null); const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const { error } = await db.rpc("newsletter_subscribe", { p_email: email, p_source: "footer" });
    setBusy(false);
    if (error) { setMsg(ERR[error.message] ?? "Could not subscribe. Please try again."); return; }
    setDone(true); setEmail("");
  }
  if (done) return <p role="status" className="text-sm">Thank you. You are on the list.</p>;
  return (
    <form onSubmit={submit} className="grid max-w-md gap-2" aria-label="Newsletter">
      <label htmlFor="nl-email" className="text-sm">News from the house, now and then</label>
      <div className="flex gap-2">
        <input id="nl-email" type="email" required autoComplete="email" className="field flex-1" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn" disabled={busy}>Subscribe</button>
      </div>
      <p className="text-xs text-charcoal/70">By subscribing you agree to receive occasional news from Milsen &amp; Croft. You can unsubscribe at any time.</p>
      {msg && <p role="alert" className="text-sm">{msg}</p>}
    </form>
  );
}
