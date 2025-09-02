import { useLocation, useNavigate, Link } from "react-router-dom";
import LoginBox from "../components/LoginBox";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation() as any;

  // se já estiver logado, manda pra home
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
    <div style={{ padding: 24, display: "grid", gap: 16 }}>
      <Link to="/" className="ss-btn ss-btn--subtle">← Voltar</Link>
      <LoginBox onSuccess={afterLogin} />
      <small style={{ opacity: 0.7 }}>
        Dica: para ter acesso de admin, faça login com um e-mail que já esteja na tabela <code>public.admins</code>.
      </small>
    </div>
  );
}
