import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Status = 'pendente' | 'aceito' | 'rejeitado';

interface Order {
  id: string;
  created_at: string;
  requester_name: string;
  item_name: string;
  quantity: number;
  notes: string | null;
  status: Status;
  notify_email: string | null;
  notify_phone: string | null;
}

export default function PublicOrders() {
  // form
  const [requesterName, setRequesterName] = useState('');
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyPhone, setNotifyPhone] = useState(''); // novo

  // list
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | Status>('todos');
  const [loading, setLoading] = useState(true);

  async function sendOrder() {
    const { error } = await supabase.from('orders').insert({
      requester_name: requesterName.trim(),
      item_name: item.trim(),
      quantity: Number(quantity) || 1,
      notes: notes.trim() || null,
      status: 'pendente',
      notify_email: notifyEmail.trim() || null,
      notify_phone: notifyPhone.trim() || null,
    });
    if (error) {
      alert('Erro ao enviar pedido. Tente novamente.');
      return;
    }
    setRequesterName('');
    setItem('');
    setQuantity(1);
    setNotes('');
    setNotifyEmail('');
    setNotifyPhone('');
    await fetchOrders();
  }

  async function fetchOrders() {
    setLoading(true);
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filter !== 'todos') q = q.eq('status', filter);
    const { data } = await q;
    setOrders((data || []) as Order[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
    const ch = supabase
      .channel('public-orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o =>
      o.item_name.toLowerCase().includes(q) ||
      o.requester_name.toLowerCase().includes(q) ||
      (o.notes || '').toLowerCase().includes(q)
    );
  }, [orders, search]);

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="title">Pedidos (acesso livre)</h1>
      </header>

      <section className="section-narrow card" style={{ padding: 16 }}>
        <div className="grid" style={{ gap: 12 }}>
          <input className="input" placeholder="Seu nome"
                 value={requesterName} onChange={e => setRequesterName(e.target.value)} />
          <input className="input" placeholder="Item"
                 value={item} onChange={e => setItem(e.target.value)} />
          <div style={{ display: 'flex', gap: 12 }}>
            <input className="input" type="number" min={1}
                   placeholder="Quantidade" value={quantity}
                   onChange={e => setQuantity(Number(e.target.value))} />
            <input className="input" placeholder="Seu e-mail (para aviso de status) — opcional"
                   value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input className="input" placeholder="Seu WhatsApp com DDD (apenas números) — opcional"
                   value={notifyPhone} onChange={e => setNotifyPhone(e.target.value)} />
            <input className="input" placeholder="Observações (opcional)"
                   value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={sendOrder}>Enviar pedido</button>
            <button className="btn btn--subtle" onClick={() => {
              setRequesterName(''); setItem(''); setQuantity(1);
              setNotes(''); setNotifyEmail(''); setNotifyPhone('');
            }}>Limpar</button>
          </div>
        </div>
      </section>

      <section className="section-narrow toolbar" style={{ top: 60 }}>
        <input className="input" placeholder="Buscar por nome, item ou observação…"
               value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="select" value={filter} onChange={e => setFilter(e.target.value as any)}>
            <option value="todos">Mostrar: todos</option>
            <option value="pendente">Pendentes</option>
            <option value="aceito">Aceitos</option>
            <option value="rejeitado">Rejeitados</option>
          </select>
          <small className="text-muted">Dica: procure seu nome para ver seus pedidos rapidamente.</small>
        </div>
      </section>

      <section className="section-narrow">
        {loading ? <p>Carregando…</p> :
         list.length === 0 ? <p className="text-muted">Nenhum pedido encontrado.</p> :
         <div className="grid" style={{ gap: 12 }}>
          {list.map(o => (
            <div key={o.id} className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div className="font-semibold">{o.item_name} <span style={{ opacity: .7 }}>×{o.quantity}</span></div>
                  <div className="text-sm" style={{ opacity: .85, marginTop: 4 }}>
                    por <strong>{o.requester_name}</strong> • {new Date(o.created_at).toLocaleString()}
                  </div>
                  {!!o.notes && <div className="text-sm" style={{ marginTop: 6 }}>Obs.: {o.notes}</div>}
                </div>
                <span className="text-sm" style={{ padding: '6px 10px', borderRadius: 999, background: '#f1f5f9' }}>
                  {o.status}
                </span>
              </div>
            </div>
          ))}
         </div>}
      </section>
    </div>
  );
}
