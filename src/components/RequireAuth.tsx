import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useFinance } from "@/context/FinanceContext";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading, authLoading } = useFinance();
  const location = useLocation();

  const isLoading = useMemo(() => loading || authLoading, [loading, authLoading]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
