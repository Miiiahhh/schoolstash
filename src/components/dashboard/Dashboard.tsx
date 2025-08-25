import { Package, Users, AlertCircle, Clock, TrendingUp, Eye, Edit2, Trash2 } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Stats, Movement } from "@/types";

interface DashboardProps {
  stats: Stats;
  recentItems: Movement[];
}

export function Dashboard({ stats, recentItems }: DashboardProps) {
  const statCards = [
    {
      title: "Total de Itens",
      value: stats.totalItems.toLocaleString(),
      icon: Package,
      iconColor: "bg-gradient-primary",
      trend: 12
    },
    {
      title: "Professores Ativos",
      value: stats.activeProfessors,
      icon: Users,
      iconColor: "bg-success",
      trend: 8
    },
    {
      title: "Pedidos Pendentes",
      value: stats.pendingRequests,
      icon: AlertCircle,
      iconColor: "bg-warning",
      trend: -5
    },
    {
      title: "Movimentações Hoje",
      value: stats.todayMovements,
      icon: Clock,
      iconColor: "bg-primary",
      trend: 15
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Bem-vindo ao School Stash
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Gerencie o inventário escolar de forma eficiente. Acompanhe pedidos, 
          controle movimentações e mantenha o controle total dos recursos da sua instituição.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Movements */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Movimentações Recentes
            </CardTitle>
            <CardDescription>
              Últimas atividades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Professor</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentItems.slice(0, 5).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.professor}
                    </TableCell>
                    <TableCell>{item.item}</TableCell>
                    <TableCell>
                      <span className="capitalize text-sm">
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start bg-gradient-primary hover:shadow-glow transition-smooth">
              <Package className="w-4 h-4 mr-2" />
              Gerenciar Inventário
            </Button>
            <Button variant="outline" className="w-full justify-start transition-smooth">
              <Users className="w-4 h-4 mr-2" />
              Revisar Pedidos
            </Button>
            <Button variant="outline" className="w-full justify-start transition-smooth">
              <Clock className="w-4 h-4 mr-2" />
              Ver Movimentações
            </Button>
            <Button variant="outline" className="w-full justify-start transition-smooth">
              <TrendingUp className="w-4 h-4 mr-2" />
              Relatórios
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}