// src/components/requests/ReviewRequestModal.tsx
import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

type Request = {
  id: string;
  professor: string;
  item_name: string;
  qty: number;
  status: "pending" | "approved" | "rejected";
  created_at: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  request?: Request | null;
};

export function ReviewRequestModal({ open, onClose, request }: Props) {
  const qc = useQueryClient();
  const [loading, setLoading] = React.useState(false);

  if (!open || !request) return null;

  async function updateStatus(newStatus: "approved" | "rejected") {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("requests")
        .update({ status: newStatus })
        .eq("id", request.id);
      if (error) throw error;

      // invalida lista e KPIs
      qc.invalidateQueries({ queryKey: ["requests"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });

      onClose();
      alert(`Pedido ${newStatus === "approved" ? "aprovado" : "rejeitado"}!`);
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? "Não foi possível atualizar o pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border bg-slate-50 p-4 text-sm">
        <div><b>Professor:</b> {request.professor}</div>
        <div><b>Item:</b> {request.item_name}</div>
        <div><b>Quantidade:</b> {request.qty}</div>
        <div>
          <b>Data:</b>{" "}
          {request.created_at
            ? new Date(request.created_at).toLocaleString()
            : "-"}
        </div>
        <div><b>Status atual:</b> {request.status}</div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => onClose()}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          onClick={() => updateStatus("rejected")}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
          disabled={loading}
        >
          Rejeitar
        </button>
        <button
          onClick={() => updateStatus("approved")}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
          disabled={loading}
        >
          Aprovar
        </button>
      </div>
    </div>
  );
}
