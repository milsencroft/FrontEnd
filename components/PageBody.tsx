"use client";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/api";

export type PageRow = { slug: string; kind: string; title: string; summary: string | null; body?: string; published_at: string | null };

/** Published page text from the database. Body is plain text shown as paragraphs, never as HTML. */
export function PageBody({ slug, kind, fallbackTitle, initial }: { slug: string; kind: string; fallbackTitle?: string; initial?: PageRow | null }) {
  // `initial` comes from the server so the text is in the first HTML; undefined means load it in the browser.
  const [page, setPage] = useState<PageRow | null | undefined>(initial);
  useEffect(() => {
    let live = true;
    db.rpc("public_page", { p_slug: slug }).then(({ data }) => { if (live) setPage(data && (data as PageRow).kind === kind ? (data as PageRow) : null); });
    return () => { live = false; };
  }, [slug, kind]);
  if (page === undefined) return <article className="wrap max-w-2xl py-16" aria-busy="true"><div className="h-10 w-2/3 bg-stone/30" /></article>;
  if (page === null) {
    if (!fallbackTitle) notFound();
    return <article className="wrap max-w-2xl py-16"><h1 className="text-4xl">{fallbackTitle}</h1><p className="mt-6 text-charcoal/70">This policy will be published here before we open for sales.</p></article>;
  }
  return (
    <article className="wrap max-w-2xl py-16">
      <h1 className="text-4xl sm:text-5xl">{page.title}</h1>
      {page.published_at && kind === "journal" && <p className="mt-3 text-sm text-charcoal/60">{new Date(page.published_at).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>}
      <div className="mt-8 grid gap-4 leading-relaxed text-charcoal/90">{(page.body ?? "").split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}</div>
    </article>
  );
}
