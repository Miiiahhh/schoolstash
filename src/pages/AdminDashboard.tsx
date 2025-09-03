// src/pages/AdminDashboard.tsx
import useAdminStats from "../hooks/useAdminStats";

function StatCard({ title, value, hint }: { title: string; value: number | string; hint?: string }) {
  return (
    <div className="ss-card" style={{ padding: 16 }}>
      <div className="ss-dim" style={{ fontSize: 12, marginBottom: 6 }}>{title}</div>
      <div style={{ fontWeight: 800, fontSize: 28, lineHeight: 1 }}>{value}</div>
      {hint ? <div className="ss-dim" style={{ marginTop: 6, fontSize: 12 }}>{hint}</div> : null}
    </div>
  );
}

export default function AdminDashboard() {
  const state = useAdminStats(30000);
  const updatedAt = new Date().toLocaleTimeString();

  if (state.loading) {
    return (
      <div className="container" style={{ padding: 16 }}>
        <h1 className="ss-title">Dashboard</h1>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ss-card skel" style={{ height: 90 }} />
          ))}
        </div>
      </div>
    );
  }

  const { stats, error } = state;

  return (
    <div className="container" style={{ padding: 16, display: "grid", gap: 16 }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 className="ss-title">Dashboard</h1>
        <small className="ss-dim">Atualizado às {updatedAt}</small>
        {error && <span className="ss-badge ss-badge--danger">Erro: {error}</span>}
      </header>

      <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <StatCard title="Pedidos pendentes" value={stats.pendingOrders} />
        <StatCard title="Pedidos aceitos" value={stats.acceptedOrders} />
        <StatCard title="Pedidos rejeitados" value={stats.rejectedOrders} />
        <StatCard title="Pedidos (7 dias)" value={stats.last7DaysOrders} />
        <StatCard title="Pedidos (total)" value={stats.totalOrders} />
        <StatCard title="Itens (catalogados)" value={stats.totalItems} />
        <StatCard title="Admins" value={stats.totalAdmins} />
      </section>
    </div>
  );
}
