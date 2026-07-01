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
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await login(form);
      const from = location.state?.from?.pathname;
      if (hasRole("ROLE_ADMIN") || hasAdminRole(result?.user)) {
        navigate(from || "/admin/dashboard");
      } else {
        navigate(from || "/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center anim-fade-up">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl md:grid md:grid-cols-2 relative">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary-600/30 blur-[80px] pointer-events-none float-slow pulse-soft" />
        
        <div className="hidden flex-col justify-center bg-gradient-to-br from-primary-700/80 via-primary-600/80 to-cyan-700/80 p-12 text-white md:flex relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200 backdrop-blur-sm shadow-sm">
              Welcome back
            </span>
            <h2 className="mt-6 font-heading text-4xl font-black leading-tight drop-shadow-md tracking-tight">
              Đăng nhập để trải nghiệm <br /> mua sắm đỉnh cao
            </h2>
            <p className="mt-4 text-sm text-cyan-100/90 leading-relaxed font-light">
              Theo dõi đơn hàng, nhận thông báo ưu đãi và tận hưởng hỗ trợ 24/7 chỉ với một tài khoản.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 relative z-10">
          <h1 className="font-heading text-3xl font-black text-white tracking-tight">Đăng nhập</h1>
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-1">
              <input
                type="email"
                required
                placeholder="Email của bạn"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3.5 text-sm text-white placeholder-slate-400 backdrop-blur-sm focus:border-primary-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
              />
            </div>
            <div className="space-y-1">
              <input
                type="password"
                required
                placeholder="Mật khẩu"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3.5 text-sm text-white placeholder-slate-400 backdrop-blur-sm focus:border-primary-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
              />
            </div>
            <button
              disabled={loading}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-cyan-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] disabled:opacity-70 disabled:hover:scale-100"
              type="submit"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-[150%] skew-x-[-25deg] group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
            </button>
          </form>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <Link to="/forgot-password" className="font-semibold text-primary-400 transition-colors hover:text-primary-300">
              Quên mật khẩu?
            </Link>
            <p className="text-slate-400">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="font-bold text-primary-400 transition-colors hover:text-primary-300">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
