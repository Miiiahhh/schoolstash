// src/types.ts
export type UUID = string;
export type OrderStatus = 'pendente' | 'aceito' | 'rejeitado';

export interface Order {
  id: UUID;
  created_at: string;
  requester_name: string;
  item_name: string;
  quantity: number;
  notes: string | null;
  status: OrderStatus;
  notify_email: string | null;     // <— NOVO
}

export interface Item {
  id: UUID;
  created_at: string;
  updated_at: string;
  name: string;
  category: string;
  quantity: number;
  min_stock: number;
  location: string | null;
  notes: string | null;
}

export interface StockMove {
  id: UUID;
  created_at: string;
  item_id: UUID;
  qty_change: number;
  reason: string | null;
  actor: UUID | null;
}
