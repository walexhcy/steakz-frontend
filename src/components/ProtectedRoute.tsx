import { Navigate, Outlet } from "react-router-dom";
import { RoleName } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ roles }: { roles?: RoleName[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
