// src/components/Toast.tsx
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  open: boolean;
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export default function Toast({ open, message, type = 'success', onClose }: ToastProps) {
  // Fecha sozinho após 4s
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`toast ${type === 'success' ? 'toast--success' : type === 'error' ? 'toast--error' : 'toast--info'}`}
      role="status"
      aria-live="polite"
      onClick={onClose}
      title="Clique para fechar"
    >
      <span className="toast-dot" />
      <span className="toast-text">{message}</span>
    </div>
  );
}
