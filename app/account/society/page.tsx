"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { fetchMySociety, type MySociety } from "@/lib/society";
import { useSession } from "@/lib/session";

function Card() {
  const { session } = useSession();
  const [s, setS] = useState<MySociety | null | undefined>(undefined);
  useEffect(() => { void fetchMySociety().then(setS); }, []);
  if (s === undefined) return <p className="wrap py-16">Loading…</p>;
  const m = s?.membership;
  if (!m) return <section className="wrap py-16"><h1 className="text-4xl">Society card</h1><p className="mt-4">You do not have an active membership. A confirmed launch pre-order qualifies you.</p><Link href="/society" className="btn mt-8">About the Society</Link></section>;
  const name = session?.user.user_metadata?.full_name ?? session?.user.email ?? "";
  return (
    <section className="wrap py-16">
      <div className="no-print flex flex-wrap items-center justify-between gap-4"><Link href="/account" className="text-sm underline underline-offset-4">Your account</Link><button className="btn" onClick={() => window.print()}>Print or save as PDF</button></div>
      <article aria-label="Society card" className="dark-surface mt-8 max-w-xl bg-charcoal p-8 text-ivory sm:p-12">
        <p className="font-serif text-lg tracking-wide">Milsen &amp; Croft</p>
        <p className="mt-16 font-serif text-4xl">{m.tier_name}</p>
        <p className="mt-2 text-sm text-stone">{name}</p>
        <p className="mt-10 font-mono text-xl tracking-widest">{m.number}</p>
        <p className="mt-2 text-xs text-stone">Member since {new Date(m.joined_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
      </article>
      <article aria-label="Certificate of membership" className="mt-12 max-w-3xl border border-bronze p-10 text-center sm:p-16 print:break-before-page">
        <p className="text-sm text-bronze">Milsen &amp; Croft Society</p>
        <h1 className="mt-6 text-4xl sm:text-5xl">Certificate of Membership</h1>
        <p className="mt-8">This certifies that</p>
        <p className="mt-2 font-serif text-3xl">{name}</p>
        <p className="mt-6">is a member of the {m.tier_name}, membership number</p>
        <p className="mt-2 font-mono text-lg tracking-widest">{m.number}</p>
        <p className="mt-8 text-sm text-charcoal/70">Admitted {new Date(m.joined_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}{m.launch_code ? ` through the ${m.launch_code} launch` : ""}.</p>
      </article>
      <div className="no-print mt-12 max-w-xl"><h2 className="text-2xl">Your benefits</h2><p className="mt-2">{m.benefits}</p>
        <p className="mt-4 text-sm text-charcoal/70">Physical card: {m.card_dispatched_at ? `sent ${new Date(m.card_dispatched_at).toLocaleDateString("en-IN")}` : "not sent yet"}. Collector package: {m.package_dispatched_at ? `sent ${new Date(m.package_dispatched_at).toLocaleDateString("en-IN")}` : "not sent yet"}.</p>
        <h2 className="mt-10 text-2xl">History</h2>
        <ul className="mt-3 grid gap-2 text-sm">{s!.history.map((h, i) => <li key={i}>{new Date(h.at).toLocaleDateString("en-IN")}: {h.reason}{h.number ? ` (${h.number})` : ""}</li>)}</ul></div>
    </section>
  );
}
export default function Page() { return <SignedInOnly><Card /></SignedInOnly>; }
