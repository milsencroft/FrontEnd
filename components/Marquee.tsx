/** A slow, endless line of place names. Decorative only. */
export function Marquee({ items }: { items: string[] }) {
  const row = (k: string) => (
    <ul key={k} aria-hidden className="marquee-row">{items.map((t, i) => <li key={i} className="font-serif text-5xl sm:text-7xl">{t}<span className="mx-8 inline-block h-px w-10 bg-bronze align-middle" /></li>)}</ul>
  );
  return <div className="marquee overflow-hidden border-y border-stone/60 py-8 text-charcoal/80" data-still role="presentation">{row("a")}{row("b")}</div>;
}
