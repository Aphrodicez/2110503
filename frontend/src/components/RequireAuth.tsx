import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

interface RequireAuthProps {
  children: ReactNode;
  role?: "admin" | "user";
}

export const RequireAuth = ({ children, role }: RequireAuthProps) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Loading account" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
