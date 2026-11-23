"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Flacon } from "@/components/Flacon";
import { smooth, useScrollProgress } from "@/lib/useScrollProgress";

const PLACES = [
  { name: "Mazha", place: "Kerala", line: "Mazha is the Malayalam word for rain.", tone: "stone" as const },
  { name: "Seiran", place: "Japan", line: "Seiran is the Japanese word for a fresh breeze in early summer.", tone: "bronze" as const },
];

/** The memorable moment: scrolling travels from Kerala to Japan while the page changes colour, scent and place. */
export function Journey() {
  const outer = useRef<HTMLElement>(null);
  const bg2 = useRef<HTMLDivElement>(null), k = useRef<HTMLDivElement>(null), j = useRef<HTMLDivElement>(null);
  const kf = useRef<HTMLDivElement>(null), jf = useRef<HTMLDivElement>(null), bar = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);
  useEffect(() => { setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);

  const onP = useCallback((p: number) => {
    const t = smooth(0.38, 0.62, p);
    if (bg2.current) bg2.current.style.opacity = String(t);
    const put = (el: HTMLElement | null, show: number, dir: number) => { if (el) { el.style.opacity = String(show); el.style.transform = `translateY(${(1 - show) * 28 * dir}px)`; } };
    put(k.current, 1 - smooth(0.3, 0.46, p), -1); put(j.current, smooth(0.54, 0.7, p), 1);
    put(kf.current, 1 - smooth(0.3, 0.5, p), -1); put(jf.current, smooth(0.5, 0.7, p), 1);
    if (bar.current) bar.current.style.transform = `scaleX(${p})`;
  }, []);
  useScrollProgress(outer, onP);

  if (still) {
    return (
      <section aria-label="Kerala and Japan" className="text-ivory">
        {PLACES.map((x, i) => (
          <div key={x.name} className={`${i === 0 ? "bg-kerala" : "bg-japan"} py-20`}>
            <div className="wrap grid items-center gap-10 md:grid-cols-2">
              <div><p className="text-sm text-ivory/70">{x.place}</p><h2 className="mt-2 text-6xl">{x.name}</h2><p className="mt-4 text-lg text-ivory/85">{x.line}</p></div>
              <Flacon tone={x.tone} label={x.name} />
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={outer} aria-label="Kerala and Japan" className="relative h-[320svh] bg-kerala text-ivory">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={bg2} aria-hidden className="absolute inset-0 bg-japan" style={{ opacity: 0 }} />
        <div className="wrap relative grid h-full grid-rows-[1fr_auto] pt-28 pb-10">
          <div className="grid items-center gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative order-2 min-h-[210px] md:order-1">
              {PLACES.map((x, i) => (
                <div key={x.name} ref={i === 0 ? k : j} className="absolute inset-0 flex flex-col justify-center" style={{ opacity: i === 0 ? 1 : 0 }}>
                  <p className="text-sm text-ivory/70">{x.place}</p>
                  <h2 className="mt-2 text-6xl sm:text-8xl">{x.name}</h2>
                  <p className="mt-4 max-w-md text-lg text-ivory/85">{x.line}</p>
                  <div className="mt-6"><Link href="/shop" className="btn-light">Shop {x.name}</Link></div>
                </div>
              ))}
            </div>
            <div className="relative order-1 mx-auto h-[38svh] w-full max-w-[300px] md:order-2 md:h-[56svh]">
              {PLACES.map((x, i) => (
                <div key={x.name} ref={i === 0 ? kf : jf} className="absolute inset-0 flex items-center justify-center" style={{ opacity: i === 0 ? 1 : 0 }}>
                  <Flacon tone={x.tone} label={x.name} interactive={false} className="h-full w-full [&>div]:h-full [&_svg]:h-full" />
                </div>
              ))}
            </div>
          </div>
          <div aria-hidden className="flex items-center gap-4 text-sm text-ivory/70">
            <span>Kerala</span>
            <div className="h-px flex-1 bg-ivory/25"><div ref={bar} className="h-px origin-left bg-ivory" style={{ transform: "scaleX(0)" }} /></div>
            <span>Japan</span>
          </div>
        </div>
      </div>
    </section>
  );
}
