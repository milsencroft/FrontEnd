import type { ReactNode } from "react";
import { Art } from "./Art";

/** Friendly empty state: an illustration, a plain sentence and an optional next step. */
export function Empty({ art, children, action }: { art: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="admin-empty" role="status">
      <span className="admin-badge" aria-hidden style={{ width: 96, height: 96 }}><Art name={art} size={60} /></span>
      <p className="max-w-xs text-charcoal/75">{children}</p>
      {action}
    </div>
  );
}
