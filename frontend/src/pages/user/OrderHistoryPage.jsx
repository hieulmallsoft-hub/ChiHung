import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { orderApi } from "../../api/orderApi";
import Pagination from "../../components/common/Pagination";
import { createChatStompClient } from "../../utils/chatSocket";

export default function OrderHistoryPage() {
  const [pageData, setPageData] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const stompRef = useRef(null);

  const statusConfig = {
    PENDING: { label: "Chờ xác nhận", tone: "bg-amber-100 text-amber-700 border-amber-200" },
    CONFIRMED: { label: "Đã xác nhận", tone: "bg-sky-100 text-sky-700 border-sky-200" },
    PROCESSING: { label: "Đang xử lý", tone: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    SHIPPING: { label: "Đang giao", tone: "bg-blue-100 text-blue-700 border-blue-200" },
    DELIVERED: { label: "Đã giao", tone: "bg-teal-100 text-teal-700 border-teal-200" },
    CANCELLED: { label: "Đã hủy", tone: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  };

  const statusIcon = (status) => {
    const common = "h-4 w-4";
    switch (status) {
      case "PENDING":
        return (
          <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "CONFIRMED":
        return (
          <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 12l4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        );
      case "PROCESSING":
        return (
          <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 12h4M17 12h4M12 3v4M12 17v4" strokeLinecap="round" />
            <circle cx="12" cy="12" r="5" />
          </svg>
        );
      case "SHIPPING":
        return (
          <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7h11v8H3zM14 9h4l3 3v3h-7z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="18" cy="17" r="2" />
          </svg>
        );
      case "DELIVERED":
        return (
          <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "CANCELLED":
        return (
          <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
          </svg>
        );
    }
  };

  const tabs = [
    { key: "all", label: "Tất cả", statuses: null },
    { key: "pending", label: "Chờ xác nhận", statuses: ["PENDING"] },
    { key: "processing", label: "Đang xử lý", statuses: ["CONFIRMED", "PROCESSING"] },
    { key: "shipping", label: "Đang giao", statuses: ["SHIPPING"] },
    { key: "delivered", label: "Đã giao", statuses: ["DELIVERED"] },
    { key: "cancelled", label: "Đã hủy", statuses: ["CANCELLED"] },
  ];

  const loadOrders = async (page = 0) => {
    const tab = tabs.find((item) => item.key === activeTab);
    const [ordersRes, statsRes] = await Promise.all([
      orderApi.getMyOrders({
        page,
        size: 10,
        statuses: tab?.statuses?.join(",") || undefined,
      }),
      orderApi.getSpendingStats(),
    ]);

    setPageData(ordersRes.data.data);
    setStats(statsRes.data.data);
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  useEffect(() => {
    const client = createChatStompClient({
      onConnect: () => {
        client.subscribe("/user/queue/orders", (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            if (!payload?.orderId) return;
            setPageData((prev) => {
              if (!prev?.content) return prev;
              const next = prev.content.map((order) =>
                order.id === payload.orderId ? { ...order, status: payload.status } : order
              );
              return { ...prev, content: next };
            });
          } catch {
            // ignore malformed payload
          }
        });
      },
      onWebSocketError: () => {
        // silent fallback
      },
    });

    client.activate();
    stompRef.current = client;

    return () => {
      if (stompRef.current?.active) {
        stompRef.current.deactivate();
      }
    };
  }, []);

  const orderCounts = useMemo(() => {
    const counts = { all: 0 };
    const orders = pageData?.content || [];
    counts.all = orders.length;
    orders.forEach((order) => {
      const key = order.status || "UNKNOWN";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [pageData]);

  const filteredOrders = pageData?.content || [];

  const handleCancel = async (id) => {
    try {
      await orderApi.cancelOrder(id);
      toast.success("Đã hủy đơn hàng");
      loadOrders(pageData?.number || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể hủy đơn");
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="section-shell p-4">
          <p className="text-sm text-slate-500">Tổng chi tiêu</p>
          <p className="mt-1 text-xl font-bold text-primary-700">{Number(stats?.totalSpent || 0).toLocaleString()} VND</p>
        </div>
        <div className="section-shell p-4">
          <p className="text-sm text-slate-500">Tổng đơn hàng</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{stats?.totalOrders || 0}</p>
        </div>
        <div className="section-shell p-4">
          <p className="text-sm text-slate-500">Sản phẩm gần đây</p>
          <p className="mt-1 text-sm">{(stats?.recentProducts || []).join(", ") || "Chưa có"}</p>
        </div>
      </section>

      <section className="section-shell">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/70 to-white p-5">
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-primary-100/60 blur-2xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-cyan-200/60 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">Đơn hàng của bạn</p>
              <h1 className="mt-2 font-heading text-2xl font-bold text-slate-900">Kiểm tra đơn hàng</h1>
              <p className="text-sm text-slate-500">Theo dõi trạng thái rõ ràng và dễ hiểu.</p>
            </div>
            <div className="rounded-full border border-cyan-200 bg-white/90 px-3 py-1 text-xs font-semibold text-primary-700 shadow-soft">
              {orderCounts.all} đơn trong trang này
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            const count =
              tab.key === "all"
                ? orderCounts.all
                : tab.statuses?.reduce((total, status) => total + (orderCounts[status] || 0), 0) || 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-primary-600 bg-primary-600 text-white shadow-soft"
                    : "border-cyan-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-primary-700">
                    {tab.key === "all" ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
                      </svg>
                    ) : (
                      statusIcon(tab.statuses?.[0])
                    )}
                  </span>
                  {tab.label} ({count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-cyan-100 bg-white p-5 text-center text-sm text-slate-500">
              Chưa có đơn hàng phù hợp với bộ lọc này.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusMeta = statusConfig[order.status] || {
                label: order.status,
                tone: "bg-slate-100 text-slate-600 border-slate-200",
              };
              const previewItem = order.items?.[0];
              const extraCount = (order.items?.length || 0) - 1;
              const canCancel = order.status === "PENDING" || order.status === "CONFIRMED";

              return (
                <article key={order.id} className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary-700/10 px-3 py-1 text-xs font-bold text-primary-700">
                        SportShop
                      </div>
                      <p className="text-sm font-semibold text-slate-700">{order.orderCode}</p>
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${statusMeta.tone}`}>
                        {statusIcon(order.status)}
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Ngày đặt: {formatDate(order.createdAt)}</p>
                  </div>

                  <div className="px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {previewItem ? previewItem.productName : "Sản phẩm"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Số lượng: {previewItem?.quantity || 1}
                          {extraCount > 0 && ` • +${extraCount} sản phẩm khác`}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">Địa chỉ: {order.shippingAddress}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-slate-500">Thành tiền</p>
                        <p className="text-lg font-bold text-primary-700">{Number(order.finalTotal).toLocaleString()} VND</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-100 bg-cyan-50 text-primary-700">
                          {statusIcon(order.status)}
                        </span>
                        {statusMeta.label}
                      </div>
                      {canCancel && (
                        <button onClick={() => handleCancel(order.id)} className="btn-secondary text-primary-700">
                          Hủy đơn
                        </button>
                      )}
                      <Link to={`/orders/${order.id}`} className="btn-primary px-4">
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="mt-5">
          <Pagination pageInfo={pageData} onPageChange={loadOrders} />
        </div>
      </section>
    </div>
  );
}
