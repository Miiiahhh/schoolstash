import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Status = 'pendente' | 'aceito' | 'rejeitado';
type StatusFilter = Status | 'todos';

export interface Order {
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

/* UI helpers */
const onlyDigits = (s:string)=>s.replace(/\D/g,'');
const openNewTab = (url:string)=>{ const a=document.createElement('a'); a.href=url; a.target='_blank'; a.rel='noopener'; document.body.appendChild(a); a.click(); a.remove(); };
const Badge = ({status}:{status:Status})=>{
  const cls = status==='aceito' ? 'ss-badge ss-badge--ok'
            : status==='rejeitado' ? 'ss-badge ss-badge--danger'
            : 'ss-badge ss-badge--warn';
  return <span className={cls}><i/>{status[0].toUpperCase()+status.slice(1)}</span>;
};

export default function AdminOrders(){
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

  async function updateStatus(id:string, status:Status){
    setOrders(prev=>prev.map(o=>o.id===id?{...o,status}:o)); // otimista
    const {error} = await supabase.from('orders').update({status}).eq('id',id);
    if (error){ alert('Erro ao atualizar status.'); fetchOrders(); }
  }

  async function deleteOrder(id:string){
    const ok = confirm('Tem certeza que deseja APAGAR este pedido? Esta ação não pode ser desfeita.');
    if(!ok) return;
    // otimista
    setOrders(prev=>prev.filter(o=>o.id!==id));
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error){
      alert('Não foi possível apagar (verifique se seu usuário é admin e as policies).');
      fetchOrders();
    }
  }

  function msg(o:Order){
    return [
      `Olá ${o.requester_name},`,
      ``,
      `O status do seu pedido foi atualizado para: ${o.status}.`,
      ``,
      `Item: ${o.item_name}`,
      `Quantidade: ${o.quantity}`,
      ...(o.notes?[`Observações: ${o.notes}`]:[]),
      ``,
      `Você pode acompanhar pela página de Pedidos (acesso livre).`,
      ``,
      `— School Stash Hub • SESI`
    ].join('\n');
  }
  function email(o:Order){
    if(!o.notify_email){ alert('Pedido sem e-mail.'); return; }
    const link=`mailto:${encodeURIComponent(o.notify_email)}?subject=${encodeURIComponent(`School Stash Hub • seu pedido foi ${o.status}`)}&body=${encodeURIComponent(msg(o))}`;
    openNewTab(link);
  }
  function whatsapp(o:Order){
    const d=onlyDigits(o.notify_phone||'');
    if(!d){ alert('Pedido sem WhatsApp.'); return; }
    const to=d.startsWith('55')?d:`55${d}`;
    openNewTab(`https://wa.me/${to}?text=${encodeURIComponent(msg(o))}`);
  }

  useEffect(()=>{ fetchOrders();
    const ch = supabase.channel('admin-orders-ui')
      .on('postgres_changes',{event:'*',schema:'public',table:'orders'},(p:any)=>{
        setOrders(prev=>{
          const {eventType,new:n,old:d}=p;
          if(eventType==='INSERT') return [n as Order, ...prev];
          if(eventType==='UPDATE') return prev.map(o=>o.id===n.id?{...o,...(n as Partial<Order>)}:o);
          if(eventType==='DELETE') return prev.filter(o=>o.id!==d.id);
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
      (o.notes||'').toLowerCase().includes(q) ||
      (o.notify_email||'').toLowerCase().includes(q) ||
      (o.notify_phone||'').toLowerCase().includes(q)
    );
  },[orders,search,filter]);

  return (
    <div className="ss-page">
      <header className="ss-header">
        <h1 className="ss-title">Admin • Pedidos</h1>
        <div className="ss-row" style={{justifyContent:'flex-end'}}>
          <select className="ss-select" value={filter} onChange={e=>setFilter(e.target.value as StatusFilter)} style={{minWidth:180}}>
            <option value="todos">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="aceito">Aceitos</option>
            <option value="rejeitado">Rejeitados</option>
          </select>
        </div>
      </header>

      <div className="ss-toolbar">
        <input className="ss-input" placeholder="Buscar por nome, item, observação, e-mail ou WhatsApp…"
               value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {loading ? <p className="ss-meta">Carregando…</p> :
       error ? <p style={{color:'crimson'}}>{error}</p> :
       list.length===0 ? <p className="ss-meta">Nada aqui.</p> :
       <div className="ss-grid">
         {list.map(o=>(
           <div key={o.id} className="ss-card">
             <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}>
               <div>
                 <div className="ss-strong">{o.item_name} <span className="ss-meta">×{o.quantity}</span></div>
                 <div className="ss-meta" style={{marginTop:6}}>
                   por <span className="ss-strong">{o.requester_name}</span> • {new Date(o.created_at).toLocaleString()}
                 </div>
                 {!!o.notes && <div className="ss-meta" style={{marginTop:6}}>Obs.: {o.notes}</div>}
                 {!!o.notify_email && <div className="ss-meta" style={{marginTop:6}}>E-mail: <span className="ss-strong">{o.notify_email}</span></div>}
                 {!!o.notify_phone && <div className="ss-meta" style={{marginTop:4}}>Whats: <span className="ss-strong">{o.notify_phone}</span></div>}
               </div>
               <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
                 <Badge status={o.status}/>
                 {/* Segmented control inline */}
                 <div className="ss-seg" role="radiogroup" aria-label="Status">
                   <input id={`p-${o.id}`} name={`seg-${o.id}`} type="radio" checked={o.status==='pendente'} onChange={()=>updateStatus(o.id,'pendente')} />
                   <label htmlFor={`p-${o.id}`} data-variant="warn">Pendente</label>
                   <input id={`a-${o.id}`} name={`seg-${o.id}`} type="radio" checked={o.status==='aceito'} onChange={()=>updateStatus(o.id,'aceito')} />
                   <label htmlFor={`a-${o.id}`} data-variant="ok">Aceito</label>
                   <input id={`r-${o.id}`} name={`seg-${o.id}`} type="radio" checked={o.status==='rejeitado'} onChange={()=>updateStatus(o.id,'rejeitado')} />
                   <label htmlFor={`r-${o.id}`} data-variant="danger">Rejeitado</label>
                 </div>
               </div>
             </div>

             <div className="ss-actions">
               <button className="ss-btn ss-btn--ghost" onClick={()=>email(o)}    disabled={!o.notify_email}>Avisar por e-mail</button>
               <button className="ss-btn ss-btn--ghost" onClick={()=>whatsapp(o)} disabled={!o.notify_phone}>Avisar no WhatsApp</button>
               <div className="spacer" />
               <button className="ss-btn ss-btn--subtle" onClick={()=>deleteOrder(o.id)}>Apagar</button>
             </div>
           </div>
         ))}
       </div>}
    </div>
  );
}
