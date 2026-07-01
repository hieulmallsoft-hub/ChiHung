import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    resetCode: searchParams.get("code") || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (form.newPassword.length < 6) {
      toast.error("Mật khẩu mới tối thiểu 6 ký tự");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }

    try {
      setSubmitting(true);
      await authApi.resetPassword({
        email: form.email,
        resetCode: form.resetCode,
        newPassword: form.newPassword,
      });
      toast.success("Đã đặt lại mật khẩu");
      navigate("/login");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể đặt lại mật khẩu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl card p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">Khôi phục tài khoản</p>
      <h1 className="mt-2 font-heading text-2xl font-bold text-slate-900">Đặt lại mật khẩu</h1>
      <form onSubmit={submit} className="mt-5 space-y-3">
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          className="w-full"
        />
        <input
          required
          placeholder="Mã đặt lại"
          value={form.resetCode}
          onChange={(event) => setForm((prev) => ({ ...prev, resetCode: event.target.value }))}
          className="w-full"
        />
        <input
          required
          type="password"
          placeholder="Mật khẩu mới"
          value={form.newPassword}
          onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
          className="w-full"
        />
        <input
          required
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          value={form.confirmPassword}
          onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
          className="w-full"
        />
        <button className="btn-primary w-full" type="submit" disabled={submitting}>
          {submitting ? "Đang xử lý..." : "Cập nhật mật khẩu"}
        </button>
      </form>
      <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-primary-700 hover:text-primary-600">
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
