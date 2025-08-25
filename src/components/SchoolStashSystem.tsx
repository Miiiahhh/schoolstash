import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { stats, movements, requests } from '@/data/mockData';

// Abas administrativas
import InventoryManager from '@/components/inventory/InventoryManager';
import Requests from '@/components/requests/Requests';
import Movements from '@/components/movements/Movements';
import RegisterItem from '@/components/register/RegisterItem';
import SecuritySettings from '@/components/settings/SecuritySettings';

export function SchoolStashSystem() {
  const { state, dispatch, handleLogin, handleLogout, openModal } = useAuth();

  const getCurrentProfessorRequests = () => {
    if (!state.currentUser || state.userType !== 'professor') return [];
    // ajuste para seu mock atual: se o seu objeto de pedido usa "requester" ao invés de "professor", troque abaixo
    return requests.filter((r: any) => r.professor === state.currentUser.name || r.requester === state.currentUser.name);
  };

  if (!state.isAuthenticated) {
    return <LoginForm state={state} handleLogin={handleLogin} dispatch={dispatch} />;
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header state={state} handleLogout={handleLogout} openModal={openModal} />
      <Navigation state={state} dispatch={dispatch} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {state.userType === 'admin' ? (
          <AdminPanel activeTab={state.activeTab} />
        ) : (
          <ProfessorPanel
            activeTab={state.activeTab}
            currentUser={state.currentUser}
            requests={getCurrentProfessorRequests()}
          />
        )}
      </main>
    </div>
  );
}

interface AdminPanelProps {
  activeTab: string;
}

function AdminPanel({ activeTab }: AdminPanelProps) {
  switch (activeTab) {
    case 'dashboard':
      return <Dashboard stats={stats} recentItems={movements} />;
    case 'inventory':
      return <InventoryManager />;
    case 'requests':
      return <Requests />;
    case 'movements':
      return <Movements />;
    case 'register':
      return <RegisterItem />;
    case 'settings':
      return <SecuritySettings />;   // <- Configurações (Admin)
    default:
      return <Dashboard stats={stats} recentItems={movements} />;
  }
}

interface ProfessorPanelProps {
  activeTab: string;
  currentUser: any;
  requests: any[];
}

function ProfessorPanel({ activeTab, currentUser, requests }: ProfessorPanelProps) {
  switch (activeTab) {
    case 'my-requests':
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Meus Pedidos</h2>
          <p className="text-muted-foreground mb-8">
            Você tem {requests.length} pedidos registrados no sistema.
          </p>
          {requests.length === 0 ? (
            <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
          ) : (
            <div className="text-left">
              {/* TODO: lista real de pedidos do professor */}
              <p className="text-muted-foreground">Lista de pedidos em desenvolvimento...</p>
            </div>
          )}
        </div>
      );
    case 'make-request':
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Fazer Novo Pedido</h2>
          <p className="text-muted-foreground">Formulário de pedido em desenvolvimento...</p>
        </div>
      );
    default:
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Área do Professor</h2>
          <p className="text-muted-foreground">Selecione uma opção no menu.</p>
        </div>
      );
  }
}

export default SchoolStashSystem;
