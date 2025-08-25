import { useState } from "react";
import { AppState, AppAction } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LoginForm({
  state,
  dispatch,
  handleLogin,
}: {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  handleLogin: (userType: "admin"|"professor", username: string, password: string) => void;
}) {
  const [userType, setUserType] = useState<"admin"|"professor">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    handleLogin(userType, username, password);
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-1.5">
              <Label>Tipo de usuário</Label>
              <Select value={userType} onValueChange={(v: any)=>setUserType(v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {userType === "professor" && (
              <div className="grid gap-1.5">
                <Label>Usuário</Label>
                <Input value={username} onChange={e=>setUsername(e.target.value)} placeholder="ex: prof.ana" />
              </div>
            )}

            <div className="grid gap-1.5">
              <Label>Senha</Label>
              <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            </div>

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}

            <Button type="submit" disabled={state.isLoading}>
              {state.isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
