// src/lib/statsApi.ts
import { supabase } from "@/lib/supabase";

export type DashboardStats = {
  totalItems: number;
  pendingRequests: number;
  todayMovements: number;
  admins: number;
  professors: number;
  students: number;
  totalUsers: number;
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // Chama a função SQL: public.get_dashboard_stats()
  const { data, error } = await supabase.rpc("get_dashboard_stats");

  if (error) {
    console.error("get_dashboard_stats error:", error);
    // Sem mock – retorna zeros
    return {
      totalItems: 0,
      pendingRequests: 0,
      todayMovements: 0,
      admins: 0,
      professors: 0,
      students: 0,
      totalUsers: 0,
    };
  }

  const safe = (n: any) => (typeof n === "number" && isFinite(n) ? n : 0);

  return {
    totalItems: safe((data as any)?.totalItems),
    pendingRequests: safe((data as any)?.pendingRequests),
    todayMovements: safe((data as any)?.todayMovements),
    admins: safe((data as any)?.admins),
    professors: safe((data as any)?.professors),
    students: safe((data as any)?.students),
    totalUsers: safe((data as any)?.totalUsers),
  };
}
