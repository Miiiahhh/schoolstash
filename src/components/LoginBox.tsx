import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = { onSuccess?: () => void };

export default function LoginBox({ onSuccess }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        onSuccess?.();
      } else {
        const { error } = await supabase.auth.signUp({ email, password: pass });
        if (error) throw error;
        alert("Cadastro criado! Se o projeto exigir confirmação por e-mail, verifique sua caixa de entrada.");
        setMode("signin");
      }
    } catch (err: any) {
      setErrorMsg(err.message ?? "Falha na autenticação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
      <h2>{mode === "signin" ? "Entrar" : "Cadastrar"}</h2>

      <input
        className="ss-input"
        placeholder="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <input
        className="ss-input"
        placeholder="senha"
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        required
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
      />

      {errorMsg && <div className="ss-card ss-card--danger">{errorMsg}</div>}

      <button className="ss-btn" type="submit" disabled={loading}>
        {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
      </button>

      <button
        type="button"
        className="ss-btn ss-btn--subtle"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
      </button>
    </form>
  );
}
