import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute() {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  if (!hasRole("ROLE_ADMIN")) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
