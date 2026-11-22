"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartLine { sku?: string; bundle?: string; qty: number }
const KEY = "mc_cart_v1";
const MAX_QTY = 5, MAX_LINES = 10; // the backend enforces the same limits
const same = (a: CartLine, b: CartLine) => a.sku === b.sku && a.bundle === b.bundle;

interface Ctx { lines: CartLine[]; count: number; add: (l: Omit<CartLine, "qty">, qty?: number) => void; setQty: (l: CartLine, qty: number) => void; remove: (l: CartLine) => void; clear: () => void }
const CartCtx = createContext<Ctx>({ lines: [], count: 0, add() {}, setQty() {}, remove() {}, clear() {} });
export const useCart = () => useContext(CartCtx);

/** The cart holds only identifiers and quantities. Prices, stock and totals always come from the backend. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setLines(JSON.parse(raw)); } catch {} }, []);
  const save = (next: CartLine[]) => { setLines(next); try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} };
  const add: Ctx["add"] = (l, qty = 1) => {
    const found = lines.find((x) => same(x, l as CartLine));
    if (found) return save(lines.map((x) => (x === found ? { ...x, qty: Math.min(MAX_QTY, x.qty + qty) } : x)));
    if (lines.length >= MAX_LINES) return;
    save([...lines, { ...l, qty: Math.min(MAX_QTY, qty) }]);
  };
  const setQty: Ctx["setQty"] = (l, qty) => save(lines.map((x) => (same(x, l) ? { ...x, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : x)));
  const remove: Ctx["remove"] = (l) => save(lines.filter((x) => !same(x, l)));
  return <CartCtx.Provider value={{ lines, count: lines.reduce((n, x) => n + x.qty, 0), add, setQty, remove, clear: () => save([]) }}>{children}</CartCtx.Provider>;
}
