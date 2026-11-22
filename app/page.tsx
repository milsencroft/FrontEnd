import Link from "next/link";
export default function Home() {
  return (
    <section className="wrap py-24 sm:py-32">
      <p className="mb-6 text-xs uppercase tracking-[0.3em] text-bronze">Niche fragrance · Kerala, India</p>
      <h1 className="max-w-3xl text-5xl leading-tight sm:text-7xl">A sense of place. A lasting impression.</h1>
      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/launch" className="btn">The launch</Link>
        <Link href="/shop" className="btn-ghost">Shop</Link>
      </div>
    </section>
  );
}
