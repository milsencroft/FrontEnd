"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { env } from "./env";

export interface LaunchState { name: string; status: string; capacity: number; allocated: number; held: number; remaining: number }
export interface LaunchItem { sku: string; product_name: string; region_name: string; family: string; size_ml: number; launch_price_paise: number; story: string | null; in_stock: boolean }

/** Public launch data straight from the backend. Nothing here is computed in the browser. */
export function useLaunch(poll = 15000) {
  const [state, setState] = useState<LaunchState | null>(null);
  const [items, setItems] = useState<LaunchItem[]>([]);
  useEffect(() => {
    let live = true;
    const load = async () => {
      const [s, c] = await Promise.all([supabase.rpc("public_launch_state", { p_code: env.currentLaunch }), supabase.rpc("launch_catalogue", { p_code: env.currentLaunch })]);
      if (!live) return;
      setState(((s.data as LaunchState[]) ?? [])[0] ?? null); setItems((c.data as LaunchItem[]) ?? []);
    };
    void load(); const t = setInterval(load, poll);
    return () => { live = false; clearInterval(t); };
  }, [poll]);
  return { state, items };
}
