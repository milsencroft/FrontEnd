"use client";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { useAvailability } from "@/lib/useAvailability";

const LINKS: [string, string][] = [["/shop", "Shop"], ["/collections", "Collections"], ["/launch", "Launch"], ["/society", "The Society"], ["/philosophy", "Our Philosophy"], ["/journal", "Journal"], ["/contact", "Contact"], ["/cart", "Cart"]];

/** Every header destination, repeated as quick links (hiding pages with nothing to show). */
export function FooterLinks() {
  const av = useAvailability();
  const { session } = useSession();
  const l = "min-h-[44px] inline-flex items-center hover:text-sage";
  const ok = (h: string) => (h === "/shop" ? av.shop === true : h === "/launch" || h === "/collections" ? av.launch === true : true);
  return (
    <nav aria-label="Quick links" className="flex flex-wrap gap-x-6">
      {LINKS.filter(([h]) => ok(h)).map(([h, t]) => <Link key={h} className={l} href={h}>{t}</Link>)}
      <Link className={l} href="/account">{session ? "Account" : "Sign in"}</Link>
    </nav>
  );
}
