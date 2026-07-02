import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { initialized, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-sm font-semibold text-slate-200">
        Dang kiem tra phien dang nhap...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
