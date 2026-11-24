"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAvailability } from "@/lib/useAvailability";

/** Sends visitors away from a page that has nothing to show right now (no live launch, or an empty shop). */
export function Guard({ need, children }: { need: "launch" | "shop"; children: React.ReactNode }) {
  const a = useAvailability();
  const router = useRouter();
  const ok = a[need];
  useEffect(() => {
    if (ok !== false) return;
    router.replace(need === "launch" && a.shop ? "/shop" : "/");
  }, [ok, need, a.shop, router]);
  return ok === false ? null : <>{children}</>;
}
