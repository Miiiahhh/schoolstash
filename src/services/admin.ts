import { supabase } from "../lib/supabase";

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_current_user_admin");
  if (error) {
    console.error("RPC is_current_user_admin falhou:", error);
    return false;
  }
  return data === true;
}
