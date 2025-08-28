// src/components/movements/NewMovementModal.tsx
import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function NewMovementModal({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [itemName, setItemName] = React.useState("");
  const [type, setType] = React.useState<"in" | "out">("in");
  const [qty, setQty] = React.useState<number>(1);
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!itemName.trim()) {
      alert("Informe o nome do item.");
      return;
    }
    if (qty <= 0) {
      alert("Quantidade deve ser maior que zero.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("movements").insert({
        item_name: itemName.trim(),
        type,
        qty,
        note: note.trim() || null,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;

      // atualiza lista, KPIs e inventário (se você quiser automatizar estoque, precisa lógica adicional)
      qc.invalidateQueries({ queryKey: ["movements"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });

      setItemName("");
      setType("in");
      setQty(1);
      setNote("");
      onClose();
      alert("Movimentação registrada com sucesso!");
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? "Não foi possível registrar a movimentação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Item *</span>
          <input
            className="h-10 rounded-lg border px-3"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Ex.: Caderno"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Tipo *</span>
            <select
              className="h-10 rounded-lg border px-3"
              value={type}
              onChange={(e) => setType(e.target.value as "in" | "out")}
            >
              <option value="in">Entrada</option>
              <option value="out">Saída</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Quantidade *</span>
            <input
              type="number"
              className="h-10 rounded-lg border px-3"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              min={1}
            />
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Observação</span>
          <textarea
            className="min-h-[80px] rounded-lg border px-3 py-2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: Ajuste de estoque"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
