import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type AdminRow = {
  id: string;
  email: string | null;
  display_name: string | null;
};

export default function AdminManage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function loadAdmins() {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase.rpc('admin_list');
    if (error) {
      setErr(error.message);
    } else {
      setAdmins((data || []) as AdminRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  async function grant() {
    setMsg(null);
    setErr(null);
    const em = email.trim();
    if (!em) {
      setErr('Informe um e-mail.');
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc('grant_admin_by_email', { p_email: em });
    if (error) setErr(error.message);
    else {
      setMsg(`Admin concedido para ${em}.`);
      setEmail('');
      await loadAdmins();
    }
    setBusy(false);
  }

  async function revoke(em: string) {
    if (!confirm(`Remover privilégios de admin de ${em}?`)) return;
    setBusy(true);
    setMsg(null);
    setErr(null);
    const { error } = await supabase.rpc('revoke_admin_by_email', { p_email: em });
    if (error) setErr(error.message);
    else {
      setMsg(`Admin removido de ${em}.`);
      await loadAdmins();
    }
    setBusy(false);
  }

  return (
    <div className="ss-page">
      <header className="ss-header">
        <h1 className="ss-title">Gerenciar admins</h1>
      </header>

      <div className="ss-card" style={{ marginBottom: 16 }}>
        <h3 className="ss-strong" style={{ marginBottom: 8 }}>Adicionar administrador</h3>
        <div className="ss-row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <input
            className="ss-input"
            style={{ minWidth: 320 }}
            placeholder="E-mail do usuário (precisa já ter conta)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="ss-btn ss-btn--primary" onClick={grant} disabled={busy}>
            {busy ? 'Salvando…' : 'Conceder admin'}
          </button>
        </div>
        {msg && <p className="ss-meta" style={{ marginTop: 8 }}>{msg}</p>}
        {err && <p style={{ color: 'crimson', marginTop: 8 }}>{err}</p>}
      </div>

      <div className="ss-card">
        <h3 className="ss-strong" style={{ marginBottom: 8 }}>Administradores atuais</h3>
        {loading ? (
          <p className="ss-meta">Carregando…</p>
        ) : admins.length === 0 ? (
          <p className="ss-meta">Nenhum admin encontrado.</p>
        ) : (
          <table className="ss-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>E-mail</th>
                <th style={{ textAlign: 'left' }}>Nome</th>
                <th style={{ width: 1 }}></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.email}</td>
                  <td>{a.display_name || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="ss-btn ss-btn--subtle"
                      onClick={() => revoke(a.email || '')}
                      disabled={busy || !a.email}
                    >
                      Revogar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
