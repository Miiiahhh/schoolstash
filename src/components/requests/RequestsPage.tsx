// src/components/requests/RequestsPage.tsx
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/common/Modal";
import { ReviewRequestModal } from "@/components/requests/ReviewRequestModal";

type Request = {
  id: string;
  professor: string;
  item_name: string;
  qty: number;
  status: "pending" | "approved" | "rejected";
  created_at: string | null;
};

async function fetchRequests(status: "all" | "pending" | "approved" | "rejected") {
  let q = supabase
    .from("requests")
    .select("id, professor, item_name, qty, status, created_at")
    .order("created_at", { ascending: false });

  if (status !== "all") q = q.eq("status", status);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Request[];
}

export function RequestsPage() {
  const [status, setStatus] =
    React.useState<"all" | "pending" | "approved" | "rejected">("all");
  const [openReview, setOpenReview] = React.useState(false);
  const [selected, setSelected] = React.useState<Request | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["requests", { status }],
    queryFn: () => fetchRequests(status),
    staleTime: 10_000,
  });

  React.useEffect(() => {
    const ch = supabase
      .channel("rt-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests" },
        () => queryClient.invalidateQueries({ queryKey: ["requests"] })
      )
      .subscribe();
    return () => void supabase.removeChannel(ch);
  }, [queryClient]);

  function openModalFor(r: Request) {
    setSelected(r);
    setOpenReview(true);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>
          <button
            onClick={() => refetch()}
            className="h-10 rounded-lg bg-slate-700 px-4 text-white hover:opacity-90"
          >
            {isFetching ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <ErrorMessage message={(error as any)?.message ?? "Erro ao carregar"} />
        ) : !data || data.length === 0 ? (
          <Empty message="Nenhum pedido encontrado." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b">
                <th className="py-2">Professor</th>
                <th className="py-2">Item</th>
                <th className="py-2">Qtd</th>
                <th className="py-2">Status</th>
                <th className="py-2">Criado em</th>
                <th className="py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b last:border-none">
                  <td className="py-2 font-medium">{r.professor}</td>
                  <td className="py-2">{r.item_name}</td>
                  <td className="py-2">{r.qty}</td>
                  <td className="py-2">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="py-2">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => openModalFor(r)}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                    >
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={openReview}
        onClose={() => setOpenReview(false)}
        title="Revisar Pedido"
        maxWidthClass="max-w-xl"
      >
        <ReviewRequestModal
          open={openReview}
          onClose={() => setOpenReview(false)}
          request={selected ?? undefined}
        />
      </Modal>
    </section>
  );
}

function StatusPill({ status }: { status: Request["status"] }) {
  const color =
    status === "pending"
      ? "bg-amber-100 text-amber-700"
      : status === "approved"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-rose-100 text-rose-700";
  const label =
    status === "pending" ? "Pendente" : status === "approved" ? "Aprovado" : "Rejeitado";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${color}`}>{label}</span>;
}

function Loading() {
  return <div className="py-8 text-center text-slate-500">Carregando…</div>;
}
function Empty({ message }: { message: string }) {
  return <div className="py-8 text-center text-slate-500">{message}</div>;
}
function ErrorMessage({ message }: { message: string }) {
  return <div className="py-8 text-center text-red-600">{message}</div>;
}
