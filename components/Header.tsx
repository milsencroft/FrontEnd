"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { useAvailability } from "@/lib/useAvailability";
import { signInWithGoogle, signOut } from "@/lib/supabase";

const LEFT: [string, string][] = [["/collections", "Collections"], ["/shop", "Shop"], ["/launch", "Launch"], ["/society", "The Society"]];
const RIGHT: [string, string][] = [["/philosophy", "Our Philosophy"], ["/journal", "Journal"]];
const ALL: [string, string][] = [["/shop", "Shop"], ["/collections", "Collections"], ["/launch", "Launch"], ["/society", "The Society"], ["/philosophy", "Our Philosophy"], ["/journal", "Journal"], ["/contact", "Contact"]];

/* eslint-disable @next/next/no-img-element */
export function Header() {
  const { session, loading, permissions } = useSession();
  const { count } = useCart();
  const av = useAvailability();
  // Only offer pages that have something to show.
  const shown = (href: string) => (href === "/shop" ? av.shop === true : href === "/launch" || href === "/collections" ? av.launch === true : true);
  const path = usePathname();
  const [hide, setHide] = useState(false);
  const [open, setOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let last = scrollY;
    const on = () => { const y = scrollY; if (y > 160 && y > last + 6) setHide(true); else if (y < last - 6 || y < 160) setHide(false); last = y; };
    addEventListener("scroll", on, { passive: true }); return () => removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); opener.current?.focus(); } };
    addEventListener("keydown", key); closeBtn.current?.focus();
    return () => { document.body.style.overflow = prev; removeEventListener("keydown", key); };
  }, [open]);

  const link = "text-xs font-medium uppercase tracking-[0.2em] min-h-[44px] inline-flex items-center whitespace-nowrap transition-colors hover:text-sage";
  const acct = (close: boolean) => (<>
    {permissions.length > 0 && <Link className={link} href="/admin" onClick={() => close && setOpen(false)}>Admin</Link>}
    {session && <Link className={link} href="/account" onClick={() => close && setOpen(false)}>Account</Link>}
    {!loading && (session
      ? <button className={link} onClick={() => signOut()}>Sign out</button>
      : <button className={link} onClick={() => signInWithGoogle()}>Sign in</button>)}
  </>);
  const cart = `Cart${count > 0 ? ` (${count})` : ""}`;
  return (
    <>
      <header onFocusCapture={() => setHide(false)} className={`sticky top-0 z-30 border-b border-stone/30 bg-ivory/85 backdrop-blur-md transition-transform duration-300 ${hide && !open ? "-translate-y-full" : ""}`}>
        <div className="wrap grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center gap-6">
            <button ref={opener} type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="site-menu" className={`${link} gap-3 xl:hidden`}>
              <span aria-hidden className="flex w-5 flex-col gap-[5px]"><i className="block h-px bg-current" /><i className="block h-px w-3/4 bg-current" /></span>Menu
            </button>
            <nav aria-label="Main" className="hidden items-center gap-6 xl:flex xl:gap-8">{LEFT.filter(([h]) => shown(h)).map(([h, l]) => <Link key={h} className={link} href={h}>{l}</Link>)}</nav>
          </div>
          <Link href="/" className="inline-flex min-h-[44px] items-center gap-3 font-serif text-2xl whitespace-nowrap" aria-label="Milsen & Croft, home">
            <img src="/logo.png" alt="" width={40} height={40} className="h-10 w-10" /><span className="hidden sm:inline">Milsen &amp; Croft</span>
          </Link>
          <div className="flex items-center justify-end gap-6 xl:gap-8">
            <nav aria-label="More" className="hidden items-center gap-6 xl:flex xl:gap-8">{RIGHT.map(([h, l]) => <Link key={h} className={link} href={h}>{l}</Link>)}</nav>
            <Link className={link} href="/cart">{cart}</Link>
            <div className="hidden items-center gap-6 xl:flex xl:gap-8">{acct(false)}</div>
          </div>
        </div>
      </header>

      <div id="site-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden={!open} className="dark-surface fixed inset-0 z-50 overflow-y-auto bg-charcoal text-ivory menu-in">
        <div aria-hidden className="grain" />
        <div className="wrap relative flex min-h-full flex-col py-5">
          <div className="flex h-16 items-center justify-between">
            <span className="inline-flex items-center gap-3 font-serif text-xl"><img src="/logo.png" alt="" width={36} height={36} className="h-9 w-9" />Milsen &amp; Croft</span>
            <button ref={closeBtn} type="button" onClick={() => { setOpen(false); opener.current?.focus(); }} className="min-h-[44px] px-2 text-xs font-medium uppercase tracking-[0.2em]">Close</button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-8 border-b border-stone/40 pb-4">
            <Link href="/cart" onClick={() => setOpen(false)} className={link}>{cart}</Link>
            {acct(true)}
          </div>
          <nav aria-label="Menu" className="mt-8 grid gap-1">
            {ALL.filter(([h]) => shown(h)).map(([h, l], i) => <Link key={h} href={h} onClick={() => setOpen(false)} style={{ animationDelay: `${120 + i * 50}ms` }} className="menu-link font-serif text-4xl leading-tight hover:text-brass sm:text-5xl">{l}</Link>)}
          </nav>
          <div className="mt-auto pt-8 text-xs text-ivory/60">© Milsen &amp; Croft · Kerala, India</div>
        </div>
      </div>
    </>
  );
}
