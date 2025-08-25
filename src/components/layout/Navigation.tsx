import { TrendingUp, Package, Users, Clock, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppState, AppAction } from "@/types";

interface NavigationProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export function Navigation({ state, dispatch }: NavigationProps) {
  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'inventory', label: 'Inventário', icon: Package },
    { id: 'requests', label: 'Pedidos', icon: Users },
    { id: 'movements', label: 'Movimentações', icon: Clock },
    { id: 'register', label: 'Cadastrar', icon: Plus },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const professorTabs = [
    { id: 'my-requests', label: 'Meus Pedidos', icon: Users },
    { id: 'make-request', label: 'Novo Pedido', icon: Plus },
  ];

  const tabs = state.userType === "admin" ? adminTabs : professorTabs;

  return (
    <div className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-2 overflow-x-auto py-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={state.activeTab === id ? "default" : "outline"}
              className={cn("justify-start", state.activeTab === id ? "" : "bg-background")}
              onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: id })}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
