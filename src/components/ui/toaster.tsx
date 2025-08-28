// src/components/ui/toaster.tsx
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-[280px] max-w-[360px] rounded-lg border p-3 shadow-lg bg-white ${
            t.variant === "destructive" ? "border-red-300" : "border-gray-200"
          }`}
        >
          {t.title && <div className="font-semibold">{t.title}</div>}
          {t.description && (
            <div className="text-sm text-gray-600">{t.description}</div>
          )}
          <button
            onClick={() => dismiss(t.id)}
            className="text-xs text-gray-500 hover:text-gray-800 mt-2"
          >
            Fechar
          </button>
        </div>
      ))}
    </div>
  );
}
