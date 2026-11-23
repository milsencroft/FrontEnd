"use client";
import { useEffect, useRef } from "react";

/** Popup dialog built on the native <dialog>: focus is trapped, Escape closes it, and it works on small and folded screens. */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }} aria-labelledby="modal-title"
      className="m-auto w-[min(42rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto surface-flat p-0 text-charcoal backdrop:bg-charcoal/50">
      {open && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="modal-title" className="text-2xl">{title}</h2>
            <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">Close</button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}
