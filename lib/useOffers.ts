"use client";
import { useEffect, useState } from "react";
import { db } from "./api";

export interface ShopOffer { sku: string; title: string; kind: string; label: string; sale_price_paise: number | null; ends_at: string | null }

/** Live offers open to everyone, keyed by size (sku). The backend works out the labels and sale prices. */
export function useOffers(): Record<string, ShopOffer> {
  const [map, setMap] = useState<Record<string, ShopOffer>>({});
  useEffect(() => {
    db.rpc("public_offers").then(({ data }) => {
      const m: Record<string, ShopOffer> = {};
      for (const o of (data as ShopOffer[]) ?? []) m[o.sku] = o;
      setMap(m);
    });
  }, []);
  return map;
}
