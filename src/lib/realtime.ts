// src/lib/realtime.ts
import { supabase } from "@/lib/supabase";

/**
 * Assina mudanças numa tabela do Postgres (INSERT | UPDATE | DELETE).
 * Retorna uma função para desinscrever.
 */
export function subscribeTable(
  table: string,
  onChange: (payload: {
    eventType: "INSERT" | "UPDATE" | "DELETE";
    schema: string;
    table: string;
    new?: any;
    old?: any;
  }) => void,
  schema: string = "public"
) {
  const channel = supabase
    .channel(`realtime:${schema}:${table}`)
    .on(
      "postgres_changes",
      { event: "*", schema, table },
      (payload: any) => {
        onChange({
          eventType: payload.eventType,
          schema,
          table,
          new: payload.new,
          old: payload.old,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
