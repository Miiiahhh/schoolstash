import * as React from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  /** ex.: "max-w-xl", "max-w-2xl" */
  maxWidthClass?: string;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidthClass = "max-w-lg",
}: ModalProps) {
  React.useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      aria-modal
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* card */}
      <div
        className={`relative z-10 w-[92vw] ${maxWidthClass} rounded-xl bg-white shadow-xl`}
      >
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold">{title ?? "Janela"}</h3>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
            title="Fechar"
          >
            ×
          </button>
        </header>

        <div className="px-4 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
