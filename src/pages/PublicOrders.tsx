import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | Status>("todos");
  const [error, setError] = useState<string | null>(null);

  // carga inicial
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("orders") // se preferir, troque por uma VIEW pública: "orders_public"
        .select("id, created_at, status, requester_name, item_name")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!mounted) return;

      if (error) {
        console.error("Erro ao carregar pedidos públicos:", error);
        setError(error.message ?? "Erro ao carregar pedidos.");
        setOrders([]);
      } else {
        const normalized = (data ?? []).map((o: any) => ({
          id: String(o.id),
          created_at: o.created_at,
          status: o.status as Status,
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

  // realtime
  useEffect(() => {
    const channel = supabase
      .channel("public:orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => {
            const next = [...prev]; // <— fix do typo
            const row = payload.new as any;
            const oldRow = payload.old as any;

            if (payload.eventType === "INSERT") {
              next.unshift({
                id: String(row.id),
                created_at: row.created_at,
                status: row.status as Status,
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
                  status: row.status as Status,
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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders
      .filter((o) => (filter === "todos" ? true : o.status === filter))
      .filter((o) => {
        if (!term) return true;
        const hay = [
          o.id,
          o.requester_name ?? "",
          o.item_name ?? "",
          o.status ?? "",
          new Date(o.created_at).toLocaleString(),
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

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div className="segmented">
          {STATUS_PILLS.map((p) => (
            <button
              key={p.key}
              className={`ss-pill ${filter === p.key ? "is-active" : ""}`}
              onClick={() => setFilter(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto" }} />
        <input
          className="ss-input"
          placeholder="Buscar por ID, nome, item, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 260 }}
        />
      </div>

      {loading && <div className="ss-card">Carregando pedidos…</div>}
      {error && !loading && <div className="ss-card ss-card--danger">Erro: {error}</div>}

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

function statusBadge(s: Status) {
  const map: Record<Status, string> = {
    pendente: "ss-badge ss-badge--warn",
    aceito: "ss-badge ss-badge--success",
    rejeitado: "ss-badge ss-badge--danger",
  };
  return <span className={map[s] ?? "ss-badge"}>{s}</span>;
}

function OrderRow({ o }: { o: PublicOrder }) {
  const created = new Date(o.created_at);
  return (
    <div className="ss-card" style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "grid" }}>
        <strong className="ss-mono">#{o.id}</strong>
        <span className="ss-dim">
          {created.toLocaleDateString()} {created.toLocaleTimeString()}
        </span>
        {(o.requester_name || o.item_name) && (
          <span className="ss-dim">
            {o.requester_name ? `Solicitante: ${o.requester_name}` : ""}
            {o.requester_name && o.item_name ? " • " : ""}
            {o.item_name ? `Item: ${o.item_name}` : ""}
          </span>
        )}
      </div>
      {statusBadge(o.status)}
    </div>
  );
}
