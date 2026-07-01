import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminApi } from "../../api/adminApi";

const orderStatusLabels = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

export default function RevenueReportPage() {
  const [report, setReport] = useState(null);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    const load = async () => {
      const response = await adminApi.getReport({ range });
      setReport(response.data.data);
    };
    load();
  }, [range]);

  if (!report) return null;

  const orderStatusStats = (report.orderStatusStats || []).map((item) => ({
    ...item,
    label: orderStatusLabels[item.status] || item.status,
  }));

  const exportCsv = () => {
    const rows = [["Ngày", "Doanh thu"], ...(report.revenueByDay || []).map((item) => [item.label, item.revenue])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sportshop-revenue-${range}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Doanh thu</p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-white">Báo cáo doanh thu</h1>
            <p className="mt-2 text-sm text-slate-300">
              Tổng doanh thu: <span className="font-semibold text-cyan-200">{Number(report.totalRevenue || 0).toLocaleString()} VND</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="admin-select w-36" value={range} onChange={(event) => setRange(event.target.value)}>
              <option value="7d">7 ngày</option>
              <option value="30d">30 ngày</option>
              <option value="90d">90 ngày</option>
            </select>
            <button className="btn-primary" onClick={exportCsv}>Xuất CSV</button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="admin-card">
          <h2 className="mb-3 font-heading text-lg font-semibold text-white">Xu hướng doanh thu</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.revenueByDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
                <Bar dataKey="revenue" fill="#fb7185" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="mb-3 font-heading text-lg font-semibold text-white">Đà tăng trưởng doanh thu</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.revenueByDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="admin-card">
          <h3 className="mb-3 font-heading text-lg font-semibold text-white">Sản phẩm bán chạy</h3>
          <div className="space-y-3 text-sm">
            {(report.topProducts || []).map((item) => (
              <div key={item.productName} className="admin-subtle">
                {item.productName}: đã bán {item.sold}
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h3 className="mb-3 font-heading text-lg font-semibold text-white">Thống kê trạng thái đơn hàng</h3>
          <div className="grid gap-3 md:grid-cols-[1fr,180px]">
            <div className="space-y-3 text-sm">
              {orderStatusStats.map((item) => (
                <div key={item.status} className="admin-subtle">
                  {item.label}: {item.total}
                </div>
              ))}
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderStatusStats} dataKey="total" nameKey="label" outerRadius={70} fill="#fb7185" label />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
