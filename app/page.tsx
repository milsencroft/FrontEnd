import { PlaceHero } from "@/components/PlaceHero";
import { LaunchBand } from "@/components/LaunchBand";
import Link from "next/link";
import { MediaSlot } from "@/components/MediaSlot";
import { Journey } from "@/components/home/Journey";
import { WordReveal } from "@/components/home/WordReveal";
import { SocietyTrack } from "@/components/home/SocietyTrack";

export default function Home() {
  return (
    <>
      <PlaceHero />
      <WordReveal text="Two places. Two fragrances. Made in small numbers." />
      <Journey />
      <LaunchBand />
      <div className="wrap"><MediaSlot slot="home.hero" /></div>
      <SocietyTrack />
      <section className="wrap py-24 text-center sm:py-32">
        <h2 className="mx-auto max-w-3xl text-4xl sm:text-6xl">Milsen &amp; Croft is a fragrance house in Kerala.</h2>
        <p className="mx-auto mt-6 text-lg text-charcoal/80">Each release begins with a place and is made in a limited run.</p>
        <Link href="/shop" className="btn mt-10">Shop the collection</Link>
      </section>
    </>
  );
}
