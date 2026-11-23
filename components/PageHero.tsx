
const TONES = { noir: 1, kerala: 1, japan: 1 } as const;

/** Dark, textured page header. Shows the film or image from `slot` behind the title when one is set. */
export function PageHero({ title, lede, tone = "noir", tall = false }: { title: string; lede?: string; slot?: string; tone?: keyof typeof TONES; tall?: boolean }) {
  return (
    <header className={`dark-surface luxe-hero relative isolate overflow-hidden text-ivory ${tall ? "min-h-[70vh]" : "min-h-[44vh]"} flex items-end`}>
      <div aria-hidden className={`absolute inset-0 -z-[1] tone-${tone}`} />
      <div aria-hidden className="grain" />
      <div className="wrap relative w-full pb-12 pt-32 sm:pb-16">
        <span aria-hidden className="mb-6 block h-px w-16 bg-bronze" />
        <h1 className="hero-in max-w-4xl text-5xl sm:text-7xl">{title}</h1>
        {lede && <p className="hero-in hero-in-2 mt-5 max-w-xl text-lg text-ivory/80">{lede}</p>}
      </div>
    </header>
  );
}
