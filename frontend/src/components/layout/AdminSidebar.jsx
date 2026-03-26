import { NavLink } from "react-router-dom";

const menus = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/brands", label: "Brands" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/reports", label: "Revenue" },
  { to: "/admin/chats", label: "Chats" },
];

export default function AdminSidebar() {
  return (
    <aside className="sticky top-24 h-fit w-full rounded-3xl border border-white/10 bg-white/5 p-4 shadow-panel backdrop-blur md:w-64">
      <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-200">Admin panel</p>
        <h2 className="mt-2 font-heading text-lg font-bold text-white">Bang dieu khien</h2>
        <p className="mt-1 text-xs text-slate-300">Quan ly don hang, san pham va chat realtime.</p>
      </div>
      <div className="space-y-1">
        {menus.map((menu) => (
          <NavLink
            key={menu.to}
            to={menu.to}
            className={({ isActive }) =>
              `block rounded-2xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-glow"
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
