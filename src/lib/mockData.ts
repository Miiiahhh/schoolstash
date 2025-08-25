import { InventoryItem, Movement, Request } from "@/types";

export const inventoryMock: InventoryItem[] = [
  { id: "i1", name: "Caderno 96 folhas", category: "Papelaria", qty: 28, minQty: 10, updatedAt: new Date().toISOString() },
  { id: "i2", name: "Caneta azul", category: "Papelaria", qty: 6, minQty: 20, updatedAt: new Date().toISOString() },
  { id: "i3", name: "Álcool em gel 500ml", category: "Higiene", qty: 14, minQty: 8, updatedAt: new Date().toISOString() },
];

export const movementsMock: Movement[] = [
  { id: "m1", itemId: "i1", itemName: "Caderno 96 folhas", type: "out", amount: 5, user: "prof.ana", date: new Date().toISOString(), note: "Turma 1ºA" },
  { id: "m2", itemId: "i2", itemName: "Caneta azul", type: "in", amount: 50, user: "admin", date: new Date().toISOString() },
];

export const requestsMock: Request[] = [
  {
    id: "r1",
    requester: "prof.pedro",
    status: "pending",
    createdAt: new Date().toISOString(),
    items: [
      { id: "ri1", itemName: "Tinta guache", amount: 6 },
      { id: "ri2", itemName: "Pincel nº 12", amount: 10 },
    ],
    note: "Atividades de Arte – 2º ano",
  },
];
