import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Status = 'pendente' | 'aceito' | 'rejeitado';
type StatusFilter = Status | 'todos';

type Order = {
  id: string;
  created_at: string;
  requester_name: string;
  item_name: string;
  quantity: number;
  notes: string | null;
  status: Status;
  notify_email: string | null;
  notify_phone: string | null;
};

const fmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const formatDate = (iso: string) => {
  try { return fmt.format(new Date(iso)); } catch { return iso; }
};

const Badge = ({status}:{status:Status})=>{
  const cls = status==='aceito' ? 'ss-badge ss-badge--ok'
            : status==='rejeitado' ? 'ss-badge ss-badge--danger'
            : 'ss-badge ss-badge--warn';
  return <span className={cls}><i/>{status[0].toUpperCase()+status.slice(1)}</span>;
};

export default function OrdersPublic(){
  // form
  const [name,setName]=useState('');
  const [item,setItem]=useState('');
  const [qty,setQty]=useState(1);
  const [notes,setNotes]=useState('');
  const [email,setEmail]=useState('');        // opcional
  const [phone,setPhone]=useState('');        // opcional
  const [sending,setSending]=useState(false);
  const [sentMsg,setSentMsg]=useState<string|null>(null);

  // list
  const [orders,setOrders]=useState<Order[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [filter,setFilter]=useState<StatusFilter>('todos');
  const [search,setSearch]=useState('');

  async function fetchOrders(){
    setLoading(true); setError(null);
    let q = supabase.from('orders').select('*').order('created_at',{ascending:false});
    if (filter!=='todos') q = q.eq('status',filter);
    const {data,error} = await q;
    if (error) setError(error.message); else setOrders((data||[]) as Order[]);
    setLoading(false);
  }

  useEffect(()=>{ fetchOrders();
    const ch = supabase.channel('public-orders-ui')
      .on('postgres_changes',{event:'*',schema:'public',table:'orders'},(p:any)=>{
        setOrders(prev=>{
          const {eventType,new:n,old:d}=p;
          if(eventType==='INSERT') return [n as Order, ...prev];
          if(eventType==='UPDATE') return prev.map(o=>o.id===(n as Order).id ? {...o,...(n as Partial<Order>)} : o);
          if(eventType==='DELETE') return prev.filter(o=>o.id!==(d as Order).id);
          return prev;
        });
      }).subscribe();
    return ()=>{ supabase.removeChannel(ch); };
// eslint-disable-next-line react-hooks/exhaustive-deps
  },[filter]);

  const list = useMemo(()=>{
    const q=search.trim().toLowerCase();
    const base = filter==='todos'?orders:orders.filter(o=>o.status===filter);
    if(!q) return base;
    return base.filter(o =>
      o.item_name.toLowerCase().includes(q) ||
      o.requester_name.toLowerCase().includes(q) ||
      (o.notes||'').toLowerCase().includes(q)
    );
  },[orders,search,filter]);

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setSending(true); setSentMsg(null);
    try{
      if(!name.trim() || !item.trim()) { setSentMsg('Preencha seu nome e o item.'); return; }
      const payload = {
        requester_name: name.trim(),
        item_name: item.trim(),
        quantity: Math.max(1, Number(qty||1)),
        notes: notes.trim() || null,
        notify_email: email.trim() || null,
        notify_phone: phone.trim() || null,
        status: 'pendente' as Status
      };
      const { error } = await supabase.from('orders').insert(payload);
      if (error) { setSentMsg('Erro ao enviar: '+error.message); return; }
      setSentMsg('Pedido enviado! Você pode acompanhar o status aqui nesta página.');
      setName(''); setItem(''); setQty(1); setNotes(''); setEmail(''); setPhone('');
    } finally { setSending(false); }
  }

  return (
    <div className="ss-page">
      <header className="ss-header">
        <h1 className="ss-title">Pedidos (acesso livre)</h1>
        <div className="ss-row" style={{gap:12}}>
          <select className="ss-select" value={filter} onChange={e=>setFilter(e.target.value as StatusFilter)} style={{minWidth:220}}>
            <option value="todos">Mostrar: todos</option>
            <option value="pendente">Somente pendentes</option>
            <option value="aceito">Somente aceitos</option>
            <option value="rejeitado">Somente rejeitados</option>
          </select>
        </div>
      </header>

      {/* FORM */}
      <form className="ss-card" onSubmit={submit} style={{marginBottom:16}}>
        <div className="ss-row" style={{flexWrap:'wrap', gap:12}}>
          <input className="ss-input" placeholder="Seu nome"
                 value={name} onChange={e=>setName(e.target.value)} style={{flex:'1 1 260px'}} />
          <input className="ss-input" placeholder="Item (ex.: Caderno capa dura)"
                 value={item} onChange={e=>setItem(e.target.value)} style={{flex:'2 1 360px'}} />
        </div>
        <div className="ss-row" style={{gap:12, marginTop:10, flexWrap:'wrap'}}>
          <input className="ss-input" type="number" min={1} value={qty}
                 onChange={e=>setQty(Math.max(1,Number(e.target.value||1)))} style={{width:160}} />
          <input className="ss-input" placeholder="Observações (opcional)"
                 value={notes} onChange={e=>setNotes(e.target.value)} style={{flex:'1 1 360px'}} />
        </div>
        <div className="ss-row" style={{gap:12, marginTop:10, flexWrap:'wrap'}}>
          <input className="ss-input" placeholder="Seu e-mail (opcional)"
                 value={email} onChange={e=>setEmail(e.target.value)} style={{flex:'1 1 280px'}} />
          <input className="ss-input" placeholder="Seu WhatsApp (opcional)"
                 value={phone} onChange={e=>setPhone(e.target.value)} style={{flex:'1 1 220px'}} />
        </div>
        <div className="ss-row" style={{marginTop:12}}>
          <button className="ss-btn ss-btn--primary" disabled={sending}>
            {sending ? 'Enviando…' : 'Enviar pedido'}
          </button>
          <button className="ss-btn ss-btn--subtle" type="button"
                  onClick={()=>{ setName(''); setItem(''); setQty(1); setNotes(''); setEmail(''); setPhone(''); }}>
            Limpar
          </button>
          {sentMsg && <span className="ss-meta" style={{marginLeft:12}}>{sentMsg}</span>}
        </div>
      </form>

      {/* BUSCA */}
      <div className="ss-toolbar">
        <input className="ss-input" placeholder="Buscar por nome, item ou observação…"
               value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {/* LISTA */}
      {loading ? <p className="ss-meta">Carregando…</p> :
       error ? <p style={{color:'crimson'}}>{error}</p> :
       list.length===0 ? <p className="ss-meta">Nenhum pedido encontrado.</p> :
       <div className="ss-grid">
         {list.map(o=>(
           <div key={o.id} className="ss-card">
             <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}>
               <div>
                 <div className="ss-strong">{o.item_name} <span className="ss-meta">×{o.quantity}</span></div>
                 <div className="ss-meta" style={{marginTop:6}}>
                   por <span className="ss-strong">{o.requester_name}</span>
                 </div>
                 {!!o.notes && <div className="ss-meta" style={{marginTop:6}}>Obs.: {o.notes}</div>}
                 <div className="ss-meta" style={{marginTop:6}}>
                   <span className="ss-strong">Solicitado em:</span> {formatDate(o.created_at)}
                 </div>
               </div>
               <Badge status={o.status}/>
             </div>
           </div>
         ))}
       </div>}
    </div>
  );
}
