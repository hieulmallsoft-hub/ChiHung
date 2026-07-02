import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute() {
  const { initialized, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-sm font-semibold text-slate-200">
        Dang kiem tra phien quan tri...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  if (!hasRole("ROLE_ADMIN")) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
