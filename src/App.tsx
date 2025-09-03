import { Routes, Route, NavLink, Navigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { Toaster } from "sonner";

// Páginas
import OrdersPublic from "./pages/OrdersPublic";
import PublicOrders from "./pages/PublicOrders";
import AdminOrders from "./pages/AdminOrders";
import AdminAdmins from "./pages/AdminAdmins";
import AdminInventory from "./pages/AdminInventory";
import AdminManage from "./pages/AdminManage";
import Login from "./pages/Login";

/* -------------------------
   Hooks locais
------------------------- */
function useSession() {
  const [session, setSession] =
    useState<import("@supabase/supabase-js").Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, loading, signOut };
}

function useIsAdmin() {
  const { session, loading: loadingSession } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (loadingSession) return;
    if (!session) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .rpc("is_current_user_admin")
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error("RPC is_current_user_admin error:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [loadingSession, session?.user?.id]);

  return { isAdmin, loading };
}

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("ss-theme") as "light" | "dark") || "light"
  );
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme === "dark" ? "dark" : ""
    );
    localStorage.setItem("ss-theme", theme);
  }, [theme]);
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return { theme, toggle };
}

/* -------------------------
   Nav (logo real + centralizado)
------------------------- */
function Nav() {
  const { theme, toggle } = useTheme();
  const label = theme === "light" ? "🌙 Escuro" : "🌞 Claro";
  const { session, signOut } = useSession();
  const { isAdmin, loading } = useIsAdmin();

  return (
    <nav className="ss-nav">
      <div className="nav-inner">
        {/* ESQUERDA – logo */}
        <div className="brand-left">
          <Link to="/" className="brand-link" aria-label="Início">
            <img src="/logo-sesi.png" alt="Escola SESI" className="brand-logo" />
          </Link>
        </div>

        {/* CENTRO – pílulas */}
        <div className="center-links">
          <NavLink to="/" className="ss-pill">Fazer Pedido</NavLink>
          <NavLink to="/public" className="ss-pill">Pedidos (lista pública)</NavLink>

          {!loading && isAdmin && (
            <>
              <NavLink to="/admin" className="ss-pill">Admin • Pedidos</NavLink>
              <NavLink to="/admin/inventory" className="ss-pill">Admin • Inventário</NavLink>
              <NavLink to="/admin/admins" className="ss-pill">Gerenciar admins</NavLink>
            </>
          )}
        </div>

        {/* DIREITA – ações */}
        <div className="right-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="ss-btn ss-btn--subtle" onClick={toggle} title="Alternar tema">
            {label}
          </button>

          {session ? (
            <>
              <span className="ss-badge">{session.user.email}</span>
              <button className="ss-btn" onClick={signOut}>Sair</button>
            </>
          ) : (
            <Link to="/login" className="ss-btn">Entrar</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

/* -------------------------
   Guards
------------------------- */
function RequireAdmin({ children }: { children: JSX.Element }) {
  const { session, loading: loadingSession } = useSession();
  const { isAdmin, loading } = useIsAdmin();
  const location = useLocation();

  if (loadingSession || loading)
    return <p style={{ padding: 24 }}>Verificando permissões…</p>;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin)
    return <Navigate to="/" replace state={{ from: location, reason: "not_admin" }} />;
  return children;
}

/* -------------------------
   App
------------------------- */
export default function App() {
  return (
    <>
      <Nav />
      <Toaster position="top-center" richColors closeButton />
      <Routes>
        {/* Público */}
        <Route path="/" element={<OrdersPublic />} />
        <Route path="/public" element={<PublicOrders />} />
        <Route path="/login" element={<Login />} />

        {/* Admin protegidas */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminOrders />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/admins"
          element={
            <RequireAdmin>
              <AdminAdmins />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <RequireAdmin>
              <AdminInventory />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/manage"
          element={
            <RequireAdmin>
              <AdminManage />
            </RequireAdmin>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
