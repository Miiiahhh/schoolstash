// src/hooks/useDashboardRealtime.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useDashboardRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory_items" }, () =>
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, () =>
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "movements" }, () =>
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () =>
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
