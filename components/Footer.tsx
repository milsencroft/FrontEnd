import Link from "next/link";
import { FooterLinks } from "./FooterLinks";
import { NewsletterForm } from "./NewsletterForm";
/* eslint-disable @next/next/no-img-element */
export function Footer() {
  const l = "min-h-[44px] inline-flex items-center hover:text-sage";
  return (
    <footer className="mt-24 border-t border-stone/60 py-10 text-xs text-charcoal/70">
      <div className="wrap mb-8"><NewsletterForm /></div>
      <div className="wrap mb-6 border-b border-stone/40 pb-4"><p className="mb-1 uppercase tracking-[0.2em] text-charcoal/50">Quick links</p><FooterLinks /></div>
      <div className="wrap flex flex-wrap items-center justify-between gap-4">
        <img src="/logo.png" alt="Milsen & Croft" width={72} height={72} className="mb-4 h-[72px] w-[72px]" />
        <p>© Milsen &amp; Croft · Kerala, India</p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-6">
          {["privacy", "terms", "shipping", "returns"].map((s) => <Link key={s} className={l} href={`/legal/${s}`}>{s[0].toUpperCase() + s.slice(1)}</Link>)}
          <Link className={l} href="/faq">FAQ</Link>
        </nav>
      </div>
    </footer>
  );
}
