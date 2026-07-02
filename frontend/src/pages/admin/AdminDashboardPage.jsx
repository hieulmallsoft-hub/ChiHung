import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminApi } from "../../api/adminApi";
import { AdminError, AdminLoading, getAdminErrorMessage } from "../../components/admin/AdminStatus";

const orderStatusLabels = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminApi.getDashboard();
      setSummary(response.data.data);
    } catch (loadError) {
      setError(getAdminErrorMessage(loadError, "Khong tai duoc bang dieu khien"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "Tổng người dùng", value: summary.totalUsers },
      { label: "Tổng sản phẩm", value: summary.totalProducts },
      { label: "Tổng đơn hàng", value: summary.totalOrders },
      { label: "Doanh thu", value: `${Number(summary.totalRevenue || 0).toLocaleString()} VND` },
    ];
  }, [summary]);

  const orderStatusStats = useMemo(
    () =>
      (summary?.orderStatusStats || []).map((item) => ({
        ...item,
        label: orderStatusLabels[item.status] || item.status,
      })),
    [summary]
  );

  if (loading) return <AdminLoading message="Dang tai bang dieu khien..." />;
  if (error) return <AdminError message={error} onRetry={load} />;
  if (!summary) return <AdminError message="Backend khong tra ve du lieu bang dieu khien." onRetry={load} />;

  return (
    <div className="space-y-5">
      <div className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Tổng quan</p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-white">Bảng điều khiển quản trị</h1>
            <p className="mt-1 text-sm text-slate-300">Tổng quan hệ thống và xu hướng doanh thu.</p>
          </div>
          <div className="flex gap-2">
            <span className="admin-pill">Thời gian thực</span>
            <span className="admin-pill">Hôm nay</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="admin-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="admin-card">
          <div className="mb-4">
            <h2 className="font-heading text-lg font-semibold text-white">Doanh thu theo ngày</h2>
            <p className="text-xs text-slate-400">So sánh doanh thu theo ngày</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.revenueByDay || []}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
                <Legend />
                <Bar dataKey="revenue" fill="#fb7185" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <div className="mb-4">
            <h2 className="font-heading text-lg font-semibold text-white">Trạng thái đơn hàng</h2>
            <p className="text-xs text-slate-400">Phân bổ trạng thái đơn hàng</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderStatusStats} dataKey="total" nameKey="label" outerRadius={90} fill="#f97316" label />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="admin-card">
          <h2 className="mb-4 font-heading text-lg font-semibold text-white">Đơn hàng gần đây</h2>
          <div className="space-y-3">
            {(summary.recentOrders || []).map((order) => (
              <div key={order.orderCode} className="admin-subtle">
                <p className="font-semibold text-white">{order.orderCode} - {order.customerName}</p>
                <p className="text-xs text-slate-400">{orderStatusLabels[order.status] || order.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="mb-4 font-heading text-lg font-semibold text-white">Sản phẩm bán chạy</h2>
          <div className="space-y-3">
            {(summary.topProducts || []).map((item) => (
              <div key={item.productName} className="admin-subtle">
                <p className="font-semibold text-white">{item.productName}</p>
                <p className="text-xs text-slate-400">Đã bán: {item.sold}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
