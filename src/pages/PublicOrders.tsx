import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import StatusBadge from "../components/StatusBadge";

type Status = "pendente" | "aceito" | "rejeitado";

type PublicOrder = {
  id: string;
  created_at: string;
  status: Status;
  requester_name?: string | null;
  item_name?: string | null;
};

const STATUS_PILLS: Array<{ key: "todos" | Status; label: string }> = [
  { key: "todos", label: "Todos" },
  { key: "pendente", label: "Pendentes" },
  { key: "aceito", label: "Aceitos" },
  { key: "rejeitado", label: "Rejeitados" },
];

export default function PublicOrders() {
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | Status>("todos");

  // Carrega inicial
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, status, requester_name, item_name")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!mounted) return;
      if (error) {
        console.error(error);
        setError(error.message ?? "Erro ao carregar pedidos.");
        setOrders([]);
      } else {
        const normalized = (data ?? []).map((o: any) => ({
          id: String(o.id),
          created_at: o.created_at,
          status: (o.status as Status) ?? "pendente",
          requester_name: o.requester_name ?? null,
          item_name: o.item_name ?? null,
        })) as PublicOrder[];
        setOrders(normalized);
      }
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("public:orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => {
            const next = [...prev];
            const row = payload.new as any;
            const oldRow = payload.old as any;

            if (payload.eventType === "INSERT") {
              next.unshift({
                id: String(row.id),
                created_at: row.created_at,
                status: (row.status as Status) ?? "pendente",
                requester_name: row.requester_name ?? null,
                item_name: row.item_name ?? null,
              });
              return dedupe(next);
            }

            if (payload.eventType === "UPDATE") {
              const idx = next.findIndex((o) => o.id === String(row.id));
              if (idx >= 0) {
                next[idx] = {
                  id: String(row.id),
                  created_at: row.created_at,
                  status: (row.status as Status) ?? "pendente",
                  requester_name: row.requester_name ?? null,
                  item_name: row.item_name ?? null,
                };
              }
              return next;
            }

            if (payload.eventType === "DELETE") {
              return next.filter((o) => o.id !== String(oldRow?.id));
            }

            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtro + busca
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders
      .filter((o) => (filter === "todos" ? true : o.status === filter))
      .filter((o) => {
        if (!term) return true;
        const hay = [
          o.requester_name ?? "",
          o.item_name ?? "",
          o.status ?? "",
          new Date(o.created_at).toLocaleString(),
          o.id, // ainda entra na busca, mesmo que visualmente esteja compacto
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      });
  }, [orders, filter, search]);

  return (
    <div className="container" style={{ padding: 16, display: "grid", gap: 16 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="ss-title">Pedidos (público)</h1>
      </header>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div className="segmented">
          {STATUS_PILLS.map((p) => (
            <button
              key={p.key}
              className={`ss-pill ${filter === p.key ? "active" : ""}`}
              onClick={() => setFilter(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto" }} />
        <input
          className="ss-input"
          placeholder="Buscar por nome, item, status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 260 }}
        />
      </div>

      {/* Estados */}
      {loading && <div className="ss-card">Carregando pedidos…</div>}
      {error && !loading && <div className="ss-card ss-card--danger">Erro: {error}</div>}

      {/* Lista */}
      {!loading && !error && (
        <div className="ss-list" style={{ display: "grid", gap: 8 }}>
          {filtered.length === 0 ? (
            <div className="ss-card">Nenhum pedido encontrado.</div>
          ) : (
            filtered.map((o) => <OrderRow key={o.id} o={o} />)
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Row ---------- */

function tinyId(id: string) {
  if (!id) return "";
  // exibe só começo e fim: #344b…6594
  return `#${id.slice(0, 4)}…${id.slice(-4)}`;
}

function OrderRow({ o }: { o: PublicOrder }) {
  const created = new Date(o.created_at);
  return (
    <div
      className="ss-card"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        {/* DATA (topo discreto) */}
        <span className="ss-dim">
          {created.toLocaleDateString()} {created.toLocaleTimeString()}
        </span>

        {/* LINHA PRINCIPAL: solicitante / item */}
        {(o.requester_name || o.item_name) && (
          <div className="order-main">
            {o.requester_name ? <strong>{o.requester_name}</strong> : null}
            {o.requester_name && o.item_name ? " • " : ""}
            {o.item_name ? <span>Item: {o.item_name}</span> : null}
          </div>
        )}

        {/* MICRO-ID (rodapé bem sutil) */}
        <span className="ss-microid">{tinyId(o.id)}</span>
      </div>

      {/* STATUS à direita */}
      <StatusBadge value={o.status} />
    </div>
  );
}

/* ---------- Helpers ---------- */
function dedupe(arr: PublicOrder[]) {
  const seen = new Set<string>();
  const out: PublicOrder[] = [];
  for (const it of arr) {
    if (!seen.has(it.id)) {
      seen.add(it.id);
      out.push(it);
    }
  }
  return out;
}
