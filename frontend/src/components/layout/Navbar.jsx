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
      isActive ? "bg-primary-50 text-primary-700 shadow-sm" : "text-slate-700 hover:bg-rose-50 hover:text-primary-700"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-rose-100/90 bg-white/90 backdrop-blur-xl">
      <div className="h-1 w-full bg-gradient-to-r from-primary-700 via-primary-500 to-rose-500" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-sm font-bold text-white shadow-glow">
            SS
          </div>
          <div>
            <p className="font-heading text-xl font-extrabold leading-none text-primary-700">SportShop</p>
            <p className="text-[11px] font-medium tracking-wide text-slate-500">Premium Sports Gear</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-2xl border border-rose-100 bg-white/70 p-1 md:flex">
          <NavLink to="/" className={navItemClass}>
            Trang chu
          </NavLink>
          <NavLink to="/products" className={navItemClass}>
            San pham
          </NavLink>
          {isAuthenticated && !isAdmin && (
            <>
              <NavLink to="/orders" className={navItemClass}>
                Don hang
              </NavLink>
              <NavLink to="/chat" className={navItemClass}>
                Ho tro
              </NavLink>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && (
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                isAdmin ? "bg-primary-700 text-white" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isAdmin ? "ADMIN MODE" : "USER MODE"}
            </span>
          )}

          <Link to="/cart" className="btn-secondary gap-2">
            Gio hang <span className="badge">{cartCount}</span>
          </Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn-secondary">
                Dang nhap
              </Link>
              <Link to="/register" className="btn-primary">
                Dang ky
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="btn-secondary">
                {profileLabel}
              </Link>
              {isAdmin && (
                <Link to="/admin/dashboard" className="btn-secondary border-primary-300 bg-primary-50 text-primary-700">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="btn-primary">
                Dang xuat
              </button>
            </>
          )}
        </div>

        <button
          className="btn-secondary px-3 py-2 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Mo menu"
        >
          {mobileOpen ? "Dong" : "Menu"}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-rose-100 bg-white px-4 pb-4 pt-3 md:hidden">
          <div className="grid gap-2">
            <NavLink to="/" className={navItemClass} onClick={() => setMobileOpen(false)}>
              Trang chu
            </NavLink>
            <NavLink to="/products" className={navItemClass} onClick={() => setMobileOpen(false)}>
              San pham
            </NavLink>
            {isAuthenticated && !isAdmin && (
              <>
                <NavLink to="/orders" className={navItemClass} onClick={() => setMobileOpen(false)}>
                  Don hang
                </NavLink>
                <NavLink to="/chat" className={navItemClass} onClick={() => setMobileOpen(false)}>
                  Ho tro
                </NavLink>
              </>
            )}
            <Link to="/cart" className="btn-secondary mt-1" onClick={() => setMobileOpen(false)}>
              Gio hang ({cartCount})
            </Link>

            {isAuthenticated && (
              <span
                className={`mt-1 rounded-xl px-3 py-2 text-center text-xs font-bold ${
                  isAdmin ? "bg-primary-700 text-white" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isAdmin ? "Ban dang o che do ADMIN" : "Ban dang o che do USER"}
              </span>
            )}

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-secondary" onClick={() => setMobileOpen(false)}>
                  Dang nhap
                </Link>
                <Link to="/register" className="btn-primary" onClick={() => setMobileOpen(false)}>
                  Dang ky
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="btn-secondary" onClick={() => setMobileOpen(false)}>
                  {profileLabel}
                </Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" className="btn-secondary" onClick={() => setMobileOpen(false)}>
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-primary">
                  Dang xuat
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
