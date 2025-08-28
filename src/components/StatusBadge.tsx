// src/components/StatusBadge.tsx
import React from 'react';

type Status = 'pendente' | 'aceito' | 'rejeitado';

export default function StatusBadge({ status }: { status: Status }) {
  if (status === 'aceito') {
    return (
      <span className="badge badge-aceito" title="Pedido aceito">
        <span className="dot" />
        Aceito
      </span>
    );
  }
  if (status === 'rejeitado') {
    return (
      <span className="badge badge-rejeitado" title="Pedido rejeitado">
        <span className="dot" />
        Rejeitado
      </span>
    );
  }
  return (
    <span className="badge badge-pendente" title="Pedido pendente">
      <span className="dot" />
      Pendente
    </span>
  );
}
