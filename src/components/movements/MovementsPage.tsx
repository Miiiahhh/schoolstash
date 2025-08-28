// src/components/movements/MovementsPage.tsx
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/common/Modal";
import { NewMovementModal } from "@/components/movements/NewMovementModal";

type Movement = {
  id: string;
  item_name: string;
  type: "in" | "out";
  qty: number;
  note: string | null;
  created_at: string | null;
};

async function fetchMovements(kind: "all" | "in" | "out") {
  let q = supabase
    .from("movements")
    .select("id, item_name, type, qty, note, created_at")
    .order("created_at", { ascending: false });

  if (kind !== "all") q = q.eq("type", kind);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Movement[];
}

export function MovementsPage() {
  const [kind, setKind] = React.useState<"all" | "in" | "out">("all");
  const [openNew, setOpenNew] = React.useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["movements", { kind }],
    queryFn: () => fetchMovements(kind),
    staleTime: 10_000,
  });

  React.useEffect(() => {
    const ch = supabase
      .channel("rt-movements")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "movements" },
        () => queryClient.invalidateQueries({ queryKey: ["movements"] })
      )
      .subscribe();
    return () => void supabase.removeChannel(ch);
  }, [queryClient]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Movimentações</h1>

        <div className="flex items-center gap-2">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas</option>
            <option value="in">Entradas</option>
            <option value="out">Saídas</option>
          </select>
          <button
            onClick={() => refetch()}
            className="h-10 rounded-lg bg-slate-700 px-4 text-white hover:opacity-90"
          >
            {isFetching ? "Atualizando..." : "Atualizar"}
          </button>
          <button
            onClick={() => setOpenNew(true)}
            className="h-10 rounded-lg bg-primary px-4 text-white hover:opacity-90"
          >
            Nova Movimentação
          </button>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <ErrorMessage message={(error as any)?.message ?? "Erro ao carregar"} />
        ) : !data || data.length === 0 ? (
          <Empty message="Nenhuma movimentação encontrada." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b">
                <th className="py-2">Item</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Qtd</th>
                <th className="py-2">Observação</th>
                <th className="py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.id} className="border-b last:border-none">
                  <td className="py-2 font-medium">{m.item_name}</td>
                  <td className="py-2">
                    {m.type === "in" ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        Entrada
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">
                        Saída
                      </span>
                    )}
                  </td>
                  <td className="py-2">{m.qty}</td>
                  <td className="py-2">{m.note ?? "-"}</td>
                  <td className="py-2">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="Nova Movimentação"
      >
        <NewMovementModal open={openNew} onClose={() => setOpenNew(false)} />
      </Modal>
    </section>
  );
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
