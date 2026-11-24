"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { useAvailability } from "@/lib/useAvailability";

/** A link to the shop that only appears when the shop has something to show. */
export function ShopLink({ className, children, fallback }: { className?: string; children: ReactNode; fallback?: ReactNode }) {
  const av = useAvailability();
  return av.shop ? <Link href="/shop" className={className}>{children}</Link> : <>{fallback ?? null}</>;
}
