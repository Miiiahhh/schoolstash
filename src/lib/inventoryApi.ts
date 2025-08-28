// src/lib/inventoryApi.ts
import { supabase } from "@/lib/supabase";

export type InventoryRow = {
  id: string;
  name: string;
  category: string;
  qty: number;
  min_qty: number;
  updated_at: string;
};

export async function listInventory(): Promise<InventoryRow[]> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as InventoryRow[];
}

export async function createItem(input: {
  name: string;
  category: string;
  qty: number;
  min_qty: number;
}) {
  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      name: input.name,
      category: input.category,
      qty: input.qty,
      min_qty: input.min_qty,
    })
    .select()
    .single();
  if (error) throw error;
  return data as InventoryRow;
}

/**
 * Atualiza quantidade chamando a RPC 'adjust_inventory' (atômica)
 * delta > 0 = entrada | delta < 0 = saída
 */
export async function updateQty(
  itemId: string,
  delta: number,
  userName: string,
  note?: string
) {
  const { error } = await supabase.rpc("adjust_inventory", {
    p_item_id: itemId,
    p_delta: delta,
    p_user: userName,
    p_note: note ?? null,
  });
  if (error) throw error;
}

export type MovementRow = {
  id: string;
  item_id: string;
  item_name: string;
  type: "in" | "out";
  amount: number;
  user_name: string;
  note: string | null;
  created_at: string;
};

export async function listMovements(): Promise<MovementRow[]> {
  const { data, error } = await supabase
    .from("movements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as MovementRow[];
}
