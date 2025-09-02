import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import LoginBox from "../components/LoginBox";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation() as any;

  // se já estiver logado, redireciona para a rota de origem (ou home)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(location?.state?.from?.pathname || "/", { replace: true });
    });
  }, [navigate, location?.state?.from?.pathname]);

  const afterLogin = () => {
    const to = location?.state?.from?.pathname || "/";
    navigate(to, { replace: true });
  };

  return (
    <div className="container" style={{ padding: 24, display: "grid", gap: 16 }}>
      <Link to="/" className="ss-btn ss-btn--subtle">← Voltar</Link>
      <LoginBox onSuccess={afterLogin} />
      <small className="ss-dim">
        Dica: para ver as rotas de admin, faça login com um e-mail presente na tabela <code>public.admins</code>.
      </small>
    </div>
  );
}
