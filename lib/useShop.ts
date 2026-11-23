"use client";
import { useEffect, useState } from "react";
import { db } from "./api";

export interface ShopRow { product_code: string; product_name: string; family: string; region_code: string; region_name: string; story: string | null; notes: unknown; images: unknown; sku: string; size_ml: number; price_paise: number; compare_at_paise: number | null; in_stock: boolean; max_qty: number }
export interface ShopBundle { code: string; name: string; description: string | null; price_paise: number; items: unknown; in_stock: boolean; max_qty: number }

/** Published, purchasable catalogue from the backend. Launch-only and draft products are never returned. */
export function useShop(initial?: { rows?: ShopRow[]; bundles?: ShopBundle[] }) {
  // `initial` is the catalogue the server already rendered, so the first paint (and search engines) see real content; the live fetch then refreshes it.
  const [rows, setRows] = useState<ShopRow[] | null>(initial?.rows ?? null);
  const [bundles, setBundles] = useState<ShopBundle[]>(initial?.bundles ?? []);
  useEffect(() => {
    db.rpc("shop_catalogue").then(({ data }) => setRows((data as ShopRow[]) ?? []));
    db.rpc("shop_bundles").then(({ data }) => setBundles((data as ShopBundle[]) ?? []));
  }, []);
  return { rows, bundles };
}

export const notesList = (n: unknown): string[] => (Array.isArray(n) ? n.filter((x): x is string => typeof x === "string") : []);
