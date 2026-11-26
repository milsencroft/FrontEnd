"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { LineRef } from "@/lib/api";

/** Quantity picker and add button. The picker offers only what is available; the backend enforces it again. */
export function AddToCart({ line, max, id, compact = false, onAdded }: { line: LineRef; max: number; id: string; compact?: boolean; onAdded?: () => void }) {
  const { add, error, notice, cart, loading } = useCart();
  const [qty, setQty] = useState(1); const [busy, setBusy] = useState(false);
  // Once an item is in the cart the shop only offers "Go to cart" with the number held there; quantities change in the cart.
  const inCart = cart.lines.find((x) => (line.sku ? x.sku === line.sku : x.bundle === line.bundle))?.qty ?? 0;
  const limit = Math.max(0, Math.min(5, max));
  if (!loading && inCart > 0) return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm" role="status">{inCart} in your cart</p>
      <Link href="/cart" className="btn">Go to cart</Link>
    </div>
  );
  if (limit < 1) return <p className="text-sm text-danger">Out of stock</p>;
  const q = Math.min(qty, limit);
  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div><label className="label" htmlFor={`qty-${id}`}>Quantity</label>
          <select id={`qty-${id}`} className={`field ${compact ? "w-20" : "w-24"}`} value={q} onChange={(e) => setQty(Number(e.target.value))}>
            {Array.from({ length: limit }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
          </select></div>
        <button className="btn" disabled={busy || loading} onClick={async () => { setBusy(true); const ok = await add(line, q); setBusy(false); if (ok) onAdded?.(); }}>Add to cart</button>
      </div>
      {limit < 5 && <p className="mt-2 text-sm text-charcoal/70">Only {limit} available.</p>}
      {notice && <p role="status" className="mt-2 text-sm">{notice}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
