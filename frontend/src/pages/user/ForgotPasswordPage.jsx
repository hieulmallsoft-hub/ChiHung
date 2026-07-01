import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success("Đã gửi yêu cầu khôi phục mật khẩu");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể gửi yêu cầu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl card p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">Khôi phục tài khoản</p>
      <h1 className="mt-2 font-heading text-2xl font-bold text-slate-900">Quên mật khẩu</h1>
      <p className="mt-2 text-sm text-slate-600">
        Nhập email tài khoản, hệ thống sẽ tạo mã đặt lại và gửi hướng dẫn nếu email tồn tại.
      </p>

      {sent ? (
        <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
          Yeu cau da duoc ghi nhan. Kiem tra email hoac dung token reset do backend tra ve trong moi truong demo.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full"
          />
          <button className="btn-primary w-full" type="submit" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to="/reset-password" className="font-semibold text-primary-700 hover:text-primary-600">
          Tôi đã có mã đặt lại
        </Link>
        <Link to="/login" className="font-semibold text-slate-500 hover:text-primary-600">
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
