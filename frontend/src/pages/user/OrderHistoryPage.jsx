import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../../api/orderApi";
import Pagination from "../../components/common/Pagination";

export default function OrderHistoryPage() {
  const [pageData, setPageData] = useState(null);
  const [stats, setStats] = useState(null);

  const loadOrders = async (page = 0) => {
    const [ordersRes, statsRes] = await Promise.all([
      orderApi.getMyOrders({ page, size: 10 }),
      orderApi.getSpendingStats(),
    ]);

    setPageData(ordersRes.data.data);
    setStats(statsRes.data.data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="section-shell p-4">
          <p className="text-sm text-slate-500">Tong chi tieu</p>
          <p className="mt-1 text-xl font-bold text-primary-700">{Number(stats?.totalSpent || 0).toLocaleString()} VND</p>
        </div>
        <div className="section-shell p-4">
          <p className="text-sm text-slate-500">Tong don hang</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{stats?.totalOrders || 0}</p>
        </div>
        <div className="section-shell p-4">
          <p className="text-sm text-slate-500">San pham gan day</p>
          <p className="mt-1 text-sm">{(stats?.recentProducts || []).join(", ") || "Chua co"}</p>
        </div>
      </section>

      <section className="section-shell">
        <h1 className="mb-4 font-heading text-2xl font-bold text-slate-900">Lich su don hang</h1>
        <div className="space-y-3">
          {(pageData?.content || []).map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-white p-3">
              <div>
                <p className="font-semibold text-slate-900">{order.orderCode}</p>
                <p className="text-sm text-slate-500">Trang thai: {order.status}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary-700">{Number(order.finalTotal).toLocaleString()} VND</p>
                <Link to={`/orders/${order.id}`} className="text-sm font-semibold text-primary-700 hover:text-primary-600">
                  Xem chi tiet
                </Link>
              </div>
            </div>
          ))}
        </div>
        <Pagination pageInfo={pageData} onPageChange={loadOrders} />
      </section>
    </div>
  );
}
