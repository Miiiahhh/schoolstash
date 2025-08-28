// src/services/orders.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';
import type { OrderStatus } from '../utils/status';

export function useAdminOrders(filter?: OrderStatus | 'todos') {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    let q = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter && filter !== 'todos') q = q.eq('status', filter);

    const { data, error } = await q;
    if (error) setError(error.message);
    else setOrders((data || []) as Order[]);

    setLoading(false);
  }

  async function updateStatus(id: string, status: OrderStatus) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw new Error(error.message);
  }

  useEffect(() => {
    fetchOrders();
    const ch = supabase
      .channel('orders-admin-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [filter]);

  return { orders, loading, error, fetchOrders, updateStatus, setOrders };
}
