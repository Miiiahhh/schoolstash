import { Routes, Route, NavLink, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Páginas
import OrdersPublic from './pages/OrdersPublic';
import AdminOrders from './pages/AdminOrders';
import AdminAdmins from './pages/AdminAdmins';
import AdminInventory from './pages/AdminInventory';
import AdminManage from './pages/AdminManage';

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('ss-theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
    localStorage.setItem('ss-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
  return { theme, toggle };
}

function Nav(){
  const { theme, toggle } = useTheme();
  const label = theme === 'light' ? '🌙 Escuro' : '🌞 Claro';

  return (
    <nav className="ss-nav ss-nav--grid">
      {/* ESQUERDA – área do logo como background (clique para ir ao início) */}
      <div className="brand-left">
        <Link to="/" className="brand-click" aria-label="Início" />
      </div>

      {/* CENTRO – pílulas centralizadas */}
      <div className="center-links">
        <NavLink to="/"                className="ss-pill">Pedidos (público)</NavLink>
        <NavLink to="/admin"           className="ss-pill">Admin • Pedidos</NavLink>
        <NavLink to="/admin/inventory" className="ss-pill">Admin • Inventário</NavLink>
        <NavLink to="/admin/admins"    className="ss-pill">Gerenciar admins</NavLink>
      </div>

      {/* DIREITA – ações */}
      <div className="right-actions">
        <button className="ss-btn ss-btn--subtle" onClick={toggle} title="Alternar tema">
          {label}
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        {/* Público */}
        <Route path="/" element={<OrdersPublic />} />
        {/* Admin */}
        <Route path="/admin" element={<AdminOrders />} />
        <Route path="/admin/admins" element={<AdminAdmins />} />
        <Route path="/admin/inventory" element={<AdminInventory />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
