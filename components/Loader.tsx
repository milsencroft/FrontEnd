/* eslint-disable @next/next/no-img-element */
/** Branded loading state: the monogram breathes above a thin brass line. */
export function Loader({ label = "Loading", full = false }: { label?: string; full?: boolean }) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-6 ${full ? "min-h-[60vh]" : "py-16"}`}>
      <img src="/logo.png" alt="" width={72} height={72} className="loader-logo h-[72px] w-[72px]" />
      <span aria-hidden className="loader-line" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
