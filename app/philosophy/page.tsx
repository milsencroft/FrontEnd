import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/PageHero";

export const metadata = pageMetadata({
  title: "Our Philosophy", path: "/philosophy",
  description: "Milsen & Croft explores the character and atmosphere of extraordinary places and gives each one a fragrance. Our first collection pairs Kerala and Japan.",
});
export default function Philosophy() {
  return (
    <>
    <PageHero title="A sense of place. A lasting impression." slot="philosophy.banner" tone="kerala" tall />
    <section className="band band-soft"><div className="wrap py-20">
      <div className="grid max-w-3xl gap-6 text-lg text-charcoal/80">
        <p>Milsen &amp; Croft is an independent fragrance house based in Kerala. We explore the character, atmosphere and identity of extraordinary places, and give each one a fragrance.</p>
        <p>Our first collection pairs two places: Kerala and Japan. Mazha Fresh is from Kerala. Seiran Fresh is from Japan.</p>
        <p>Fresh means the freshness of a real place, not detergent, soap or laundry.</p>
      </div>
    </div></section>
    </>
  );
}
