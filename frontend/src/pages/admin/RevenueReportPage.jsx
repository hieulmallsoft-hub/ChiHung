import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminApi } from "../../api/adminApi";

export default function RevenueReportPage() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      const response = await adminApi.getReport();
      setReport(response.data.data);
    };
    load();
  }, []);

  if (!report) return null;

  return (
    <div className="space-y-4">
      <div className="admin-card">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">Revenue</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-white">Bao cao doanh thu</h1>
        <p className="mt-2 text-sm text-slate-300">
          Tong doanh thu: <span className="font-semibold text-rose-200">{Number(report.totalRevenue || 0).toLocaleString()} VND</span>
        </p>
      </div>

      <div className="admin-card">
        <h2 className="mb-3 font-heading text-lg font-semibold text-white">Revenue Trend</h2>
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="admin-card">
          <h3 className="mb-3 font-heading text-lg font-semibold text-white">Top Products</h3>
          <div className="space-y-3 text-sm">
            {(report.topProducts || []).map((item) => (
              <div key={item.productName} className="admin-subtle">
                {item.productName} - {item.sold}
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h3 className="mb-3 font-heading text-lg font-semibold text-white">Order Status Stats</h3>
          <div className="space-y-3 text-sm">
            {(report.orderStatusStats || []).map((item) => (
              <div key={item.status} className="admin-subtle">
                {item.status}: {item.total}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
