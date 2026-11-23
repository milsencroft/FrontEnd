"use client";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PageRow } from "@/components/PageBody";

export default function Journal() {
  const [list, setList] = useState<PageRow[] | null>(null);
  useEffect(() => { supabase.rpc("public_pages", { p_kind: "journal" }).then(({ data }) => setList((data as PageRow[]) ?? [])); }, []);
  return (
    <>
    <PageHero title="Journal" tone="kerala" />
    <section className="wrap py-20">
      {list && list.length === 0 && <p className="mt-8 text-lg text-charcoal/80">There are no entries yet. Stories from each region will be published here.</p>}
      <ul className="mt-10 grid max-w-2xl gap-8">{(list ?? []).map((e) => (
        <li key={e.slug}><Link href={`/journal/${e.slug}`} className="block min-h-[44px]"><h2 className="text-3xl hover:text-sage">{e.title}</h2>{e.summary && <p className="mt-2 text-charcoal/80">{e.summary}</p>}</Link></li>
      ))}</ul>
    </section>
    </>
  );
}
