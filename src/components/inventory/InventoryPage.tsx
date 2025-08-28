// src/components/inventory/InventoryPage.tsx
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/common/Modal";
import { NewItemModal } from "@/components/inventory/NewItemModal";

type InventoryItem = {
  id: string;
  name: string;
  category: string | null;
  qty: number;
  min_qty: number | null;
  updated_at: string | null;
};

async function fetchInventory(search: string) {
  let q = supabase.from("inventory_items").select("*").order("name");
  if (search.trim()) {
    q = q.ilike("name", `%${search}%`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as InventoryItem[];
}

export function InventoryPage() {
  const [search, setSearch] = React.useState("");
  const [openNew, setOpenNew] = React.useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["inventory", { search }],
    queryFn: () => fetchInventory(search),
    staleTime: 10_000,
  });

  React.useEffect(() => {
    const ch = supabase
      .channel("rt-inventory")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_items" },
        () => queryClient.invalidateQueries({ queryKey: ["inventory"] })
      )
      .subscribe();
    return () => void supabase.removeChannel(ch);
  }, [queryClient]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Inventário</h1>

        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar item..."
            className="h-10 w-64 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
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
            Novo Item
          </button>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <ErrorMessage message={(error as any)?.message ?? "Erro ao carregar"} />
        ) : !data || data.length === 0 ? (
          <Empty message="Nenhum item encontrado." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b">
                <th className="py-2">Nome</th>
                <th className="py-2">Categoria</th>
                <th className="py-2">Qtd</th>
                <th className="py-2">Mín.</th>
                <th className="py-2">Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {data.map((it) => (
                <tr key={it.id} className="border-b last:border-none">
                  <td className="py-2 font-medium">{it.name}</td>
                  <td className="py-2">{it.category ?? "-"}</td>
                  <td className="py-2">{it.qty}</td>
                  <td className="py-2">{it.min_qty ?? "-"}</td>
                  <td className="py-2">
                    {it.updated_at ? new Date(it.updated_at).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={openNew} onClose={() => setOpenNew(false)} title="Novo Item">
        <NewItemModal open={openNew} onClose={() => setOpenNew(false)} />
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
