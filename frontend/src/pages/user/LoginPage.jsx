import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

function normalizeRoleName(role) {
  if (!role) return null;
  let normalized = String(role).trim().toUpperCase();
  if (!normalized) return null;
  if (!normalized.startsWith("ROLE_")) {
    normalized = `ROLE_${normalized}`;
  }
  return normalized;
}

function hasAdminRole(user) {
  if (!user) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some((role) => {
    if (typeof role === "string") return normalizeRoleName(role) === "ROLE_ADMIN";
    if (role && typeof role === "object") {
      return normalizeRoleName(role.name || role.authority || role.role) === "ROLE_ADMIN";
    }
    return false;
  });
}

export default function LoginPage() {
  const { login, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await login(form);
      const from = location.state?.from?.pathname;
      if (hasRole("ROLE_ADMIN") || hasAdminRole(result?.user)) {
        navigate(from || "/admin/dashboard");
      } else {
        navigate(from || "/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Dang nhap that bai");
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-soft md:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-8 text-white md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-100">Welcome back</p>
        <h2 className="mt-3 font-heading text-3xl font-bold leading-tight">Dang nhap de tiep tuc mua sam</h2>
        <p className="mt-3 text-sm text-rose-100">
          Theo doi don hang, chat realtime voi admin va quan ly thong tin ca nhan ngay trong mot giao dien.
        </p>
      </div>

      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Dang nhap</h1>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          <input
            type="password"
            required
            placeholder="Mat khau"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />
          <button className="btn-primary w-full" type="submit">
            Dang nhap
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Chua co tai khoan?{" "}
          <Link to="/register" className="font-semibold text-primary-700 hover:text-primary-600">
            Dang ky ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
