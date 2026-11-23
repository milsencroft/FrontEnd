import { MediaSlot } from "@/components/MediaSlot";

export const metadata = { title: "Our Philosophy · Milsen & Croft" };
export default function Philosophy() {
  return (
    <section className="wrap py-20">
      <h1 className="max-w-4xl text-5xl sm:text-7xl">A sense of place. A lasting impression.</h1>
      <MediaSlot slot="philosophy.banner" className="mt-10" />
      <div className="mt-12 grid max-w-3xl gap-6 text-lg text-charcoal/80">
        <p>Milsen &amp; Croft is an independent fragrance house based in Kerala. We explore the character, atmosphere and identity of extraordinary places, and give each one a fragrance.</p>
        <p>Our first collection pairs two places: Kerala and Japan. Mazha Fresh is from Kerala. Seiran Fresh is from Japan.</p>
        <p>Fresh means the freshness of a real place, not detergent, soap or laundry.</p>
      </div>
    </section>
  );
}
