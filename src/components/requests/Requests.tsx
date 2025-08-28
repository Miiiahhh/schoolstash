import { useEffect, useState } from "react";
import { createRequest, listRequests, RequestRow, setRequestStatus } from "@/lib/requestsApi";
import { subscribeTable } from "@/lib/realtime";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewRequestDialog } from "./NewRequestDialog";

export default function Requests() {
  const { state } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchRequests() {
    setLoading(true);
    try {
      const data = await listRequests();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const data = await listRequests();
      if (mounted) setRows(data);
    };
    load();

    const off1 = subscribeTable("requests", async (p) => {
      if (p.eventType === "INSERT") {
        toast({ title: "Novo pedido", description: `Professor(a): ${p.new?.requester || "—"}` });
      } else if (p.eventType === "UPDATE") {
        toast({ title: "Pedido atualizado", description: `Status: ${p.new?.status}` });
      }
      await load();
    });

    const off2 = subscribeTable("request_items", async () => {
      await load();
    });

    return () => {
      mounted = false;
      off1();
      off2();
    };
  }, [toast]);

  async function handleCreate(payload: { note?: string; items: { item_name: string; amount: number }[] }) {
    await createRequest({
      requester: state.currentUser?.name || undefined,
      note: payload.note,
      items: payload.items,
    });
    // realtime recarrega
  }

  async function handleStatus(req: RequestRow, newStatus: "approved" | "denied") {
    await setRequestStatus(req.id, newStatus);
    // realtime recarrega
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>
            Pedidos {loading && <span className="text-xs text-muted-foreground">(carregando...)</span>}
          </CardTitle>

          {state.userType === "professor" && (
            <NewRequestDialog onSubmit={handleCreate} />
          )}
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.requester || "-"}</TableCell>
                  <TableCell className="capitalize">{r.status}</TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell className="space-x-2">
                    {state.userType === "admin" && r.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => handleStatus(r, "approved")}>Aprovar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleStatus(r, "denied")}>Negar</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum pedido encontrado.
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
