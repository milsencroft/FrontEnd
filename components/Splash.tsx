/* eslint-disable @next/next/no-img-element */
/** Opening moment on every full page load. Pure CSS: it fades itself out, so it can never get stuck. */
export function Splash() {
  return (
    <div aria-hidden className="splash">
      <img src="/logo.png" alt="" width={120} height={120} className="splash-logo h-[120px] w-[120px]" />
      <span className="splash-line" />
      <p className="splash-name">Milsen &amp; Croft</p>
    </div>
  );
}
