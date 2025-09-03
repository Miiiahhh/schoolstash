// src/hooks/useAdminStats.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type AdminStats = {
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  rejectedOrders: number;
  last7DaysOrders: number;
  totalItems: number;
  totalAdmins: number;
};

type State =
  | { loading: true; error: null; stats: null }
  | { loading: false; error: string | null; stats: AdminStats };

async function count(
  table: string,
  filter?: (q: ReturnType<typeof supabase.from> extends infer R
    ? R extends (name: string) => any
      ? ReturnType<R>
      : never
    : never) => any
) {
  // SELECT head:true com count:exact evita trazer linhas
  // @ts-ignore tipo generics do supabase client aqui não atrapalham
  let q = supabase.from(table).select("*", { head: true, count: "exact" });
  if (filter) q = filter(q);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

export default function useAdminStats(refreshMs = 30000): State {
  const [state, setState] = useState<State>({ loading: true, error: null, stats: null });

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const today = new Date();
        const d7 = new Date(today);
        d7.setDate(today.getDate() - 7);

        const [
          totalOrders,
          pendingOrders,
          acceptedOrders,
          rejectedOrders,
          last7DaysOrders,
          totalItems,
          totalAdmins,
        ] = await Promise.all([
          count("orders"),
          count("orders", (q) => q.eq("status", "pendente")),
          count("orders", (q) => q.eq("status", "aceito")),
          count("orders", (q) => q.eq("status", "rejeitado")),
          count("orders", (q) => q.gte("created_at", d7.toISOString())),
          count("items"),
          count("admins"), // usa a tabela public.admins
        ]);

        if (!alive) return;
        setState({
          loading: false,
          error: null,
          stats: {
            totalOrders,
            pendingOrders,
            acceptedOrders,
            rejectedOrders,
            last7DaysOrders,
            totalItems,
            totalAdmins,
          },
        });
      } catch (err: any) {
        console.error("admin stats error:", err);
        if (!alive) return;
        setState({ loading: false, error: err?.message ?? "Erro ao carregar", stats: {
          totalOrders: 0, pendingOrders: 0, acceptedOrders: 0, rejectedOrders: 0,
          last7DaysOrders: 0, totalItems: 0, totalAdmins: 0
        } });
      }
    }

    load();
    const t = setInterval(load, refreshMs);
    return () => { alive = false; clearInterval(t); };
  }, [refreshMs]);

  return state;
}
