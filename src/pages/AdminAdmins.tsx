import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type AdminEmail = { email: string; created_at: string };

export default function AdminAdmins() {
  const [list, setList] = useState<AdminEmail[]>([]);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setMsg(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_list');
      if (error) throw error;
      setList((data as AdminEmail[]) || []);
    } catch (e: any) {
      setMsg(e.message || 'Falha ao carregar administradores.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addAdmin() {
    setMsg(null);
    if (!email.trim()) {
      setMsg('Informe um e-mail.');
      return;
    }
    try {
      const { error } = await supabase.rpc('admin_add_email', { p_email: email.trim() });
      if (error) throw error;
      setEmail('');
      setMsg('Administrador adicionado com sucesso.');
      load();
    } catch (e: any) {
      setMsg(e.message || 'Falha ao adicionar.');
    }
  }

  async function removeAdmin(e: string) {
    if (!confirm(`Remover ${e} da lista de administradores?`)) return;
    setMsg(null);
    try {
      const { error } = await supabase.rpc('admin_remove_email', { p_email: e });
      if (error) throw error;
      setMsg('Administrador removido.');
      load();
    } catch (ex: any) {
      setMsg(ex.message || 'Falha ao remover.');
    }
  }

  return (
    <div className="ss-page">
      <h1 className="ss-title">Gerenciar administradores</h1>

      <div className="ss-card" style={{ marginBottom: 16 }}>
        <h3 className="ss-strong">Novo administrador</h3>
        <div className="ss-row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <input
            className="ss-input"
            placeholder="email@escola.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ minWidth: 300, flex: '1 1 320px' }}
          />
          <button className="ss-btn ss-btn--primary" onClick={addAdmin}>
            Adicionar
          </button>
        </div>
        {msg && <div className="ss-meta" style={{ marginTop: 8 }}>{msg}</div>}
      </div>

      <div className="ss-card">
        <h3 className="ss-strong">Lista de administradores</h3>
        {loading ? (
          <p className="ss-meta">Carregando…</p>
        ) : list.length === 0 ? (
          <p className="ss-meta">Nenhum admin cadastrado.</p>
        ) : (
          <ul style={{ marginTop: 8 }}>
            {list.map((row) => (
              <li key={row.email} className="ss-row" style={{ justifyContent: 'space-between' }}>
                <span>{row.email}</span>
                <button className="ss-btn ss-btn--subtle" onClick={() => removeAdmin(row.email)}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="ss-meta" style={{ marginTop: 12 }}>
        Dica: as policies dos demais endpoints devem checar{' '}
        <code>public.is_admin_email(auth.email())</code>.
      </p>
    </div>
  );
}
