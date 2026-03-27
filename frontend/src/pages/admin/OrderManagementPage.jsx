import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"];

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState({});

  const loadOrders = async () => {
    const response = await adminApi.getOrders({ page: 0, size: 20, status: statusFilter || undefined });
    setOrders(response.data.data.content || []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    const currentStatus = orders.find((order) => order.id === id)?.status;
    if (!currentStatus || currentStatus === status) return;
    if (currentStatus === "CANCELLED" || currentStatus === "DELIVERED") {
      toast.error("Don hang da hoan tat, khong the cap nhat");
      return;
    }
    const previousStatus = orders.find((order) => order.id === id)?.status;
    setUpdatingStatus((prev) => ({ ...prev, [id]: status }));
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));

    try {
      const response = await adminApi.updateOrderStatus(id, status);
      const updated = response.data.data;
      setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: updated.status } : order)));
      if (statusFilter && updated.status !== statusFilter) {
        setOrders((prev) => prev.filter((order) => order.id !== id));
      }
      toast.success("Da cap nhat trang thai");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong the cap nhat trang thai");
      if (previousStatus) {
        setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: previousStatus } : order)));
      } else {
        loadOrders();
      }
    } finally {
      setUpdatingStatus((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
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
              {(order.status === "CANCELLED" || order.status === "DELIVERED") && (
                <span className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                  Finalized
                </span>
              )}
              {statuses.map((status) => {
                const isActive = status === order.status;
                const isUpdating = Boolean(updatingStatus[order.id]);
                const isFinalized = order.status === "CANCELLED" || order.status === "DELIVERED";
                return (
                  <button
                    key={status}
                    aria-pressed={isActive}
                    disabled={isUpdating || isFinalized}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                      isActive
                        ? "border-rose-300 bg-rose-400/20 text-rose-100 shadow-soft"
                        : isFinalized
                          ? "border-white/5 bg-white/5 text-slate-500 opacity-40"
                          : "border-white/10 bg-white/5 text-slate-300 opacity-60 hover:opacity-100 hover:border-rose-400 hover:text-white"
                    }`}
                    onClick={() => updateStatus(order.id, status)}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
