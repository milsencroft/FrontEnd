import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/PageHero";
import { TierList } from "@/components/TierList";

export const metadata = pageMetadata({
  title: "The Society", path: "/society",
  description: "The Milsen & Croft Society: each regional launch opens a limited number of places, and a confirmed pre-order qualifies a new customer for one membership.",
});
export default function Society() {
  return (
    <>
    <PageHero title="The Society" slot="society.banner" tone="noir" tall />
    <section className="band band-soft"><div className="wrap py-16">
      <p className="text-lg text-charcoal/80">Each regional launch opens a limited number of places. A confirmed pre-order in a launch qualifies a new customer for one membership. Interest registration is not membership.</p>
      <TierList />
      <p className="mt-10 text-sm text-charcoal/70">Membership numbers follow the format MS-[launch code]-T[tier]-[number]. Benefits are confirmed per launch.</p>
    </div></section>
    </>
  );
}
