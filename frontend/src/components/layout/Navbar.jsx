import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

export default function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = hasRole("ROLE_ADMIN");
  const cartItems = Array.isArray(cart?.items) ? cart.items : [];
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
  const profileLabel = user?.fullName?.split(" ").slice(-1)[0] || "Tai khoan";

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/");
  };

  const navItemClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm font-semibold transition ${
      isActive ? "bg-primary-600/20 text-primary-400 shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="h-1 w-full bg-gradient-to-r from-primary-700 via-primary-500 to-rose-500" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary-600 to-rose-700 text-sm font-bold text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]">
            SS
          </div>
          <div>
            <p className="font-heading text-xl font-black leading-none text-white tracking-tight">SportShop</p>
            <p className="text-[11px] font-medium tracking-widest text-primary-400 uppercase">Premium Gear</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 md:flex">
          <NavLink to="/" className={navItemClass}>
            Trang chủ
          </NavLink>
          <NavLink to="/products" className={navItemClass}>
            Sản phẩm
          </NavLink>
          {isAuthenticated && !isAdmin && (
            <>
              <NavLink to="/orders" className={navItemClass}>
                Đơn hàng
              </NavLink>
              <NavLink to="/chat" className={navItemClass}>
                Hỗ trợ
              </NavLink>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && (
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wider ${
                isAdmin ? "bg-primary-700/80 text-white shadow-[0_0_10px_rgba(225,29,72,0.5)]" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {isAdmin ? "ADMIN MODE" : "USER MODE"}
            </span>
          )}

          <Link to="/cart" className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 gap-2">
            Giỏ hàng <span className="inline-flex items-center rounded-full bg-primary-600 px-2 py-0.5 text-xs font-bold text-white">{cartCount}</span>
          </Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white/30">
                Đăng nhập
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-rose-700 px-4 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] transition hover:scale-105">
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white/30">
                {profileLabel}
              </Link>
              {isAdmin && (
                <Link to="/admin/dashboard" className="inline-flex items-center justify-center rounded-xl border border-primary-500/30 bg-primary-600/20 px-4 py-2 text-sm font-semibold text-primary-300 transition hover:bg-primary-600/40">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-rose-700 px-4 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] transition hover:scale-105">
                Đăng xuất
              </button>
            </>
          )}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-white md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Mo menu"
        >
          {mobileOpen ? "Đóng" : "Menu"}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-900/95 px-4 pb-4 pt-3 md:hidden backdrop-blur-xl">
          <div className="grid gap-2">
            <NavLink to="/" className={navItemClass} onClick={() => setMobileOpen(false)}>
              Trang chủ
            </NavLink>
            <NavLink to="/products" className={navItemClass} onClick={() => setMobileOpen(false)}>
              Sản phẩm
            </NavLink>
            {isAuthenticated && !isAdmin && (
              <>
                <NavLink to="/orders" className={navItemClass} onClick={() => setMobileOpen(false)}>
                  Đơn hàng
                </NavLink>
                <NavLink to="/chat" className={navItemClass} onClick={() => setMobileOpen(false)}>
                  Hỗ trợ
                </NavLink>
              </>
            )}
            <Link to="/cart" className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 mt-1" onClick={() => setMobileOpen(false)}>
              Giỏ hàng ({cartCount})
            </Link>

            {isAuthenticated && (
              <span
                className={`mt-2 rounded-xl px-3 py-2 text-center text-xs font-bold tracking-wide ${
                  isAdmin ? "bg-primary-700/80 text-white" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {isAdmin ? "Bạn đang ở chế độ ADMIN" : "Bạn đang ở chế độ USER"}
              </span>
            )}

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 mt-2" onClick={() => setMobileOpen(false)}>
                  Đăng nhập
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-rose-700 px-4 py-2 text-sm font-bold text-white mt-1" onClick={() => setMobileOpen(false)}>
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 mt-2" onClick={() => setMobileOpen(false)}>
                  {profileLabel}
                </Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" className="inline-flex items-center justify-center rounded-xl border border-primary-500/30 bg-primary-600/20 px-4 py-2 text-sm font-semibold text-primary-300 mt-1" onClick={() => setMobileOpen(false)}>
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-rose-700 px-4 py-2 text-sm font-bold text-white mt-1">
                  Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
