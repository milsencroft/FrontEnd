"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { cartApi, ApiError, errorText, forgetGuestToken, type CartView, type LineRef } from "./api";
import { useSession } from "./session";

const EMPTY: CartView = { lines: [], count: 0, subtotal_paise: 0 };
interface Ctx {
  cart: CartView; loading: boolean; count: number; error: string | null;
  add: (l: LineRef, qty?: number) => Promise<boolean>;
  setQty: (l: LineRef, qty: number) => Promise<void>;
  remove: (l: LineRef) => Promise<void>;
  clear: () => Promise<void>;
  reload: () => Promise<void>;
}
const CartCtx = createContext<Ctx>({ cart: EMPTY, loading: true, count: 0, error: null, add: async () => false, setQty: async () => {}, remove: async () => {}, clear: async () => {}, reload: async () => {} });
export const useCart = () => useContext(CartCtx);

/**
 * The cart lives on the backend. This provider only asks the backend to change it and shows what comes back.
 * Whether an item can be added, how many, and what it costs are all decided there.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { session, loading: sessionLoading } = useSession();
  const [cart, setCart] = useState<CartView>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = session?.user.id ?? null;

  const reload = useCallback(async () => {
    try { setCart(await cartApi.get()); } catch { setCart(EMPTY); } finally { setLoading(false); }
  }, []);

  // After sign-in the visitor's cart joins the account cart; then the account cart is shown.
  useEffect(() => {
    if (sessionLoading) return;
    let live = true;
    (async () => {
      if (userId) { const merged = await cartApi.merge().catch(() => null); if (merged) { forgetGuestToken(); if (live) { setCart(merged); setLoading(false); } return; } }
      if (live) await reload();
    })();
    return () => { live = false; };
  }, [userId, sessionLoading, reload]);

  const run = async (fn: () => Promise<CartView>) => {
    setError(null);
    try { setCart(await fn()); return true; }
    catch (e) { setError(e instanceof ApiError ? errorText(e) : "Something went wrong. Please try again."); return false; }
  };
  const value: Ctx = {
    cart, loading, count: cart.count, error, reload,
    add: (l, qty = 1) => run(() => cartApi.add(l, qty)),
    setQty: async (l, qty) => { await run(() => cartApi.setQty(l, qty)); },
    remove: async (l) => { await run(() => cartApi.remove(l)); },
    clear: async () => { await run(() => cartApi.clear()); },
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
