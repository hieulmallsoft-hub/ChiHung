import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminFloatingChatWidget from "../chat/AdminFloatingChatWidget";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(239,68,68,0.35),transparent_35%),radial-gradient(circle_at_88%_12%,rgba(14,116,144,0.25),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.9))]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 via-red-500 to-orange-400 text-sm font-extrabold text-white shadow-glow">
              SS
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-200">Admin workspace</p>
              <h1 className="font-heading text-xl font-bold text-white">SportShop Control</h1>
            </div>
          </div>
          <Link to="/" className="btn-secondary text-sm border-white/20 bg-white/10 text-white hover:bg-white/20">
            Ve trang user
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 md:flex-row md:px-6">
        <AdminSidebar />
        <section className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-panel backdrop-blur md:p-5">
          {children}
        </section>
      </main>
      <AdminFloatingChatWidget />
    </div>
  );
}
