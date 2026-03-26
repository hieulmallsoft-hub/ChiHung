import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { cartApi } from "../../api/cartApi";
import EmptyState from "../../components/common/EmptyState";
import { useCart } from "../../hooks/useCart";

export default function CartPage() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  if (!cart?.items?.length) {
    return <EmptyState title="Gio hang trong" description="Hay them san pham de bat dau mua sam." />;
  }

  const updateQty = async (itemId, quantity) => {
    if (quantity <= 0) return;
    await cartApi.updateItem(itemId, { quantity });
    refreshCart();
  };

  const removeItem = async (itemId) => {
    await cartApi.removeItem(itemId);
    toast.success("Da xoa san pham");
    refreshCart();
  };

  const applyCoupon = async () => {
    const code = window.prompt("Nhap ma coupon");
    if (!code) return;
    try {
      await cartApi.applyCoupon(code);
      toast.success("Da ap dung coupon");
      refreshCart();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Coupon khong hop le");
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[2fr,1fr]">
      <section className="card space-y-4 p-5">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Gio hang cua ban</h1>
        {cart.items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 p-3">
            <div>
              <p className="font-semibold text-slate-900">{item.productName}</p>
              <p className="text-sm text-slate-500">{Number(item.unitPrice).toLocaleString()} VND</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary" onClick={() => updateQty(item.id, item.quantity - 1)}>
                -
              </button>
              <span className="w-7 text-center">{item.quantity}</span>
              <button className="btn-secondary" onClick={() => updateQty(item.id, item.quantity + 1)}>
                +
              </button>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary-700">{Number(item.lineTotal).toLocaleString()} VND</p>
              <button className="text-xs font-semibold text-primary-600 hover:text-primary-700" onClick={() => removeItem(item.id)}>
                Xoa
              </button>
            </div>
          </div>
        ))}
      </section>

      <aside className="card space-y-3 p-5">
        <h2 className="font-heading text-xl font-bold text-slate-900">Tong ket</h2>
        <div className="space-y-2 text-sm">
          <p className="flex justify-between"><span>Tam tinh</span><span>{Number(cart.subtotal || 0).toLocaleString()} VND</span></p>
          <p className="flex justify-between"><span>Giam gia</span><span>- {Number(cart.discount || 0).toLocaleString()} VND</span></p>
          <p className="flex justify-between"><span>Van chuyen</span><span>{Number(cart.shippingFee || 0).toLocaleString()} VND</span></p>
          <p className="flex justify-between border-t border-rose-200 pt-2 text-base font-bold text-primary-700"><span>Thanh tien</span><span>{Number(cart.total || 0).toLocaleString()} VND</span></p>
        </div>
        <button className="btn-secondary w-full" onClick={applyCoupon}>Ap dung coupon</button>
        <button className="btn-primary w-full" onClick={() => navigate("/checkout")}>Thanh toan</button>
        <Link to="/products" className="block text-center text-sm font-semibold text-primary-700 hover:text-primary-600">Tiep tuc mua sam</Link>
      </aside>
    </div>
  );
}
