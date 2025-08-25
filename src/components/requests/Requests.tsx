import { useState } from "react";
import { requestsMock } from "@/lib/mockData";
import { Request } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Requests() {
  const [requests, setRequests] = useState<Request[]>(requestsMock);

  function setStatus(id: string, status: Request["status"]) {
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status } : r));
  }

  return (
    <div className="grid gap-4">
      {requests.map(r => (
        <Card key={r.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pedido #{r.id}</CardTitle>
              <CardDescription>De: <code>{r.requester}</code> — {new Date(r.createdAt).toLocaleString()}</CardDescription>
            </div>
            <Badge variant={
              r.status === "pending" ? "secondary" :
              r.status === "approved" ? "default" : "destructive"
            }>{r.status}</Badge>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-1">
              {r.items.map(it => (
                <li key={it.id}><b>{it.itemName}</b> — {it.amount} un.</li>
              ))}
            </ul>
            {r.note && <p className="mt-3 text-sm text-muted-foreground">{r.note}</p>}

            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={()=>setStatus(r.id, "approved")}>Aprovar</Button>
              <Button variant="outline" onClick={()=>setStatus(r.id, "denied")}>Negar</Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {requests.length === 0 && <p className="text-sm text-muted-foreground">Sem pedidos.</p>}
    </div>
  );
}
