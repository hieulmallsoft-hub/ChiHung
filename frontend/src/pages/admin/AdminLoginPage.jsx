import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LoginPage from "../user/LoginPage";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLoginPage() {
  const { user, hasRole, clearSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return;
    }

    if (hasRole("ROLE_ADMIN")) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    toast.error("Tai khoan hien tai khong co quyen admin. Vui long dang nhap bang tai khoan admin.");
    clearSession();
  }, [user, hasRole, clearSession, navigate]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(239,68,68,0.35),transparent_35%),radial-gradient(circle_at_88%_12%,rgba(14,116,144,0.25),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.9))]" />
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr,1fr]">
          <div className="admin-card">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">Admin Access</p>
            <h1 className="mt-3 font-heading text-3xl font-bold text-white">Dang nhap Admin</h1>
            <p className="mt-3 text-sm text-slate-300">He thong quan tri danh cho quan ly va van hanh.</p>
            <div className="mt-6 grid gap-3">
              <div className="admin-subtle">
                <p className="text-xs text-slate-300">Goi y tai khoan demo</p>
                <p className="text-sm font-semibold text-white">admin@sportshop.vn</p>
                <p className="text-xs text-slate-400">Mat khau: admin123</p>
              </div>
            </div>
          </div>
          <div className="admin-card">
            <LoginPage />
          </div>
        </div>
      </div>
    </div>
  );
}
