import type { ReactNode } from "react";

/** Line illustrations for the admin area. Two tones: sage line, brass accent. Decorative only. */
const L = "rgb(var(--c-sage))";
const A = "rgb(var(--c-brass))";
const F = "rgb(var(--c-brass) / .14)";

const ART: Record<string, ReactNode> = {
  home: <><path d="M10 30 32 12l22 18" /><path d="M16 28v24h32V28" /><path d="M27 52V38h10v14" stroke={A} /><circle cx="46" cy="14" r="3" fill={F} stroke={A} /></>,
  orders: <><path d="M10 22 32 12l22 10v22L32 54 10 44z" fill={F} /><path d="M10 22l22 10 22-10M32 32v22" /><path d="M21 17l22 10" stroke={A} /></>,
  catalogue: <><path d="M26 8h12v8H26z" stroke={A} /><path d="M28 16v6c-9 3-14 9-14 17v11a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V39c0-8-5-14-14-17v-6" fill={F} /><path d="M22 38h20M22 45h20" /></>,
  stock: <><path d="M6 54h52M6 34h52" /><path d="M10 34V22h14v12M28 34V16h14v18M46 34V24h8v10" fill={F} /><path d="M12 54V42h18v12M36 54V42h16v12" stroke={A} /></>,
  coupons: <><path d="M8 18h48v10a4 4 0 0 0 0 8v10H8V36a4 4 0 0 0 0-8z" fill={F} /><path d="M40 18v28" strokeDasharray="3 3" stroke={A} /><path d="M18 30h14M18 36h9" /></>,
  media: <><rect x="8" y="12" width="48" height="40" rx="4" fill={F} /><circle cx="22" cy="26" r="5" stroke={A} /><path d="M8 44l14-12 12 10 8-6 14 12" /></>,
  reports: <><path d="M8 8v48h48" /><path d="M16 44l12-14 10 8 16-22" stroke={A} /><path d="M16 50V44M28 50V30M38 50V38M54 50V16" /><circle cx="54" cy="16" r="3" fill={F} stroke={A} /></>,
  notifications: <><path d="M32 10a14 14 0 0 0-14 14v10l-5 8h38l-5-8V24a14 14 0 0 0-14-14z" fill={F} /><path d="M26 48a6 6 0 0 0 12 0" stroke={A} /><path d="M32 6v4" /></>,
  newsletter: <><rect x="8" y="14" width="48" height="36" rx="4" fill={F} /><path d="M8 18l24 18 24-18" stroke={A} /></>,
  content: <><path d="M14 8h28l10 10v38H14z" fill={F} /><path d="M42 8v10h10" /><path d="M22 28h22M22 36h22M22 44h12" /><path d="M44 52l10-10 4 4-10 10-5 1z" stroke={A} /></>,
  society: <><circle cx="32" cy="26" r="14" fill={F} /><circle cx="32" cy="26" r="9" stroke={A} /><path d="M24 38l-6 18 14-7 14 7-6-18" /></>,
  launches: <><path d="M10 50c4-18 14-32 36-38 0 22-10 34-28 40z" fill={F} /><circle cx="38" cy="26" r="4" stroke={A} /><path d="M14 40l-6 4M24 52l-4 6M10 50l-4 2" stroke={A} /></>,
  couriers: <><path d="M6 20h30v24H6zM36 28h12l10 10v6H36z" fill={F} /><circle cx="18" cy="46" r="5" stroke={A} /><circle cx="46" cy="46" r="5" stroke={A} /></>,
  settings: <><circle cx="32" cy="32" r="8" stroke={A} /><path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M49 15l-6 6M21 43l-6 6" /><circle cx="32" cy="32" r="18" fill={F} /></>,
  staff: <><circle cx="24" cy="22" r="8" fill={F} /><path d="M8 52c0-10 7-16 16-16s16 6 16 16" /><circle cx="46" cy="24" r="6" stroke={A} /><path d="M44 38c8 0 12 5 12 14" stroke={A} /></>,
};

export type ArtName = keyof typeof ART;

export function Art({ name, size = 28, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke={L} strokeWidth={size > 48 ? 1.6 : 2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      {ART[name] ?? ART.home}
    </svg>
  );
}

/** A soft round badge around a larger illustration. */
export function ArtBadge({ name, size = 88 }: { name: string; size?: number }) {
  return <span aria-hidden className="admin-badge" style={{ width: size + 24, height: size + 24 }}><Art name={name} size={size} /></span>;
}

/** Wide decorative scene for the dashboard: a flacon among leaves and rain. */
export function Scene() {
  return (
    <svg viewBox="0 0 320 160" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="h-full w-full">
      <circle cx="232" cy="70" r="58" fill={F} />
      <path d="M8 140c30-6 50-22 70-50 14 26 34 42 62 50" stroke={L} strokeWidth="1.6" />
      <path d="M40 140c8-22 22-38 40-50M100 140c-4-18-12-34-22-50" stroke={L} strokeWidth="1.2" opacity=".6" />
      <g stroke={A} strokeWidth="1.6">
        <path d="M222 30h20v12h-20z" />
        <path d="M226 42v8c-14 4-22 14-22 28v34a6 6 0 0 0 6 6h44a6 6 0 0 0 6-6V78c0-14-8-24-22-28v-8" fill={F} />
        <path d="M212 88h40M212 100h40" opacity=".7" />
      </g>
      <g stroke={L} strokeWidth="1.2" opacity=".55">
        <path d="M150 20l-4 12M170 8l-4 12M190 26l-4 12M290 14l-4 12M300 50l-4 12M278 36l-4 12" />
      </g>
      <path d="M0 148h320" stroke={L} strokeWidth="1" opacity=".4" />
    </svg>
  );
}
