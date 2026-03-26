import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"];

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const loadOrders = async () => {
    const response = await adminApi.getOrders({ page: 0, size: 20, status: statusFilter || undefined });
    setOrders(response.data.data.content || []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await adminApi.updateOrderStatus(id, status);
    toast.success("Da cap nhat trang thai");
    loadOrders();
  };

  return (
    <div className="admin-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">Orders</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-white">Order Management</h1>
          <p className="mt-1 text-sm text-slate-300">Cap nhat trang thai va theo doi thanh toan.</p>
        </div>
        <div className="flex gap-2">
          <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tat ca</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={loadOrders}>Loc</button>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        {orders.map((order) => (
          <div key={order.id} className="admin-subtle">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-white">{order.orderCode}</p>
                <p className="text-xs text-slate-400">{order.receiverName} - {order.receiverPhone}</p>
              </div>
              <p className="font-semibold text-rose-200">{Number(order.finalTotal).toLocaleString()} VND</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="admin-pill">Current: {order.status}</span>
              {statuses.map((status) => (
                <button
                  key={status}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200 hover:border-rose-400 hover:text-white"
                  onClick={() => updateStatus(order.id, status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
