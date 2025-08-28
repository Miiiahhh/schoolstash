// src/lib/requestsApi.ts
import { supabase } from "@/lib/supabase";

/** Linha da tabela "requests" (ver SQL criado) */
export type RequestRow = {
  id: string;
  requester_id: string | null;       // auth.users.id
  requester: string | null;          // nome exibido (display)
  status: "pending" | "approved" | "denied";
  note: string | null;
  created_at: string;
};

/** Linha da tabela "request_items" */
export type RequestItemRow = {
  id: string;
  request_id: string;
  item_name: string;
  amount: number;
};

/** Lista pedidos visíveis ao usuário logado.
 *  RLS garante: admin vê todos; professor vê só os próprios. */
export async function listRequests(): Promise<RequestRow[]> {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as RequestRow[];
}

/** Itens de um pedido */
export async function listRequestItems(requestId: string): Promise<RequestItemRow[]> {
  const { data, error } = await supabase
    .from("request_items")
    .select("*")
    .eq("request_id", requestId);

  if (error) throw error;
  return (data ?? []) as RequestItemRow[];
}

/** Atualiza o status (apenas admin tem permissão via RLS) */
export async function setRequestStatus(
  id: string,
  status: "pending" | "approved" | "denied"
): Promise<void> {
  const { error } = await supabase
    .from("requests")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

/** Cria um pedido com 1..N itens.
 *  requester_id = usuário logado (auth.uid)
 *  requester    = nome amigável (email ou metadata.name)
 */
export async function createRequest(payload: {
  requester?: string; // opcional; se não vier, inferimos do auth user
  note?: string;
  items: { item_name: string; amount: number }[];
}): Promise<RequestRow> {
  if (!payload.items?.length) {
    throw new Error("Informe ao menos 1 item no pedido.");
  }

  // pega usuário atual (vai compor requester_id e nome exibido)
  const { data: udata, error: uerr } = await supabase.auth.getUser();
  if (uerr) throw uerr;
  const user = udata.user;
  if (!user) throw new Error("Usuário não autenticado.");

  const displayName =
    payload.requester ||
    (user.user_metadata?.name as string) ||
    (user.email ? user.email.split("@")[0] : "Professor");

  // 1) cria o pedido
  const { data: req, error: e1 } = await supabase
    .from("requests")
    .insert({
      requester_id: user.id,
      requester: displayName,
      note: payload.note ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (e1) throw e1;

  // 2) cria os itens vinculados ao pedido
  const rows = payload.items.map((it) => ({
    request_id: req.id,
    item_name: it.item_name,
    amount: Number(it.amount),
  }));

  const { error: e2 } = await supabase.from("request_items").insert(rows);
  if (e2) throw e2;

  return req as RequestRow;
}
