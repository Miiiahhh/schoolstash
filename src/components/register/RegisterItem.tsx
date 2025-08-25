import { useState } from "react";
import { InventoryItem } from "@/types";
import { inventoryMock } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function RegisterItem() {
  const { toast } = useToast();
  const [form, setForm] = useState<Omit<InventoryItem,"id"|"updatedAt">>({
    name: "",
    category: "",
    qty: 0,
    minQty: 0,
  });

  function submit() {
    if (!form.name || !form.category) {
      toast({ variant: "destructive", title: "Campos obrigatórios", description: "Informe nome e categoria." });
      return;
    }
    inventoryMock.unshift({
      id: crypto.randomUUID(),
      ...form,
      updatedAt: new Date().toISOString(),
    });
    setForm({ name: "", category: "", qty: 0, minQty: 0 });
    toast({ title: "Item cadastrado", description: "Registro adicionado ao inventário (mock)." });
  }

  return (
    <Card className="max-w-xl">
      <CardHeader><CardTitle>Cadastrar Item</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-1.5">
          <Label>Nome</Label>
          <Input value={form.name} onChange={e=>setForm(s=>({...s, name: e.target.value}))} />
        </div>
        <div className="grid gap-1.5">
          <Label>Categoria</Label>
          <Input value={form.category} onChange={e=>setForm(s=>({...s, category: e.target.value}))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label>Quantidade</Label>
            <Input type="number" value={form.qty} onChange={e=>setForm(s=>({...s, qty: Number(e.target.value)}))} />
          </div>
          <div className="grid gap-1.5">
            <Label>Estoque mínimo</Label>
            <Input type="number" value={form.minQty} onChange={e=>setForm(s=>({...s, minQty: Number(e.target.value)}))} />
          </div>
        </div>
        <Button onClick={submit}>Salvar</Button>
      </CardContent>
    </Card>
  );
}
