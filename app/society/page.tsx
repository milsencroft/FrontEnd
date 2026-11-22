const TIERS: [string, string][] = [
  ["Origin Circle", "Numbered card, certificate, collector package and Society access."],
  ["Collector Circle", "Updated card and certificate, and selected early access."],
  ["Connoisseur Circle", "Discovery offers, previews and announcements."],
  ["Prestige Circle", "Priority limited releases and selected offers."],
  ["Grand Reserve", "Private previews and exclusive products or experiences."],
  ["Privé Circle", "Store-opening invitations, VIP shopping, private events and selected exclusive products."],
];
export const metadata = { title: "The Society · Milsen & Croft" };
export default function Society() {
  return (
    <section className="wrap py-20">
      <h1 className="text-5xl sm:text-7xl">The Society</h1>
      <p className="mt-6 text-lg text-charcoal/80">Each regional launch opens a limited number of places. A confirmed pre-order in a launch qualifies a new customer for one membership. Interest registration is not membership.</p>
      <ol className="mt-14 grid gap-0 border-t border-stone/60">
        {TIERS.map(([name, benefit], i) => (
          <li key={name} className="grid gap-2 border-b border-stone/60 py-8 sm:grid-cols-[6rem_1fr_2fr] sm:items-baseline">
            <span className="font-serif text-4xl text-bronze">{i + 1}</span>
            <h2 className="text-3xl">{name}</h2>
            <p className="text-charcoal/80">{benefit}</p>
          </li>
        ))}
      </ol>
      <p className="mt-10 text-sm text-charcoal/70">Membership numbers follow the format MS-[launch code]-T[tier]-[number]. Benefits are confirmed per launch.</p>
    </section>
  );
}
