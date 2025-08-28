// src/components/NavBar.tsx
import { Link, NavLink } from 'react-router-dom';

// Paleta SESI usada no projeto
const brand = {
  azul: '#0B5ED7',
  azulEscuro: '#084298',
  texto: '#0F172A',
  borda: '#E5E7EB',
};

export default function NavBar() {
  return (
    <nav
      style={{
        background: '#FFFFFF',
        borderBottom: `1px solid ${brand.borda}`,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 0',
        }}
      >
        {/* Marca */}
        <Link
          to="/public"
          style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}
          aria-label="Ir para Pedidos (público)"
        >
          {/* Ajuste o arquivo se o nome do logo for diferente */}
          <img
            src="/logo-sesi.png"
            alt="SESI"
            // Logo maior, responsivo (entre 32 e 52 px)
            style={{ height: 'clamp(32px, 5vw, 52px)', width: 'auto', display: 'block' }}
          />
          <span
            style={{
              fontWeight: 800,
              color: brand.texto,
              letterSpacing: 0.3,
              fontSize: 'clamp(16px, 2.2vw, 22px)',
              lineHeight: 1,
            }}
          >
            School Stash Hub
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <NavLink
            to="/public"
            className="underline"
            style={({ isActive }) => ({
              color: isActive ? brand.azulEscuro : brand.azul,
              textDecorationColor: brand.azul,
              fontWeight: isActive ? 800 : 700,
            })}
          >
            Pedidos (público)
          </NavLink>

          <NavLink
            to="/admin/orders"
            className="underline"
            style={({ isActive }) => ({
              color: isActive ? brand.azulEscuro : brand.azul,
              textDecorationColor: brand.azul,
              fontWeight: isActive ? 800 : 700,
            })}
          >
            Admin
          </NavLink>

          <NavLink
            to="/admin/inventory"
            className="underline"
            style={({ isActive }) => ({
              color: isActive ? brand.azulEscuro : brand.azul,
              textDecorationColor: brand.azul,
              fontWeight: isActive ? 800 : 700,
            })}
          >
            Inventário
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
