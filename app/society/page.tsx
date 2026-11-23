import { MediaSlot } from "@/components/MediaSlot";
import { TierList } from "@/components/TierList";

export const metadata = { title: "The Society · Milsen & Croft" };
export default function Society() {
  return (
    <section className="wrap py-20">
      <h1 className="text-5xl sm:text-7xl">The Society</h1>
      <p className="mt-6 text-lg text-charcoal/80">Each regional launch opens a limited number of places. A confirmed pre-order in a launch qualifies a new customer for one membership. Interest registration is not membership.</p>
      <MediaSlot slot="society.banner" className="mt-10" />
      <TierList />
      <p className="mt-10 text-sm text-charcoal/70">Membership numbers follow the format MS-[launch code]-T[tier]-[number]. Benefits are confirmed per launch.</p>
    </section>
  );
}
