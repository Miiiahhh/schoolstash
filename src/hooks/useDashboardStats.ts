// src/hooks/useDashboardStats.ts
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, DashboardStats } from "@/lib/statsApi";

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchOnWindowFocus: false,
    staleTime: 30_000, // 30s
  });
}
