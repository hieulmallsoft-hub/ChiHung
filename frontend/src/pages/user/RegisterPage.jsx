import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(form);
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Dang ky that bai");
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-soft md:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 p-8 text-white md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-100">Create account</p>
        <h2 className="mt-3 font-heading text-3xl font-bold leading-tight">Bat dau mua sam thong minh cung SportShop</h2>
        <p className="mt-3 text-sm text-rose-100">
          Tao tai khoan trong 1 phut de mua hang nhanh hon, theo doi lich su don va nhan ho tro chat realtime.
        </p>
      </div>

      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Dang ky tai khoan</h1>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input required placeholder="Ho ten" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          <input placeholder="So dien thoai" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <input required type="password" placeholder="Mat khau" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
          <button className="btn-primary w-full" type="submit">
            Dang ky
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Da co tai khoan?{" "}
          <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-600">
            Dang nhap
          </Link>
        </p>
      </div>
    </div>
  );
}
