"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { LineRef } from "@/lib/api";

/** Quantity picker and add button. The picker offers only what is available; the backend enforces it again. */
export function AddToCart({ line, max, id, compact = false, onAdded }: { line: LineRef; max: number; id: string; compact?: boolean; onAdded?: () => void }) {
  const { add, error, notice } = useCart();
  const [qty, setQty] = useState(1); const [added, setAdded] = useState(false); const [busy, setBusy] = useState(false);
  const limit = Math.max(0, Math.min(5, max));
  if (limit < 1) return <p className="text-sm text-danger">Out of stock</p>;
  const q = Math.min(qty, limit);
  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div><label className="label" htmlFor={`qty-${id}`}>Quantity</label>
          <select id={`qty-${id}`} className={`field ${compact ? "w-20" : "w-24"}`} value={q} onChange={(e) => { setQty(Number(e.target.value)); setAdded(false); }}>
            {Array.from({ length: limit }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
          </select></div>
        {added
          ? <Link href="/cart" className="btn">Go to cart</Link>
          : <button className="btn" disabled={busy} onClick={async () => { setBusy(true); const ok = await add(line, q); setBusy(false); if (ok) { setAdded(true); onAdded?.(); } }}>Add to cart</button>}
      </div>
      {limit < 5 && <p className="mt-2 text-sm text-charcoal/70">Only {limit} available.</p>}
      {added && notice && <p role="status" className="mt-2 text-sm">{notice}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
