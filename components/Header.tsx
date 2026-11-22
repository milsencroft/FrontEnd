"use client";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { signInWithGoogle, signOut } from "@/lib/supabase";

export function Header() {
  const { session, loading, permissions } = useSession();
  const nav = "text-xs uppercase tracking-[0.18em] min-h-[44px] inline-flex items-center hover:text-sage";
  return (
    <header className="border-b border-stone/60">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-6">
        <Link href="/" className="font-serif text-2xl tracking-wide min-h-[44px] inline-flex items-center">Milsen &amp; Croft</Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-x-6">
          <Link className={nav} href="/launch">Launch</Link>
          <Link className={nav} href="/shop">Shop</Link>
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
