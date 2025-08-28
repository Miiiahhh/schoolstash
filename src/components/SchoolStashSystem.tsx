// src/components/SchoolStashSystem.tsx
import React from "react";

import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Dashboard } from "@/components/dashboard/Dashboard";

// KPIs (Supabase)
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDashboardRealtime } from "@/hooks/useDashboardRealtime";

// Páginas (admin)
import { InventoryPage } from "@/components/inventory/InventoryPage";
import { RequestsPage } from "@/components/requests/RequestsPage";
import { MovementsPage } from "@/components/movements/MovementsPage";

export function SchoolStashSystem() {
  const { state, dispatch, handleLogin, handleLogout, openModal } = useAuth();

  // KPIs do Supabase (sem mocks)
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();

  // Realtime: invalida KPIs quando tabelas mudarem
  useDashboardRealtime();

  if (!state.isAuthenticated) {
    return (
      <LoginForm state={state} handleLogin={handleLogin} dispatch={dispatch} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header state={state} handleLogout={handleLogout} openModal={openModal} />
      <Navigation state={state} dispatch={dispatch} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {state.userType === "admin" ? (
          <AdminPanel
            activeTab={state.activeTab}
            isLoading={statsLoading}
            statsData={{
              totalItems: statsData?.totalItems ?? 0,
              pendingRequests: statsData?.pendingRequests ?? 0,
              todayMovements: statsData?.todayMovements ?? 0,
              professors: statsData?.professors ?? 0,
            }}
          />
        ) : (
          <ProfessorPanel
            activeTab={state.activeTab}
            currentUser={state.currentUser}
            openModal={openModal}
          />
        )}
      </main>
    </div>
  );
}

/* =============== Admin =============== */

interface AdminPanelProps {
  activeTab: string;
  isLoading: boolean;
  statsData: {
    totalItems: number;
    pendingRequests: number;
    todayMovements: number;
    professors: number;
  };
}

function AdminPanel({ activeTab, isLoading, statsData }: AdminPanelProps) {
  switch (activeTab) {
    case "dashboard":
      return <Dashboard stats={statsData} loading={isLoading} />;

    case "inventory":
      return <InventoryPage />;

    case "requests":
      return <RequestsPage />;

    case "movements":
      return <MovementsPage />;

    case "settings":
      return (
        <Placeholder title="Configurações">
          Definições do sistema, papéis de usuário e preferências.
        </Placeholder>
      );

    default:
      return <Dashboard stats={statsData} loading={isLoading} />;
  }
}

/* =============== Professor =============== */

interface ProfessorPanelProps {
  activeTab: string;
  currentUser: any;
  openModal: (type: string) => void;
}

function ProfessorPanel({
  activeTab,
  currentUser,
  openModal,
}: ProfessorPanelProps) {
  switch (activeTab) {
    case "dashboard":
      return (
        <Placeholder title={`Bem-vindo(a), ${currentUser?.name ?? "Professor(a)"}`}>
          Selecione uma ação no topo para começar.
        </Placeholder>
      );

    case "my-requests":
      return (
        <Placeholder title="Meus Pedidos">
          Em breve listaremos seus pedidos com status em tempo real.
        </Placeholder>
      );

    case "make-request":
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Solicitar Material
          </h2>
          <p className="text-muted-foreground mb-6">
            Abra um novo pedido de material para o almoxarifado.
          </p>
          <button
            onClick={() => openModal("new-request")}
            className="rounded-lg bg-primary px-5 py-2.5 text-white hover:opacity-90"
          >
            Novo Pedido
          </button>
        </div>
      );

    case "movements":
      return (
        <Placeholder title="Minhas Movimentações">
          Em breve você verá as movimentações relacionadas aos seus pedidos.
        </Placeholder>
      );

    default:
      return (
        <Placeholder title={`Bem-vindo(a), ${currentUser?.name ?? "Professor(a)"}`}>
          Selecione uma ação no topo para começar.
        </Placeholder>
      );
  }
}

/* =============== UI utilitária =============== */

function Placeholder({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <h2 className="mb-2 text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-muted-foreground">{children}</p>
    </div>
  );
}

export default SchoolStashSystem;
