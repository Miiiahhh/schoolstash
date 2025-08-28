// src/pages/AdminLogin.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) { alert('Falha no login.'); return; }
    nav('/admin/orders');
  }

  return (
    <div className="container" style={{display:'grid', placeItems:'center', minHeight:'70vh'}}>
      <form onSubmit={login} className="card p-6" style={{width:'100%', maxWidth:380, display:'grid', gap:'.75rem'}}>
        <h1 className="text-xl font-bold title">Login Admin</h1>
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="input" placeholder="Senha" type="password" value={pass} onChange={e => setPass(e.target.value)} required />
        <button className="btn">Entrar</button>
      </form>
    </div>
  );
}
