import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { cartApi } from "../../api/cartApi";
import EmptyState from "../../components/common/EmptyState";
import { useCart } from "../../hooks/useCart";
import { useState } from "react";

export default function CartPage() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");

  if (!cart?.items?.length) {
    return <EmptyState title="Giỏ hàng trống" description="Hãy thêm sản phẩm để bắt đầu mua sắm." />;
  }

  const updateQty = async (itemId, quantity) => {
    if (quantity <= 0) return;
    try {
      await cartApi.updateItem(itemId, { quantity });
      refreshCart();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không cập nhật được số lượng");
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartApi.removeItem(itemId);
      toast.success("Đã xóa sản phẩm");
      refreshCart();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không xóa được sản phẩm");
    }
  };

  const applyCoupon = async (event) => {
    event.preventDefault();
    const code = couponCode.trim();
    if (!code) return;
    try {
      await cartApi.applyCoupon(code);
      toast.success("Đã áp dụng mã giảm giá");
      setCouponCode("");
      refreshCart();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Mã giảm giá không hợp lệ");
    }
  };

  const clearCoupon = async () => {
    try {
      await cartApi.clearCoupon();
      toast.success("Đã bỏ mã giảm giá");
      refreshCart();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không bỏ được mã giảm giá");
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[2fr,1fr]">
      <section className="card space-y-4 p-5">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Giỏ hàng của bạn</h1>
        {cart.items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-100 p-3">
            <div>
              <p className="font-semibold text-slate-900">{item.productName}</p>
              <p className="text-sm text-slate-500">{Number(item.unitPrice).toLocaleString()} VND</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary" onClick={() => updateQty(item.id, item.quantity - 1)}>
                -
              </button>
              <span className="inline-flex h-10 min-w-12 items-center justify-center rounded-xl border border-cyan-100 bg-white px-3 text-sm font-bold text-slate-900">
                {item.quantity}
              </span>
              <button className="btn-secondary" onClick={() => updateQty(item.id, item.quantity + 1)}>
                +
              </button>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary-700">{Number(item.lineTotal).toLocaleString()} VND</p>
              <button className="text-xs font-semibold text-primary-600 hover:text-primary-700" onClick={() => removeItem(item.id)}>
                Xóa
              </button>
            </div>
          </div>
        ))}
      </section>

      <aside className="card space-y-3 p-5">
        <h2 className="font-heading text-xl font-bold text-slate-900">Tổng kết</h2>
        <div className="space-y-2 text-sm">
          <p className="flex justify-between"><span>Tạm tính</span><span>{Number(cart.subtotal || 0).toLocaleString()} VND</span></p>
          <p className="flex justify-between"><span>Giảm giá</span><span>- {Number(cart.discount || 0).toLocaleString()} VND</span></p>
          <p className="flex justify-between"><span>Vận chuyển</span><span>{Number(cart.shippingFee || 0).toLocaleString()} VND</span></p>
          <p className="flex justify-between border-t border-cyan-200 pt-2 text-base font-bold text-primary-700"><span>Thành tiền</span><span>{Number(cart.total || 0).toLocaleString()} VND</span></p>
        </div>
        <form className="flex gap-2" onSubmit={applyCoupon}>
          <input
            className="min-w-0 flex-1"
            placeholder="SPORT10, FREESHIP50..."
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
          />
          <button className="btn-secondary" type="submit">Áp dụng</button>
        </form>
        {(cart.discount || 0) > 0 && (
          <button className="btn-ghost w-full" onClick={clearCoupon}>Bỏ mã giảm giá</button>
        )}
        <button className="btn-primary w-full" onClick={() => navigate("/checkout")}>Thanh toán</button>
        <Link to="/products" className="block text-center text-sm font-semibold text-primary-700 hover:text-primary-600">Tiep tuc mua sam</Link>
      </aside>
    </div>
  );
}
