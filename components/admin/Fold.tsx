import type { ReactNode } from "react";

/** A section that can be folded away, so a page shows one thing at a time. */
export function Fold({ title, hint, open, children }: { title: string; hint?: string; open?: boolean; children: ReactNode }) {
  return (
    <details className="admin-fold card" open={open}>
      <summary><span><span className="block font-serif text-xl">{title}</span>{hint && <span className="block text-sm text-charcoal/70">{hint}</span>}</span><span aria-hidden className="admin-fold-caret" /></summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
