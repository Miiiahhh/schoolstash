import React from "react";
import { useAdmin } from "../hooks/useAdmin";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingUI?: React.ReactNode;
};

export default function AdminGuard({ children, fallback = null, loadingUI = null }: Props) {
  const { isAdmin, loading } = useAdmin();
  if (loading) return <>{loadingUI}</>;
  if (!isAdmin) return <>{fallback}</>;
  return <>{children}</>;
}
