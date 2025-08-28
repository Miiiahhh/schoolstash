import { Package, Search, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppState } from "@/types";

interface HeaderProps {
  state: AppState;
  handleLogout: () => void;
  openModal: (type: string) => void;
}

export function Header({ state, handleLogout, openModal }: HeaderProps) {
  return (
    <header className="bg-background/80 backdrop-blur-sm shadow-card border-b border-border/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">School Stash</h1>
              <p className="text-muted-foreground text-sm">
                {state.userType === 'admin' ? 'Painel Administrativo' : 'Portal do Professor'}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{state.currentUser?.name}</p>
              <p className="text-xs text-muted-foreground">
                {state.userType === 'admin' ? 'Administrador' : state.currentUser?.subject}
              </p>
            </div>
            
            {/* Admin Actions */}
            {state.userType === 'admin' && (
              <>
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    className="pl-10 pr-4 w-64 transition-smooth"
                  />
                </div>
                <Button
                  onClick={() => openModal('newItem')}
                  className="bg-gradient-primary hover:shadow-glow transition-smooth"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Item
                </Button>
              </>
            )}
            
            {/* Professor Actions */}
            {state.userType === 'professor' && (
              <Button
                onClick={() => openModal('newRequest')}
                className="bg-gradient-primary hover:shadow-glow transition-smooth"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Pedido
              </Button>
            )}
            
            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="transition-smooth"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
