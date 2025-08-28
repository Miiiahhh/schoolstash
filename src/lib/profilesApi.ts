// src/lib/profilesApi.ts
import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;                            // auth.users.id
  role: "admin" | "professor";           // controle de acesso
  display_name: string;                  // nome que aparece na UI
  subject: string | null;                // opcional (disciplina)
  created_at: string;
};

/**
 * Retorna o usuário da sessão atual (ou null).
 */
export async function getSessionUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("getSessionUser error:", error);
    return null;
  }
  return data.user ?? null;
}

/**
 * Busca o profile do usuário logado; se não existir, cria com role "professor".
 * Use após signIn/signUp para garantir que o perfil existe.
 */
export async function getOrCreateMyProfile(): Promise<Profile> {
  const me = await getSessionUser();
  if (!me) throw new Error("Sem usuário autenticado.");

  // tenta buscar
  const { data: found, error: e1 } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", me.id)
    .single();

  if (!e1 && found) {
    return found as Profile;
  }

  // cria um perfil padrão
  const display =
    (me.user_metadata && (me.user_metadata.name as string)) ||
    (me.email ? me.email.split("@")[0] : "Usuário");

  const { data: created, error: e2 } = await supabase
    .from("profiles")
    .insert({
      id: me.id,
      role: "professor",      // padrão
      display_name: display,
      subject: null,
    })
    .select()
    .single();

  if (e2) {
    console.error("getOrCreateMyProfile insert error:", e2);
    throw e2;
  }

  return created as Profile;
}

/**
 * Lista todos os perfis (apenas ADMIN enxerga todos por causa das policies).
 */
export async function listProfilesForAdmin(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listProfilesForAdmin error:", error);
    throw error;
  }
  return (data ?? []) as Profile[];
}

/**
 * Atualiza o papel de um usuário (admin/professor). Policies permitem só admin.
 */
export async function setUserRole(userId: string, role: "admin" | "professor") {
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    console.error("setUserRole error:", error);
    throw error;
  }
}
