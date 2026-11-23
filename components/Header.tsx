"use client";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { signInWithGoogle, signOut } from "@/lib/supabase";

export function Header() {
  const { session, loading, permissions } = useSession();
  const { count } = useCart();
  const nav = "text-[11px] uppercase tracking-[0.18em] min-h-[44px] inline-flex items-center hover:text-sage";
  return (
    <header className="sticky top-0 z-30 border-b border-stone/60 bg-ivory/90 backdrop-blur">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-6">
        <Link href="/" className="font-serif text-2xl min-h-[44px] inline-flex items-center">Milsen &amp; Croft</Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-x-5 lg:gap-x-6">
          {[["/collections", "Collections"], ["/shop", "Shop"], ["/launch", "Launch"], ["/society", "The Society"], ["/philosophy", "Our Philosophy"], ["/journal", "Journal"], ["/contact", "Contact"]].map(([h, l]) => <Link key={h} className={nav} href={h}>{l}</Link>)}
          <Link className={nav} href="/cart">Cart{count > 0 ? ` (${count})` : ""}</Link>
          {session && <Link className={nav} href="/account">Account</Link>}
          {permissions.length > 0 && <Link className={nav} href="/admin">Admin</Link>}
          {!loading && (session
            ? <button className={nav} onClick={() => signOut()}>Sign out</button>
            : <button className={nav} onClick={() => signInWithGoogle()}>Sign in with Google</button>)}
        </nav>
      </div>
    </header>
  );
}
