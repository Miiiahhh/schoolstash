// src/components/dashboard/Dashboard.tsx
import React from "react";

type Stats = {
  totalItems: number;
  pendingRequests: number;
  todayMovements: number;
  professors: number;
};

type Props = {
  stats?: Stats;
  loading?: boolean;
};

function StatCard({
  title,
  value,
  accent = "text-slate-900",
}: {
  title: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-slate-700 text-xl font-semibold">{title}</div>
      <div className={`mt-2 text-3xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

export function Dashboard({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-slate-200 bg-white p-6 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const n = (v?: number) => (typeof v === "number" ? v : 0);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total de Itens" value={n(stats?.totalItems)} />
      <StatCard title="Professores Ativos" value={n(stats?.professors)} />
      <StatCard
        title="Pedidos Pendentes"
        value={n(stats?.pendingRequests)}
        accent="text-amber-600"
      />
      <StatCard
        title="Movimentações Hoje"
        value={n(stats?.todayMovements)}
        accent="text-emerald-600"
      />
    </div>
  );
}
