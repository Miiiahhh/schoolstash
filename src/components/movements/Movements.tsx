import { useEffect, useRef, useState } from "react";
import { listMovements, MovementRow } from "@/lib/inventoryApi";
import { subscribeTable } from "@/lib/realtime";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function debounce<T extends (...args:any[]) => void>(fn: T, ms = 200) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  };
}

export default function Movements() {
  const [movs, setMovs] = useState<MovementRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const data = await listMovements();
      setMovs(data);
    } finally {
      setLoading(false);
    }
  }
  const loadDebounced = useRef(debounce(load, 250)).current;

  useEffect(() => {
    load();
    const unsub = subscribeTable("movements", (p) => {
      loadDebounced();
      if (p.eventType === "INSERT") {
        toast({
          title: p.new?.type === "in" ? "Entrada registrada" : "Saída registrada",
          description: `${p.new?.amount}x ${p.new?.item_name} • por ${p.new?.user_name}`,
        });
      }
    });
    return () => unsub();
  }, [loadDebounced, toast]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Movimentações recentes{" "}
            {loading && <span className="text-xs text-muted-foreground">(carregando...)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movs.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.item_name}</TableCell>
                  <TableCell>{m.type === "in" ? "Entrada" : "Saída"}</TableCell>
                  <TableCell>{m.amount}</TableCell>
                  <TableCell>{m.user_name}</TableCell>
                  <TableCell>{m.note || "-"}</TableCell>
                  <TableCell>{new Date(m.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {movs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhuma movimentação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
