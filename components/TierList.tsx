"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const FALLBACK: [string, string][] = [
  ["Origin Circle", "Numbered card, certificate, collector package and Society access."],
  ["Collector Circle", "Updated card and certificate, and selected early access."],
  ["Connoisseur Circle", "Discovery offers, previews and announcements."],
  ["Prestige Circle", "Priority limited releases and selected offers."],
  ["Grand Reserve", "Private previews and exclusive products or experiences."],
  ["Privé Circle", "Store-opening invitations, VIP shopping, private events and selected exclusive products."],
];

export function TierList() {
  const [tiers, setTiers] = useState<[string, string][]>(FALLBACK);
  useEffect(() => {
    supabase.from("society_tiers").select("tier,name,benefits").order("tier").then(({ data }) => {
      if (data && data.length) setTiers(data.map((t: { name: string; benefits: string }, i: number) => [t.name, t.benefits || FALLBACK[i]?.[1] || ""]));
    });
  }, []);
  return (
    <ol className="mt-14 grid gap-0 border-t border-stone/60">
      {tiers.map(([name, benefit], i) => (
        <li key={name} className="grid gap-2 border-b border-stone/60 py-8 sm:grid-cols-[6rem_1fr_2fr] sm:items-baseline">
          <span className="font-serif text-4xl text-bronze">{i + 1}</span>
          <h2 className="text-3xl">{name}</h2>
          <p className="text-charcoal/80">{benefit}</p>
        </li>
      ))}
    </ol>
  );
}
