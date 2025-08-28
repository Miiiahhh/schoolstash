import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

type ItemRow = { item_name: string; amount: number };

export function NewRequestDialog({
  onSubmit,
}: {
  onSubmit: (payload: { note?: string; items: ItemRow[] }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ item_name: "", amount: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  function addRow() {
    setItems((s) => [...s, { item_name: "", amount: 1 }]);
  }

  function removeRow(idx: number) {
    setItems((s) => s.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, patch: Partial<ItemRow>) {
    setItems((s) => s.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }

  const totalItems = items.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const isValid =
    items.length > 0 &&
    items.every((r) => r.item_name.trim().length > 0 && Number(r.amount) > 0);

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onSubmit({
        note: note.trim() || undefined,
        items: items.map((r) => ({ item_name: r.item_name.trim(), amount: Number(r.amount) })),
      });
      // resetar para próximo uso
      setNote("");
      setItems([{ item_name: "", amount: 1 }]);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Novo pedido</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Novo pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Observação (opcional)</label>
            <Input
              placeholder="Ex.: Urgente para 3ª feira"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Card>
            <CardContent className="pt-6 space-y-3">
              {items.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-8">
                    <Input
                      placeholder="Nome do item"
                      value={row.item_name}
                      onChange={(e) => updateRow(idx, { item_name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min={1}
                      value={row.amount}
                      onChange={(e) => updateRow(idx, { amount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeRow(idx)}
                      disabled={items.length === 1}
                      title="Remover linha"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="pt-1">
                <Button type="button" variant="outline" onClick={addRow}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar item
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            Total de unidades solicitadas: <span className="font-medium">{totalItems}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!isValid || submitting}>
            {submitting ? "Enviando..." : "Enviar pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
