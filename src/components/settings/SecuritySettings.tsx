import { useEffect, useState } from "react";
import { listProfilesForAdmin, setUserRole, Profile } from "@/lib/profilesApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SecuritySettings() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  async function load() {
    try {
      const data = await listProfilesForAdmin();
      setProfiles(data);
    } catch (e) {
      console.error(e);
      setProfiles([]);
    }
  }
  useEffect(() => { load(); }, []);

  async function changeRole(u: Profile, role: "admin"|"professor") {
    await setUserRole(u.id, role);
    await load();
    alert(`Papel de ${u.display_name} atualizado para ${role}.`);
  }

  return (
    <Card>
      <CardHeader><CardTitle>Usuários & Papéis</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário (id)</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.display_name}</TableCell>
                <TableCell className="text-xs">{p.id}</TableCell>
                <TableCell>
                  <Select value={p.role} onValueChange={(v:any)=>changeRole(p, v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">admin</SelectItem>
                      <SelectItem value="professor">professor</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" onClick={load}>Atualizar</Button>
                </TableCell>
              </TableRow>
            ))}
            {profiles.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sem dados ou sem permissão.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
