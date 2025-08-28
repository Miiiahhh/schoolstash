import { useState } from "react";
import { AppState, AppAction } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export function LoginForm({
  state,
  dispatch,
  handleLogin,
}: {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  handleLogin: (userType: "admin"|"professor", email: string, password: string) => void;
}) {
  const [mode, setMode] = useState<"signin"|"signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signin") {
      handleLogin("professor", email, password); // papel real vem do profile
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        dispatch({ type: "SET_ERROR", payload: error.message });
      } else {
        dispatch({ type: "SET_ERROR", payload: "Cadastro criado! Verifique seu e-mail para confirmar a conta e depois faça login." });
      }
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{mode === "signin" ? "Entrar" : "Criar conta"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>

            <div className="grid gap-1.5">
              <Label>Senha</Label>
              <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}

            <Button type="submit" disabled={state.isLoading}>
              {mode === "signin" ? (state.isLoading ? "Entrando..." : "Entrar") : "Criar conta"}
            </Button>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-sm text-muted-foreground underline"
            >
              {mode === "signin" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
