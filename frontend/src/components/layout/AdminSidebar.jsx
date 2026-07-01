import { NavLink } from "react-router-dom";

const menus = [
  { to: "/admin/dashboard", label: "Bảng điều khiển" },
  { to: "/admin/users", label: "Người dùng" },
  { to: "/admin/categories", label: "Danh mục" },
  { to: "/admin/brands", label: "Thương hiệu" },
  { to: "/admin/products", label: "Sản phẩm" },
  { to: "/admin/inventory", label: "Tồn kho" },
  { to: "/admin/orders", label: "Đơn hàng" },
  { to: "/admin/coupons", label: "Mã giảm giá" },
  { to: "/admin/reports", label: "Doanh thu" },
  { to: "/admin/chats", label: "Chat" },
];

export default function AdminSidebar() {
  return (
    <aside className="sticky top-24 h-fit w-full rounded-3xl border border-white/10 bg-white/5 p-4 shadow-panel backdrop-blur md:w-64">
      <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-200">Bảng quản trị</p>
        <h2 className="mt-2 font-heading text-lg font-bold text-white">Bảng điều khiển</h2>
        <p className="mt-1 text-xs text-slate-300">Quản lý đơn hàng, sản phẩm và chat thời gian thực.</p>
      </div>
      <div className="space-y-1">
        {menus.map((menu) => (
          <NavLink
            key={menu.to}
            to={menu.to}
            className={({ isActive }) =>
              `block rounded-2xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-orange-400 text-white shadow-glow"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {menu.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
