import { useMemo, useState } from "react";
import { inventoryMock, movementsMock } from "@/lib/mockData";
import { InventoryItem, Movement } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Minus, Plus, Search, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function InventoryManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>(inventoryMock);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter(i =>
      [i.name, i.category].some(s => s.toLowerCase().includes(t))
    );
  }, [q, items]);

  function changeQty(id: string, delta: number) {
    setItems(old =>
      old.map(i =>
        i.id === id ? { ...i, qty: Math.max(0, i.qty + delta), updatedAt: new Date().toISOString() } : i
      )
    );
    // registra movimento local
    const item = items.find(i => i.id === id);
    if (item) {
      const mov: Movement = {
        id: crypto.randomUUID(),
        itemId: item.id,
        itemName: item.name,
        type: delta > 0 ? "in" : "out",
        amount: Math.abs(delta),
        user: "admin",
        date: new Date().toISOString(),
      };
      movementsMock.unshift(mov);
    }
  }

  function saveAll() {
    toast({ title: "Inventário salvo", description: "Mudanças mantidas (mock). Integre a uma API depois." });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inventário</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 opacity-60" />
              <Input placeholder="Buscar por nome ou categoria" className="pl-8 w-64" value={q} onChange={e=>setQ(e.target.value)} />
            </div>
            <Button onClick={saveAll}><Save className="w-4 h-4 mr-2" />Salvar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Mín.</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(i => {
                const low = i.qty <= i.minQty;
                return (
                  <TableRow key={i.id} className={low ? "bg-destructive/5" : ""}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell>{i.category}</TableCell>
                    <TableCell className="text-right">
                      {i.qty}{" "}
                      {low && <Badge variant="destructive" className="ml-2">Baixo</Badge>}
                    </TableCell>
                    <TableCell className="text-right">{i.minQty}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => changeQty(i.id, -1)}><Minus className="w-4 h-4" /></Button>
                      <Button variant="outline" size="icon" onClick={() => changeQty(i.id, +1)}><Plus className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
