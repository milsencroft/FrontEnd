import Link from "next/link";
import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: "Page not found", robots: NOINDEX };

export default function NotFound() {
  return (
    <section className="wrap py-24">
      <h1 className="text-4xl sm:text-5xl">We could not find that page</h1>
      <p className="mt-4 text-charcoal/80">It may have moved, or it may not be part of the shop right now.</p>
      <div className="mt-8 flex flex-wrap gap-4"><Link className="btn" href="/shop">Browse the shop</Link><Link className="btn-ghost" href="/">Back home</Link></div>
    </section>
  );
}
