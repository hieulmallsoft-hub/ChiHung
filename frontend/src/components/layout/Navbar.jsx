import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  ClipboardList,
  MessageSquare,
  Search,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { catalogApi } from "../../api/catalogApi";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { buildProductPlaceholder, resolveMediaUrl } from "../../utils/media";

export default function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const blurTimer = useRef(null);

  const isAdmin = hasRole("ROLE_ADMIN");
  const cartItems = Array.isArray(cart?.items) ? cart.items : [];
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
  const profileLabel = user?.fullName?.split(" ").slice(-1)[0] || "Tài khoản";

  useEffect(() => {
    const keyword = searchTerm.trim();
    if (keyword.length < 2) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }

    let active = true;
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await catalogApi.getProducts({ keyword, page: 0, size: 5 });
        if (active) {
          setSuggestions(response.data.data?.content || []);
          setSearchOpen(true);
        }
      } catch {
        if (active) setSuggestions([]);
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/");
  };

  const goToSearch = (keyword = searchTerm) => {
    const value = keyword.trim();
    if (!value) return;
    setSearchOpen(false);
    setMobileOpen(false);
    navigate(`/products?keyword=${encodeURIComponent(value)}`);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    goToSearch();
  };

  const handleSearchBlur = () => {
    blurTimer.current = setTimeout(() => setSearchOpen(false), 150);
  };

  const handleSearchFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    if (searchTerm.trim().length >= 2) setSearchOpen(true);
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
      isActive
        ? "bg-white text-slate-950 shadow-[0_4px_12px_rgba(255,255,255,0.15)]"
        : "text-slate-300 hover:bg-white/10 hover:text-white hover:scale-105"
    }`;

  const closeMobile = () => setMobileOpen(false);

  const renderSearchResults = (compact = false) => {
    if (!searchOpen || searchTerm.trim().length < 2) return null;

    return (
      <div
        className={`absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl ${
          compact ? "rounded-2xl" : ""
        }`}
      >
        {searchLoading && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
            <span>Đang tìm...</span>
          </div>
        )}

        {!searchLoading && suggestions.length === 0 && (
          <button
            type="button"
            className="block w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/10"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => goToSearch()}
          >
            Xem kết quả cho "{searchTerm.trim()}"
          </button>
        )}

        {!searchLoading &&
          suggestions.map((product) => {
            const image = resolveMediaUrl(product.thumbnailUrl) || buildProductPlaceholder(product.name);
            const displayPrice = Number(product.salePrice || product.price || 0).toLocaleString();

            return (
              <button
                key={product.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-white/10"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setSearchOpen(false);
                  setMobileOpen(false);
                  navigate(`/products/${product.id}`);
                }}
              >
                {!compact && <img src={image} alt={product.name} className="h-12 w-12 rounded-xl object-cover border border-white/5" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{product.name}</span>
                  <span className="block text-xs text-rose-400 font-bold">{displayPrice} VND</span>
                </span>
              </button>
            );
          })}

        {!searchLoading && suggestions.length > 0 && (
          <button
            type="button"
            className="mt-1 block w-full rounded-2xl border border-white/10 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-rose-400 transition hover:bg-white/10"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => goToSearch()}
          >
            Xem tất cả kết quả
          </button>
        )}
      </div>
    );
  };

  const searchForm = (compact = false) => (
    <form className="relative w-full max-w-md mx-auto" onSubmit={handleSearchSubmit}>
      <div className="relative flex items-center w-full">
        <Search className="absolute left-4 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          placeholder="Tìm giày, áo, bóng..."
          className={`w-full border border-white/10 bg-white/[0.05] text-sm font-medium text-white placeholder:text-slate-400 outline-none transition pl-11 focus:border-rose-500 focus:bg-white/[0.1] focus:ring-2 focus:ring-rose-500/20 ${
            compact
              ? "rounded-2xl py-2.5 pr-16"
              : "h-11 rounded-full pr-20"
          }`}
        />
        <button
          type="submit"
          className={`absolute flex items-center justify-center bg-gradient-to-r from-rose-500 to-red-600 text-xs font-bold text-white transition hover:opacity-90 active:scale-95 ${
            compact 
              ? "right-1 top-1 bottom-1 rounded-xl px-3" 
              : "right-1.5 top-1.5 bottom-1.5 rounded-full px-4"
          }`}
        >
          Tìm
        </button>
      </div>
      {renderSearchResults(compact)}
    </form>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 shadow-[0_10px_35px_rgba(2,6,23,0.3)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Logo thương hiệu */}
        <Link to="/" className="group flex shrink-0 items-center gap-3" onClick={closeMobile}>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-sm font-black text-white shadow-[0_0_22px_rgba(244,63,94,0.4)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(244,63,94,0.6)]">
            SS
          </div>
          <div className="hidden sm:block">
            <p className="font-heading text-xl font-black leading-none tracking-tight text-white transition-colors duration-300 group-hover:text-rose-400">SportShop</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-rose-400">ĐỒ THỂ THAO CAO CẤP</p>
          </div>
        </Link>

        {/* Liên kết điều hướng desktop */}
        <nav className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1 lg:flex">
          <NavLink to="/" className={navItemClass}>
            <Home className="h-4 w-4" />
            <span>Trang chủ</span>
          </NavLink>
          <NavLink to="/products" className={navItemClass}>
            <ShoppingBag className="h-4 w-4" />
            <span>Sản phẩm</span>
          </NavLink>
          {isAuthenticated && !isAdmin && (
            <>
              <NavLink to="/orders" className={navItemClass}>
                <ClipboardList className="h-4 w-4" />
                <span>Đơn hàng</span>
              </NavLink>
              <NavLink to="/chat" className={navItemClass}>
                <MessageSquare className="h-4 w-4" />
                <span>Hỗ trợ</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Thanh tìm kiếm desktop */}
        <div className="hidden min-w-[280px] max-w-md flex-1 md:block">
          {searchForm()}
        </div>

        {/* Nhóm thao tác bên phải */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {isAuthenticated && (
            <span
              className={`hidden items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] xl:inline-flex ${
                isAdmin
                  ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                  : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Quản trị viên
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5" />
                  Thành viên
                </>
              )}
            </span>
          )}

          <Link
            to="/cart"
            className="group relative inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white transition-all duration-300 hover:border-rose-500/40 hover:bg-white/[0.08]"
          >
            <ShoppingCart className="h-4.5 w-4.5 text-slate-300 transition-colors group-hover:text-rose-400" />
            <span>Giỏ hàng</span>
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-2 text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(244,63,94,0.3)] transition-transform duration-300 group-hover:scale-110">
              {cartCount}
            </span>
          </Link>

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/[0.1] active:scale-95"
              >
                <User className="h-4 w-4" />
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-6 text-sm font-bold text-white shadow-[0_4px_15px_rgba(244,63,94,0.3)] transition-all duration-300 hover:opacity-95 hover:shadow-[0_4px_22px_rgba(244,63,94,0.45)] active:scale-95"
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/[0.1] active:scale-95"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-400 border border-rose-500/30">
                  {profileLabel.charAt(0).toUpperCase()}
                </div>
                <span>{profileLabel}</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 text-sm font-semibold text-rose-300 transition-all duration-300 hover:bg-rose-500/20 active:scale-95"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Quản trị
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/10 px-5 text-sm font-semibold text-slate-200 hover:text-rose-400 transition-all duration-300 active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </>
          )}
        </div>

        {/* Nút mở menu mobile */}
        <button
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08] md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 pb-6 pt-4 md:hidden backdrop-blur-xl">
          <div className="flex flex-col gap-3">
            <div className="mb-2">{searchForm(true)}</div>

            <NavLink to="/" className={navItemClass} onClick={closeMobile}>
              <Home className="h-4.5 w-4.5" />
              <span>Trang chủ</span>
            </NavLink>
            <NavLink to="/products" className={navItemClass} onClick={closeMobile}>
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>Sản phẩm</span>
            </NavLink>
            {isAuthenticated && !isAdmin && (
              <>
                <NavLink to="/orders" className={navItemClass} onClick={closeMobile}>
                  <ClipboardList className="h-4.5 w-4.5" />
                  <span>Đơn hàng</span>
                </NavLink>
                <NavLink to="/chat" className={navItemClass} onClick={closeMobile}>
                  <MessageSquare className="h-4.5 w-4.5" />
                  <span>Hỗ trợ</span>
                </NavLink>
              </>
            )}

            <div className="my-2 border-t border-white/5" />

            <Link
              to="/cart"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={closeMobile}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4.5 w-4.5 text-slate-300" />
                <span>Giỏ hàng</span>
              </div>
              <span className="rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(244,63,94,0.3)]">
                {cartCount}
              </span>
            </Link>

            {isAuthenticated && (
              <div
                className={`flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-center text-xs font-bold uppercase tracking-[0.1em] ${
                  isAdmin 
                    ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" 
                    : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                }`}
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Chế độ Quản trị viên
                  </>
                ) : (
                  <>
                    <User className="h-3.5 w-3.5" />
                    Chế độ Thành viên
                  </>
                )}
              </div>
            )}

            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link 
                  to="/login" 
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10" 
                  onClick={closeMobile}
                >
                  <User className="h-4 w-4" />
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]" 
                  onClick={closeMobile}
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10" 
                  onClick={closeMobile}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-400 border border-rose-500/30">
                    {profileLabel.charAt(0).toUpperCase()}
                  </div>
                  <span>{profileLabel}</span>
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 py-3 text-sm font-semibold text-rose-300" 
                    onClick={closeMobile}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Bảng điều khiển quản trị
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/10 py-3 text-sm font-semibold text-slate-200 hover:text-rose-400 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

