// src/components/inventory/NewItemModal.tsx
import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function NewItemModal({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [qty, setQty] = React.useState<number>(0);
  const [minQty, setMinQty] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Informe o nome do item.");
      return;
    }
    if (qty < 0) {
      alert("Quantidade não pode ser negativa.");
      return;
    }
    if (minQty < 0) {
      alert("Mínimo não pode ser negativo.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("inventory_items").insert({
        name: name.trim(),
        category: category.trim() || null,
        qty,
        min_qty: minQty,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      // atualiza lista e KPIs
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });

      // limpa e fecha
      setName("");
      setCategory("");
      setQty(0);
      setMinQty(0);
      onClose();
      alert("Item cadastrado com sucesso!");
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? "Não foi possível cadastrar o item.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Nome *</span>
          <input
            className="h-10 rounded-lg border px-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Caderno"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Categoria</span>
          <input
            className="h-10 rounded-lg border px-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ex.: Papelaria"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Quantidade *</span>
            <input
              type="number"
              className="h-10 rounded-lg border px-3"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              min={0}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Mínimo</span>
            <input
              type="number"
              className="h-10 rounded-lg border px-3"
              value={minQty}
              onChange={(e) => setMinQty(Number(e.target.value))}
              min={0}
            />
          </label>
        </div>
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
