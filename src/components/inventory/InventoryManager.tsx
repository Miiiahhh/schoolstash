import { useEffect, useMemo, useRef, useState } from "react";
import { listInventory, updateQty, createItem, InventoryRow } from "@/lib/inventoryApi";
import { subscribeTable } from "@/lib/realtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Minus, Plus, Search, RefreshCw, PlusCircle } from "lucide-react";

function debounce<T extends (...args: any[]) => void>(fn: T, ms = 200) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  };
}

export default function InventoryManager() {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listInventory();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  // versão "estável" do load para usar dentro do realtime
  const loadDebounced = useRef(debounce(load, 250)).current;

  useEffect(() => {
    mounted.current = true;
    load();

    // Realtime: qualquer mudança em inventory_items ou movements recarrega a lista
    const unsubInv = subscribeTable("inventory_items", () => loadDebounced());
    const unsubMov = subscribeTable("movements", () => loadDebounced());

    return () => {
      mounted.current = false;
      unsubInv();
      unsubMov();
    };
  }, [loadDebounced]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((i) =>
      [i.name, i.category].some((s) => s.toLowerCase().includes(t))
    );
  }, [q, items]);

  async function changeQty(id: string, delta: number) {
    setLoading(true);
    try {
      await updateQty(id, delta, "admin"); // se quiser mostre o nome do usuário logado aqui
      // não chama load(); realtime vai atualizar
    } finally {
      setLoading(false);
    }
  }

  async function quickAdd() {
    const name = prompt("Nome do item:");
    const category = prompt("Categoria:");
    const qty = Number(prompt("Quantidade inicial (número):") || "0");
    const min = Number(prompt("Estoque mínimo (número):") || "0");
    if (!name || !category) return;
    setLoading(true);
    try {
      await createItem({ name, category, qty, min_qty: min });
      // realtime atualizará
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Inventário{" "}
            {loading && (
              <span className="text-xs text-muted-foreground">(carregando...)</span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 opacity-60" />
              <Input
                placeholder="Buscar por nome ou categoria"
                className="pl-8 w-64"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={load}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={quickAdd}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Novo
            </Button>
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
              {filtered.map((i) => {
                const low = i.qty <= i.min_qty;
                return (
                  <TableRow key={i.id} className={low ? "bg-destructive/5" : ""}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell>{i.category}</TableCell>
                    <TableCell className="text-right">
                      {i.qty} {low && <Badge variant="destructive" className="ml-2">Baixo</Badge>}
                    </TableCell>
                    <TableCell className="text-right">{i.min_qty}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => changeQty(i.id, -1)}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => changeQty(i.id, +1)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum item encontrado.
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
