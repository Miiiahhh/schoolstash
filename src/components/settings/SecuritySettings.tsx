import { useEffect, useState } from "react";
import { listProfessors, upsertProfessor, removeProfessor, setAdminPassword } from "@/lib/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

type EditableProf = {
  username: string;
  name: string;
  subject: string;
  newPassword?: string;
};

export default function SecuritySettings() {
  const { toast } = useToast();
  const [admin, setAdmin] = useState({ next: "", confirm: "" });
  const [professors, setProfessors] = useState<EditableProf[]>([]);
  const [newProf, setNewProf] = useState<EditableProf>({ username: "", name: "", subject: "", newPassword: "" });

  async function load() {
    const list = listProfessors();
    setProfessors(list.map(p => ({ username: p.username, name: p.name, subject: p.subject })));
  }

  useEffect(() => { load(); }, []);

  function changeAdminPassword() {
    if (!admin.next || admin.next !== admin.confirm) {
      toast({ variant: "destructive", title: "Erro", description: "Confirmação de senha não confere." });
      return;
    }
    setAdminPassword(admin.next);
    setAdmin({ next: "", confirm: "" });
    toast({ title: "Senha do admin alterada." });
  }

  function saveProf(p: EditableProf) {
    if (!p.username || !p.name || !p.subject) {
      toast({ variant: "destructive", title: "Campos obrigatórios", description: "Usuário, nome e disciplina." });
      return;
    }
    upsertProfessor({ username: p.username, name: p.name, subject: p.subject, password: p.newPassword });
    load();
    toast({ title: "Dados do professor salvos." });
  }

  function addProf() {
    if (!newProf.username || !newProf.name || !newProf.subject) {
      toast({ variant: "destructive", title: "Preencha todos os campos do novo professor." });
      return;
    }
    upsertProfessor(newProf);
    setNewProf({ username: "", name: "", subject: "", newPassword: "" });
    load();
    toast({ title: "Professor adicionado." });
  }

  function removeProfRow(username: string) {
    removeProfessor(username);
    load();
    toast({ title: "Professor removido." });
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader><CardTitle>Senha do Administrador</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <div className="grid gap-1.5">
            <Label>Nova senha</Label>
            <Input type="password" value={admin.next} onChange={e=>setAdmin(s=>({...s, next: e.target.value}))} />
          </div>
          <div className="grid gap-1.5">
            <Label>Confirmar nova senha</Label>
            <Input type="password" value={admin.confirm} onChange={e=>setAdmin(s=>({...s, confirm: e.target.value}))} />
          </div>
          <div className="flex items-end">
            <Button onClick={changeAdminPassword}>Salvar senha</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Professores</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead className="text-right">Senha (opcional)</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professors.map((p, idx) => (
                <TableRow key={p.username}>
                  <TableCell>
                    <Input value={p.username} onChange={e=>{
                      const v = e.target.value;
                      setProfessors(list => list.map((x,i)=> i===idx ? {...x, username: v} : x));
                    }} />
                  </TableCell>
                  <TableCell>
                    <Input value={p.name} onChange={e=>{
                      const v = e.target.value;
                      setProfessors(list => list.map((x,i)=> i===idx ? {...x, name: v} : x));
                    }} />
                  </TableCell>
                  <TableCell>
                    <Input value={p.subject} onChange={e=>{
                      const v = e.target.value;
                      setProfessors(list => list.map((x,i)=> i===idx ? {...x, subject: v} : x));
                    }} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input type="password" placeholder="Definir nova senha" onChange={e=>{
                      const v = e.target.value;
                      setProfessors(list => list.map((x,i)=> i===idx ? {...x, newPassword: v} : x));
                    }} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" onClick={()=>saveProf(professors[idx])}>Salvar</Button>
                    <Button variant="destructive" onClick={()=>removeProfRow(p.username)}>Remover</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="pt-4 border-t">
            <div className="grid md:grid-cols-4 gap-3">
              <div className="grid gap-1.5">
                <Label>Novo usuário</Label>
                <Input value={newProf.username} onChange={e=>setNewProf(s=>({...s, username: e.target.value}))} placeholder="ex: prof.carla" />
              </div>
              <div className="grid gap-1.5">
                <Label>Nome</Label>
                <Input value={newProf.name} onChange={e=>setNewProf(s=>({...s, name: e.target.value}))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Disciplina</Label>
                <Input value={newProf.subject} onChange={e=>setNewProf(s=>({...s, subject: e.target.value}))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Senha</Label>
                <Input type="password" value={newProf.newPassword} onChange={e=>setNewProf(s=>({...s, newPassword: e.target.value}))} />
              </div>
            </div>
            <div className="mt-3">
              <Button onClick={addProf}>Adicionar professor</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
