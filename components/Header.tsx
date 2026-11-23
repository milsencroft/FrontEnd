"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { signInWithGoogle, signOut } from "@/lib/supabase";

/* eslint-disable @next/next/no-img-element */
export function Header() {
  const { session, loading, permissions } = useSession();
  const { count } = useCart();
  const [hide, setHide] = useState(false);
  useEffect(() => {
    let last = scrollY;
    const on = () => { const y = scrollY; if (y > 160 && y > last + 6) setHide(true); else if (y < last - 6 || y < 160) setHide(false); last = y; };
    addEventListener("scroll", on, { passive: true }); return () => removeEventListener("scroll", on);
  }, []);
  const nav = "text-[11px] uppercase tracking-[0.18em] min-h-[44px] inline-flex items-center hover:text-sage";
  return (
    <header onFocusCapture={() => setHide(false)} className={`sticky top-0 z-30 border-b border-stone/60 bg-ivory/95 transition-transform duration-300 ${hide ? "-translate-y-full" : ""}`}>
      <div className="wrap flex flex-wrap items-center justify-between gap-x-6">
        <Link href="/" className="inline-flex min-h-[44px] items-center gap-3 font-serif text-2xl" aria-label="Milsen & Croft, home"><img src="/logo.png" alt="" width={36} height={36} className="h-9 w-9" />Milsen &amp; Croft</Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-x-5 lg:gap-x-6">
          {[["/collections", "Collections"], ["/shop", "Shop"], ["/launch", "Launch"], ["/society", "The Society"], ["/philosophy", "Our Philosophy"], ["/journal", "Journal"], ["/contact", "Contact"]].map(([h, l]) => <Link key={h} className={nav} href={h}>{l}</Link>)}
          <Link className={nav} href="/cart">Cart{count > 0 ? ` (${count})` : ""}</Link>
          {session && <Link className={nav} href="/account">Account</Link>}
          {permissions.length > 0 && <Link className={nav} href="/admin">Admin</Link>}
          <ThemeToggle className={nav} />
          {!loading && (session
            ? <button className={nav} onClick={() => signOut()}>Sign out</button>
            : <button className={nav} onClick={() => signInWithGoogle()}>Sign in with Google</button>)}
        </nav>
      </div>
    </header>
  );
}
