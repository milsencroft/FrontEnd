import { PlaceHero } from "@/components/PlaceHero";
import { LaunchBand } from "@/components/LaunchBand";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <PlaceHero />
      <LaunchBand />
      <section className="wrap py-24 sm:py-32">
        <h2 className="max-w-3xl text-4xl sm:text-5xl">Two places. Two fragrances. Made in small numbers.</h2>
        <p className="mt-6 text-lg text-charcoal/80">Milsen &amp; Croft is a fragrance house in Kerala. Each release begins with a place and is made in a limited run.</p>
        <Link href="/shop" className="btn-ghost mt-10">Shop the collection</Link>
      </section>
    </>
  );
}
