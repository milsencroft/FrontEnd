import Link from "next/link";
export function Footer() {
  const l = "min-h-[44px] inline-flex items-center hover:text-sage";
  return (
    <footer className="mt-24 border-t border-stone/60 py-10 text-xs text-charcoal/70">
      <div className="wrap flex flex-wrap items-center justify-between gap-4">
        <p>© Milsen &amp; Croft · Kerala, India</p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-6">
          {["privacy", "terms", "shipping", "returns"].map((s) => <Link key={s} className={l} href={`/legal/${s}`}>{s[0].toUpperCase() + s.slice(1)}</Link>)}
          <Link className={l} href="/faq">FAQ</Link>
        </nav>
      </div>
    </footer>
  );
}
