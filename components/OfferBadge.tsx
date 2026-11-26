import type { ShopOffer } from "@/lib/useOffers";

export function OfferBadge({ offer }: { offer?: ShopOffer }) {
  if (!offer) return null;
  const ends = offer.ends_at ? ` · ends ${new Date(offer.ends_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "";
  return <p className="inline-flex rounded-full border border-bronze/60 px-3 py-1 text-xs tracking-wide text-bronze">{/(%|buy|₹|free)/i.test(offer.title) ? offer.title : `${offer.title} · ${offer.label}`}{ends}</p>;
}
