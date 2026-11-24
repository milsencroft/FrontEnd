"use client";
import { useEffect, useState } from "react";
import { db } from "./api";
import { env } from "./env";

/** Launch states in which the Launch page has something to show. After that its fragrances live in the shop. */
export const LAUNCH_VISIBLE = ["preorder_active", "paused", "closed"];

export interface Availability { launch: boolean | null; shop: boolean | null }
let cache: Promise<Availability> | null = null;
const load = (): Promise<Availability> => (cache ??= (async () => {
  const [s, c] = await Promise.all([
    Promise.resolve(db.rpc("public_launch_state", { p_code: env.currentLaunch })).catch(() => ({ data: null })),
    Promise.resolve(db.rpc("shop_catalogue")).catch(() => ({ data: null })),
  ]);
  const st = ((s.data as { status: string }[] | null) ?? [])[0];
  const rows = (c.data as unknown[] | null) ?? [];
  // If the backend cannot be reached, assume nothing is hidden by mistake only for the shop; the launch stays hidden.
  return { launch: !!st && LAUNCH_VISIBLE.includes(st.status), shop: c.data === null ? true : rows.length > 0 };
})());

/** What the public site has to offer right now. null means "not known yet". */
export function useAvailability(): Availability {
  const [a, setA] = useState<Availability>({ launch: null, shop: null });
  useEffect(() => { let live = true; void load().then((x) => live && setA(x)); return () => { live = false; }; }, []);
  return a;
}
