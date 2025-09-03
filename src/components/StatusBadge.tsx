// src/components/StatusBadge.tsx
import React from "react";

export type OrderStatus = "pendente" | "aceito" | "rejeitado";

type Props = {
  value: OrderStatus | string;         // aceita string para ser resiliente
  size?: "sm" | "md";                  // tamanho opcional
  titlePrefix?: string;                // tooltip opcional
};

const LABEL: Record<OrderStatus, string> = {
  pendente: "pendente",
  aceito: "aceito",
  rejeitado: "rejeitado",
};

function toStatus(v: string): OrderStatus | null {
  const s = (v || "").toLowerCase().trim() as OrderStatus;
  return s === "pendente" || s === "aceito" || s === "rejeitado" ? s : null;
}

export default function StatusBadge({ value, size = "md", titlePrefix }: Props) {
  const s = toStatus(String(value));
  if (!s) {
    // fallback defensivo (ex.: status novo no banco)
    return (
      <span className="ss-badge" title={`${titlePrefix ?? "status"}: ${value}`}>
        {String(value || "—")}
      </span>
    );
  }

  const cls =
    s === "aceito"
      ? "ss-badge ss-badge--success"
      : s === "rejeitado"
      ? "ss-badge ss-badge--danger"
      : "ss-badge ss-badge--warn";

  const style =
    size === "sm"
      ? { fontSize: 12, padding: "4px 8px", textTransform: "capitalize" as const }
      : { textTransform: "capitalize" as const };

  return (
    <span className={cls} style={style} title={`${titlePrefix ?? "status"}: ${LABEL[s]}`}>
      {LABEL[s]}
    </span>
  );
}
