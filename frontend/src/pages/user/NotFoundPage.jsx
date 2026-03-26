import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto mt-16 max-w-lg card p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">Oops</p>
      <h1 className="mt-1 font-heading text-5xl font-extrabold text-primary-700">404</h1>
      <p className="mt-3 text-slate-500">Trang ban tim khong ton tai.</p>
      <Link to="/" className="btn-primary mt-6">Quay ve trang chu</Link>
    </div>
  );
}
