// src/utils/status.ts
export const STATUS = {
  PENDENTE: 'pendente',
  ACEITO: 'aceito',
  REJEITADO: 'rejeitado',
} as const;

export type OrderStatus = typeof STATUS[keyof typeof STATUS];
