import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function AdminMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Fecha com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="admin-menu" ref={ref}>
      <button
        ref={btnRef}
        className="ss-pill admin-trigger"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="admin-menu-pop"
      >
        Admin
        <svg
          width="14" height="14" viewBox="0 0 24 24" aria-hidden
          style={{ marginLeft: 6, transition: "transform .15s", transform: open ? "rotate(180deg)" : "none" }}
        >
          <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {open && (
        <div id="admin-menu-pop" role="menu" className="admin-menu-pop ss-card fade-in">
          <MenuItem to="/admin/dashboard" label="Dashboard" onClick={() => setOpen(false)} />
          <MenuItem to="/admin"           label="Pedidos"   onClick={() => setOpen(false)} />
          <MenuItem to="/admin/inventory" label="Inventário" onClick={() => setOpen(false)} />
          <MenuItem to="/admin/admins"    label="Gerenciar admins" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

function MenuItem({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <NavLink
      to={to}
      role="menuitem"
      className={({ isActive }) => `admin-item${isActive ? " is-active" : ""}`}
      onClick={onClick}
    >
      {label}
    </NavLink>
  );
}
