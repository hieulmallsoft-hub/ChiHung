import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center anim-fade-up">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl md:grid md:grid-cols-2 relative">
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-600/30 blur-[80px] pointer-events-none float-slower pulse-soft" />
        
        <div className="hidden flex-col justify-center bg-gradient-to-br from-primary-800/80 via-primary-700/80 to-cyan-700/80 p-12 text-white md:flex relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200 backdrop-blur-sm shadow-sm">
              Create Account
            </span>
            <h2 className="mt-6 font-heading text-4xl font-black leading-tight drop-shadow-md tracking-tight">
              Bắt đầu hành trình <br /> thể thao của bạn
            </h2>
            <p className="mt-4 text-sm text-cyan-100/90 leading-relaxed font-light">
              Tạo tài khoản trong 1 phút để mua sắm nhanh hơn, theo dõi đơn hàng và nhận hỗ trợ ưu tiên.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 relative z-10">
          <h1 className="font-heading text-3xl font-black text-white tracking-tight">Đăng ký</h1>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <input
              required
              placeholder="Họ và tên"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3.5 text-sm text-white placeholder-slate-400 backdrop-blur-sm focus:border-primary-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
            />
            <input
              required
              type="email"
              placeholder="Email của bạn"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3.5 text-sm text-white placeholder-slate-400 backdrop-blur-sm focus:border-primary-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
            />
            <input
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3.5 text-sm text-white placeholder-slate-400 backdrop-blur-sm focus:border-primary-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
            />
            <input
              required
              type="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3.5 text-sm text-white placeholder-slate-400 backdrop-blur-sm focus:border-primary-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
            />
            <button
              disabled={loading}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl mt-6 bg-gradient-to-r from-primary-600 to-cyan-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] disabled:opacity-70 disabled:hover:scale-100"
              type="submit"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-[150%] skew-x-[-25deg] group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {loading ? "Đang xử lý..." : "Đăng ký ngay"}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm">
            <p className="text-slate-400">
              Đã có tài khoản?{" "}
              <Link to="/login" className="font-bold text-primary-400 transition-colors hover:text-primary-300">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
