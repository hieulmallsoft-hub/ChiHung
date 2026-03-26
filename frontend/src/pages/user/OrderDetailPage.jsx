import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { orderApi } from "../../api/orderApi";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      const response = await orderApi.getMyOrderDetail(id);
      setOrder(response.data.data);
    };
    load();
  }, [id]);

  const cancelOrder = async () => {
    try {
      await orderApi.cancelOrder(id);
      toast.success("Da huy don hang");
      const response = await orderApi.getMyOrderDetail(id);
      setOrder(response.data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong the huy don");
    }
  };

  if (!order) return null;

  return (
    <div className="space-y-4">
      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Don hang {order.orderCode}</h1>
            <p className="text-sm text-slate-500">Trang thai: {order.status}</p>
          </div>
          {(order.status === "PENDING" || order.status === "CONFIRMED") && (
            <button className="btn-secondary text-primary-700" onClick={cancelOrder}>
              Huy don hang
            </button>
          )}
        </div>
        <p className="mt-3 text-sm text-slate-600">Dia chi: {order.shippingAddress}</p>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-heading text-xl font-bold">Danh sach san pham</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between rounded-lg border border-rose-100 p-3 text-sm">
              <div>
                <p className="font-semibold">{item.productName}</p>
                <p className="text-slate-500">So luong: {item.quantity}</p>
              </div>
              <p className="font-semibold text-primary-700">{Number(item.lineTotal).toLocaleString()} VND</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-heading text-xl font-bold">Tong ket thanh toan</h2>
        <p className="flex justify-between text-sm"><span>Tam tinh</span><span>{Number(order.subtotal).toLocaleString()} VND</span></p>
        <p className="flex justify-between text-sm"><span>Ship</span><span>{Number(order.shippingFee).toLocaleString()} VND</span></p>
        <p className="flex justify-between text-sm"><span>Giam gia</span><span>- {Number(order.discountAmount).toLocaleString()} VND</span></p>
        <p className="flex justify-between border-t border-rose-200 pt-2 text-lg font-bold text-primary-700"><span>Thanh tien</span><span>{Number(order.finalTotal).toLocaleString()} VND</span></p>
      </section>

      <button onClick={() => navigate("/orders")} className="btn-secondary">
        Quay lai danh sach don hang
      </button>
    </div>
  );
}
