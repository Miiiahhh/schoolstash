import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Item = {
  id: string;
  name: string;
  location?: string | null;
  category?: string | null;
  min_stock?: number | null;
};

type MoveRow = { item_id: string; qty: number };
type ItemRow = Item & { total: number };

const clsBadge = (qty: number, min = 0) => {
  if (qty <= 0) return 'ss-badge ss-badge--danger';
  if (qty <= (min ?? 0)) return 'ss-badge ss-badge--warn';
  return 'ss-badge ss-badge--ok';
};

export default function AdminInventory() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [locFilter, setLocFilter] = useState<string>('__all__');
  const [onlyLow, setOnlyLow] = useState(false);

  const [deltaById, setDeltaById] = useState<Record<string, number>>({});

  const [niName, setNiName] = useState('');
  const [niCategory, setNiCategory] = useState('Geral');
  const [niQty, setNiQty] = useState<number>(0);
  const [niMin, setNiMin] = useState<number>(0);
  const [niLoc, setNiLoc] = useState('Depósito 1');
  const [niObs, setNiObs] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  async function fetchMovesSafe(): Promise<MoveRow[]> {
    {
      const { data, error } = await supabase.from('stock_moves_norm').select('item_id, qty');
      if (!error && data) return data as MoveRow[];
    }
    {
      const { data, error } = await supabase.from('stock_moves').select('item_id, qty');
      if (!error && data) return (data as any[]).map(r => ({ item_id: r.item_id, qty: r.qty ?? 0 }));
    }
    {
      const { data, error } = await supabase.from('stock_moves').select('item_id, qty_change');
      if (!error && data) return (data as any[]).map(r => ({ item_id: r.item_id, qty: r.qty_change ?? 0 }));
    }
    throw new Error('Não foi possível ler os movimentos. Verifique se há policies de SELECT e se existe qty/qty_change.');
  }

  async function fetchAll() {
    setLoading(true);
    setErr(null);
    try {
      const { data: itemsRaw, error: e1 } = await supabase
        .from('items')
        .select('id,name,location,category,min_stock')
        .order('name', { ascending: true });
      if (e1) throw e1;

      const itemsBase = (itemsRaw || []) as Item[];

      const moves = await fetchMovesSafe();
      const sum: Record<string, number> = {};
      for (const m of moves) sum[m.item_id] = (sum[m.item_id] || 0) + (m.qty || 0);

      const merged: ItemRow[] = itemsBase.map((i) => ({ ...i, total: sum[i.id] || 0 }));
      setItems(merged);
    } catch (e: any) {
      setErr(e.message || 'Erro ao carregar inventário.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel('inv-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_moves' }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const list = useMemo(() => {
    let data = [...items];
    if (locFilter !== '__all__') data = data.filter((i) => (i.location || '') === locFilter);
    if (onlyLow) data = data.filter((i) => i.total <= (i.min_stock ?? 0));
    const s = q.trim().toLowerCase();
    if (s) {
      data = data.filter(
        (i) =>
          i.name.toLowerCase().includes(s) ||
          (i.location || '').toLowerCase().includes(s) ||
          (i.category || '').toLowerCase().includes(s)
      );
    }
    return data;
  }, [items, q, locFilter, onlyLow]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    for (const i of items) if (i.location && i.location.trim()) set.add(i.location.trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  async function adjust(item: ItemRow, delta: number, note?: string) {
    if (!delta) return;
    setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, total: p.total + delta } : p)));
    setDeltaById((m) => ({ ...m, [item.id]: 0 }));
    const { error } = await supabase.rpc('add_stock_move', {
      p_item: item.id,
      p_qty: delta,
      p_note: note || (delta > 0 ? 'Entrada rápida' : 'Saída rápida'),
    });
    if (error) {
      alert('Falha ao lançar movimento: ' + error.message);
      fetchAll();
    }
  }

  async function createItem() {
    setSaveMsg(null);
    if (!niName.trim()) { setSaveMsg('Informe o nome do item.'); return; }
    setSaving(true);
    try {
      const insertPayload: any = {
        name: niName.trim(),
        category: niCategory?.trim() || null,
        min_stock: Number.isFinite(niMin) ? niMin : 0,
        location: niLoc?.trim() || null,
      };
      const { data, error } = await supabase
        .from('items')
        .insert(insertPayload)
        .select('id,name,location,category,min_stock')
        .single();
      if (error) throw error;

      const newItem = data as Item;
      if (niQty && Number(niQty) !== 0) {
        const { error: e2 } = await supabase.rpc('add_stock_move', {
          p_item: newItem.id,
          p_qty: Number(niQty),
          p_note: niObs?.trim() || 'Saldo inicial (cadastro)',
        });
        if (e2) throw e2;
      }

      setSaveMsg('Item criado com sucesso!');
      setNiName(''); setNiCategory('Geral'); setNiQty(0); setNiMin(0); setNiLoc('Depósito 1'); setNiObs('');
      await fetchAll();
    } catch (e: any) {
      setSaveMsg('Erro: ' + (e.message || 'falha ao criar item'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ss-page inv-page">
      <header className="ss-header">
        <h1 className="ss-title">Inventário</h1>
        <div className="ss-row" style={{ gap: 12 }}>
          <select className="ss-select" value={locFilter} onChange={(e) => setLocFilter(e.target.value)} style={{ minWidth: 260 }}>
            <option value="__all__">Todas as localizações</option>
            {locations.map((l) => (<option key={l} value={l}>{l}</option>))}
          </select>
          <label className="ss-switch">
            <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
            <span>Apenas baixo/zerado</span>
          </label>
        </div>
      </header>

      {/* NOVO ITEM */}
      <div className="ss-card" style={{ marginBottom: 16 }}>
        <h3 className="ss-strong" style={{ marginBottom: 8 }}>Novo item no depósito</h3>
        <div className="ss-row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 260px' }}>
            <label className="ss-label">Nome do item</label>
            <input className="ss-input" placeholder="Ex.: Caderno capa dura" value={niName} onChange={(e) => setNiName(e.target.value)} />
          </div>
          <div style={{ width: 220 }}>
            <label className="ss-label">Categoria</label>
            <input className="ss-input" placeholder="Ex.: Geral" value={niCategory} onChange={(e) => setNiCategory(e.target.value)} />
          </div>
          <div style={{ width: 160 }}>
            <label className="ss-label">Quantidade</label>
            <input className="ss-input" type="number" value={niQty} onChange={(e) => setNiQty(Number(e.target.value))} min={0} />
          </div>
          <div style={{ width: 160 }}>
            <label className="ss-label">Estoque mínimo</label>
            <input className="ss-input" type="number" value={niMin} onChange={(e) => setNiMin(Number(e.target.value))} min={0} />
          </div>
          <div style={{ width: 220 }}>
            <label className="ss-label">Localização</label>
            <input className="ss-input" placeholder="Ex.: Depósito 1" value={niLoc} onChange={(e) => setNiLoc(e.target.value)} />
          </div>
        </div>
        <div className="ss-row" style={{ marginTop: 10 }}>
          <input className="ss-input" placeholder="Observações do saldo inicial (opcional)" value={niObs} onChange={(e) => setNiObs(e.target.value)} />
        </div>
        <div className="ss-row" style={{ marginTop: 12 }}>
          <button className="ss-btn ss-btn--primary" onClick={createItem} disabled={saving}>{saving ? 'Salvando…' : 'Adicionar item'}</button>
          {saveMsg && <span className="ss-meta" style={{ marginLeft: 12 }}>{saveMsg}</span>}
        </div>
      </div>

      {/* BUSCA do Inventário (presa logo abaixo da navbar) */}
      <div className="inv-sticky">
        <div className="inv-searchbar">
          <input className="ss-input" placeholder="Buscar por nome, SKU ou localização…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {/* LISTA */}
      {loading ? (
        <p className="ss-meta">Carregando…</p>
      ) : err ? (
        <p style={{ color: 'crimson' }}>{err}</p>
      ) : list.length === 0 ? (
        <p className="ss-meta">Nenhum item encontrado.</p>
      ) : (
        <div className="ss-grid">
          {list.map((i) => {
            const badge = clsBadge(i.total, i.min_stock || 0);
            return (
              <div className="ss-card" key={i.id}>
                <div className="ss-strong">{i.name}</div>
                <div className="ss-meta" style={{ marginTop: 4 }}>Loc.: {i.location || '—'}</div>
                <div className="ss-meta" style={{ marginTop: 2 }}>Cat.: {i.category || '—'}</div>
                <div style={{ marginTop: 10 }}>
                  <span className={badge}><i />{i.total <= 0 ? 'Zerado' : i.total <= (i.min_stock ?? 0) ? 'Baixo' : 'OK'} • {i.total}</span>
                </div>
                <div className="ss-row" style={{ marginTop: 10 }}>
                  <input
                    className="ss-input"
                    style={{ width: 180 }}
                    type="number"
                    min={1}
                    value={deltaById[i.id] ?? 1}
                    onChange={(e) =>
                      setDeltaById((m) => ({ ...m, [i.id]: Math.max(1, Number(e.target.value || 1)) }))
                    }
                  />
                </div>
                <div className="ss-actions" style={{ display:'flex', gap:8, marginTop:10 }}>
                  <button className="ss-btn ss-btn--ghost"  onClick={() => adjust(i, Math.abs(deltaById[i.id] ?? 1), 'Entrada rápida')}>+ Entrada</button>
                  <button className="ss-btn ss-btn--subtle" onClick={() => adjust(i, -Math.abs(deltaById[i.id] ?? 1), 'Saída rápida')}>− Saída</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
