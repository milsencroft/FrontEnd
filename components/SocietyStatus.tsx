"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMySociety, type MySociety } from "@/lib/society";

export function SocietyStatus() {
  const [s, setS] = useState<MySociety | null>(null);
  useEffect(() => { void fetchMySociety().then(setS); }, []);
  if (!s) return null;
  const m = s.membership;
  if (!m && !s.lapsed && s.queue.length === 0) return null;
  return (
    <div className="card grid gap-2">
      <h2 className="text-2xl">Society</h2>
      {m && <><p className="font-serif text-2xl">{m.tier_name}</p><p className="text-sm">{m.number}</p>
        {m.missed > 0 && <p role="status" className="text-sm">You have missed {m.missed} launch. Taking part in the next one keeps your tier; missing two in a row moves you down.</p>}
        <Link href="/account/society" className="btn-ghost mt-2 w-fit">View card and certificate</Link></>}
      {s.queue.map((q) => <p key={q.tier} className="text-sm">You qualified for {q.tier_name} on {new Date(q.since).toLocaleDateString("en-IN")} and are in its queue. You keep your current tier meanwhile.</p>)}
      {!m && s.lapsed && <p className="text-sm">Your membership has ended and you are on the Tier 1 re-entry list. Re-entry is reviewed by our team.</p>}
    </div>
  );
}
