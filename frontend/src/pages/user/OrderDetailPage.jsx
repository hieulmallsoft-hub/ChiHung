import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { orderApi } from "../../api/orderApi";
import { createChatStompClient } from "../../utils/chatSocket";

const orderSteps = [
  { id: "PENDING", label: "Chờ xác nhận", description: "Shop đã nhận được đơn hàng" },
  { id: "CONFIRMED", label: "Đã xác nhận", description: "Shop đã xác nhận đơn hàng" },
  { id: "PROCESSING", label: "Đang chuẩn bị", description: "Sản phẩm đang được đóng gói" },
  { id: "SHIPPING", label: "Đang giao", description: "Đơn hàng đang trên đường giao" },
  { id: "DELIVERED", label: "Đã giao", description: "Giao hàng thành công" },
];

const statusLabels = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang chuẩn bị hàng",
  SHIPPING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
};

const paymentMethodLabels = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  E_WALLET_MOCK: "Ví điện tử demo",
};

const paymentStatusLabels = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  REFUNDED: "Đã hoàn tiền",
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "Chưa cập nhật";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const stompRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const response = await orderApi.getMyOrderDetail(id);
      setOrder(response.data.data);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const client = createChatStompClient({
      onConnect: () => {
        client.subscribe("/user/queue/orders", async (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            if (!payload?.orderId || payload.orderId !== id) return;
            const response = await orderApi.getMyOrderDetail(id);
            setOrder(response.data.data);
          } catch {
            // ignore malformed payload
          }
        });
      },
    });

    client.activate();
    stompRef.current = client;

    return () => {
      if (stompRef.current?.active) {
        stompRef.current.deactivate();
      }
    };
  }, [id]);

  const cancelOrder = async () => {
    try {
      await orderApi.cancelOrder(id);
      toast.success("Đã hủy đơn hàng");
      const response = await orderApi.getMyOrderDetail(id);
      setOrder(response.data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể hủy đơn");
    }
  };

  if (!order) return null;

  const currentStep = orderSteps.findIndex((step) => step.id === order.status);
  const isCancelled = order.status === "CANCELLED";
  const history = order.statusHistory?.length
    ? order.statusHistory
    : [{ status: order.status, createdAt: order.createdAt, note: "Trạng thái hiện tại" }];
  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Đơn hàng {order.orderCode}</h1>
            <p className="text-sm text-slate-500">Trạng thái: {statusLabels[order.status] || order.status}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary text-primary-700" onClick={printInvoice}>
              In hóa đơn
            </button>
          {(order.status === "PENDING" || order.status === "CONFIRMED") && (
            <button className="btn-secondary text-primary-700" onClick={cancelOrder}>
              Hủy đơn hàng
            </button>
          )}
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600">Địa chỉ: {order.shippingAddress}</p>
      </section>

      <section className="card p-5">
        <h2 className="mb-4 font-heading text-xl font-bold">Hành trình đơn hàng</h2>
        {isCancelled ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            Đơn hàng đã bị hủy. Nếu bạn cần đổi trả hoặc hỗ trợ hoàn tiền, hãy liên hệ bộ phận hỗ trợ.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-5">
            {orderSteps.map((step, index) => {
              const done = index <= currentStep;
              return (
                <div key={step.id} className={`rounded-2xl border p-3 ${done ? "border-primary-200 bg-cyan-50" : "border-slate-200 bg-white"}`}>
                  <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-primary-700 text-white" : "bg-slate-100 text-slate-400"}`}>
                    {index + 1}
                  </div>
                  <p className="font-semibold text-slate-900">{step.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{step.description}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">{done ? "Đã cập nhật" : "Đang chờ"}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="mb-4 font-heading text-xl font-bold">Chi tiết cập nhật</h2>
        <div className="space-y-0">
          {[...history].reverse().map((event, index) => (
            <div key={`${event.status}-${event.createdAt}-${index}`} className="relative flex gap-4 pb-5 last:pb-0">
              {index < history.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-rose-200" />}
              <span className="relative mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-rose-100 bg-primary-600" />
              <div>
                <p className="font-semibold text-slate-900">{statusLabels[event.status] || event.status}</p>
                <p className="text-sm text-slate-500">{event.note || "Trạng thái đơn hàng đã được cập nhật"}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDateTime(event.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-heading text-xl font-bold">Danh sách sản phẩm</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between rounded-lg border border-cyan-100 p-3 text-sm">
              <div>
                <p className="font-semibold">{item.productName}</p>
                <p className="text-slate-500">Số lượng: {item.quantity}</p>
              </div>
              <p className="font-semibold text-primary-700">{Number(item.lineTotal).toLocaleString()} VND</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-heading text-xl font-bold">Tổng kết thanh toán</h2>
        <p className="flex justify-between text-sm"><span>Phương thức</span><span>{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span></p>
        <p className="flex justify-between text-sm"><span>Trạng thái thanh toán</span><span>{paymentStatusLabels[order.paymentStatus] || order.paymentStatus}</span></p>
        <p className="flex justify-between text-sm"><span>Tạm tính</span><span>{Number(order.subtotal).toLocaleString()} VND</span></p>
        <p className="flex justify-between text-sm"><span>Phí vận chuyển</span><span>{Number(order.shippingFee).toLocaleString()} VND</span></p>
        <p className="flex justify-between text-sm"><span>Giảm giá</span><span>- {Number(order.discountAmount).toLocaleString()} VND</span></p>
        <p className="flex justify-between border-t border-rose-200 pt-2 text-lg font-bold text-primary-700"><span>Thành tiền</span><span>{Number(order.finalTotal).toLocaleString()} VND</span></p>
      </section>

      <button onClick={() => navigate("/orders")} className="btn-secondary">
        Quay lại danh sách đơn hàng
      </button>
    </div>
  );
}
