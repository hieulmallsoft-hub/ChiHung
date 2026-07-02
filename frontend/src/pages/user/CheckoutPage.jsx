import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { orderApi } from "../../api/orderApi";
import { userApi } from "../../api/userApi";
import { useCart } from "../../hooks/useCart";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const initialAddressForm = {
  receiverName: "",
  receiverPhone: "",
  line1: "",
  city: "",
  country: "Vietnam",
};

const STANDARD_SHIPPING_FEE = 30000;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, refreshCart, loading: cartLoading } = useCart();
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [form, setForm] = useState({ addressId: "", paymentMethod: "COD", couponCode: "", shippingMethod: "STANDARD", note: "" });
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  const cartItems = cart?.items || [];
  const hasCartItems = cartItems.length > 0;
  const shippingOptions = [
    { id: "STANDARD", label: "Tiêu chuẩn", description: "2-4 ngày làm việc", fee: STANDARD_SHIPPING_FEE },
    { id: "EXPRESS", label: "Hỏa tốc", description: "Trong ngày tại nội thành", fee: STANDARD_SHIPPING_FEE + 25000 },
  ];
  const selectedShipping = shippingOptions.find((item) => item.id === form.shippingMethod) || shippingOptions[0];
  const payableTotal = Math.max(0, Number(cart?.total || 0) + selectedShipping.fee - Number(cart?.shippingFee || 0));

  const addressLabel = useMemo(
    () => addresses.find((item) => item.id === form.addressId),
    [addresses, form.addressId]
  );

  useEffect(() => {
    const load = async () => {
      setLoadingAddress(true);
      try {
        const response = await userApi.getAddresses();
        const list = response.data.data || [];
        setAddresses(list);
        if (list[0]) setForm((prev) => ({ ...prev, addressId: list[0].id }));
      } catch (error) {
        toast.error(error?.response?.data?.message || "Không tải được danh sách địa chỉ");
      } finally {
        setLoadingAddress(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const query = addressForm.line1.trim();
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoadingSuggest(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`,
          { signal: controller.signal, headers: { Accept: "application/json" } }
        );
        const data = await response.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error?.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setLoadingSuggest(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [addressForm.line1]);

  const sanitizePhone = (value) => value.replace(/\D+/g, "");

  const createAddress = async (event) => {
    event.preventDefault();
    try {
      setAddingAddress(true);
      const payload = {
        ...addressForm,
        receiverPhone: sanitizePhone(addressForm.receiverPhone),
        defaultAddress: addresses.length === 0,
      };
      const response = await userApi.addAddress(payload);
      const newAddress = response.data.data;
      const next = [...addresses, newAddress];
      setAddresses(next);
      setForm((prev) => ({ ...prev, addressId: newAddress.id }));
      setAddressForm(initialAddressForm);
      toast.success("Đã thêm địa chỉ mới");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không tạo được địa chỉ");
    } finally {
      setAddingAddress(false);
    }
  };

  const applySuggestion = (item) => {
    const address = item?.address || {};
    setAddressForm((prev) => ({
      ...prev,
      line1: item.display_name || prev.line1,
      city: address.city || address.town || address.state || prev.city,
      country: address.country || prev.country,
    }));
    setSuggestions([]);
  };

  const submitCheckout = async () => {
    if (!hasCartItems) {
      toast.error("Giỏ hàng đang trống");
      return;
    }

    if (!form.addressId) {
      toast.error("Vui lòng chọn địa chỉ");
      return;
    }

    try {
      setSubmitting(true);
      const response = await orderApi.checkout({
        addressId: form.addressId,
        paymentMethod: form.paymentMethod,
        couponCode: form.couponCode,
        shippingMethod: form.shippingMethod,
        note: `[${selectedShipping.label}] ${form.note || ""}`.trim(),
      });
      toast.success("Đặt hàng thành công");
      await refreshCart();
      navigate(`/orders/${response.data.data.id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return <LoadingSpinner text="Đang tải giỏ hàng..." />;
  }

  if (!hasCartItems) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        description="Hãy thêm sản phẩm vào giỏ trước khi thanh toán."
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[2fr,1fr]">
      <section className="card space-y-4 p-5">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Thông tin thanh toán</h1>

        <div>
          <label className="mb-1 block text-sm font-semibold">Địa chỉ nhận hàng</label>
          <select
            value={form.addressId}
            onChange={(event) => setForm((prev) => ({ ...prev, addressId: event.target.value }))}
            disabled={loadingAddress || addresses.length === 0}
          >
            {addresses.length === 0 ? (
              <option value="">Chưa có địa chỉ, vui lòng thêm mới bên dưới</option>
            ) : (
              addresses.map((address) => (
                <option value={address.id} key={address.id}>
                  {address.receiverName} - {address.line1}, {address.city}
                </option>
              ))
            )}
          </select>
          {addressLabel && (
            <p className="mt-2 text-xs text-slate-500">
              Địa chỉ đang chọn: {addressLabel.receiverName} - {addressLabel.line1}, {addressLabel.city}
            </p>
          )}
        </div>

        <form onSubmit={createAddress} className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
          <p className="mb-3 font-semibold text-slate-800">Thêm địa chỉ mới</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Tên người nhận</label>
              <input
                required
                placeholder="Tên người nhận"
                value={addressForm.receiverName}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, receiverName: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Số điện thoại</label>
              <input
                required
                placeholder="Số điện thoại"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={addressForm.receiverPhone}
                onChange={(event) =>
                  setAddressForm((prev) => ({ ...prev, receiverPhone: sanitizePhone(event.target.value) }))
                }
              />
            </div>
            <input
              required
              placeholder="Địa chỉ cụ thể"
              className="md:col-span-2"
              value={addressForm.line1}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, line1: event.target.value }))}
            />
            {(loadingSuggest || suggestions.length > 0) && (
              <div className="md:col-span-2 rounded-2xl border border-cyan-100 bg-white p-2 shadow-soft">
                {loadingSuggest && <p className="px-2 py-1 text-xs text-slate-500">Đang tìm địa chỉ...</p>}
                {!loadingSuggest &&
                  suggestions.map((item) => (
                    <button
                      key={item.place_id}
                      type="button"
                      onClick={() => applySuggestion(item)}
                      className="w-full rounded-xl px-2 py-2 text-left text-xs text-slate-700 hover:bg-cyan-50"
                    >
                      {item.display_name}
                    </button>
                  ))}
              </div>
            )}
            <input
              required
              placeholder="Thành phố"
              value={addressForm.city}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
            />
            <input
              placeholder="Quốc gia"
              value={addressForm.country}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, country: event.target.value }))}
            />
          </div>
          <button className="btn-secondary mt-3" type="submit" disabled={addingAddress}>
            {addingAddress ? "Đang thêm..." : "Lưu địa chỉ"}
          </button>
        </form>

        <div>
          <label className="mb-1 block text-sm font-semibold">Phương thức thanh toán</label>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { id: "COD", title: "COD", desc: "Thanh toán khi nhận hàng" },
              { id: "BANK_TRANSFER", title: "Chuyen khoan", desc: "Xac nhan thu cong boi admin" },
              { id: "E_WALLET_MOCK", title: "Vi dien tu", desc: "San sang gan VNPay/Momo khi co key" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, paymentMethod: item.id }))}
                className={`rounded-2xl border p-3 text-left text-sm transition ${
                  form.paymentMethod === item.id ? "border-primary-500 bg-cyan-50 shadow-soft" : "border-cyan-100 bg-white hover:border-primary-300"
                }`}
              >
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
              </button>
            ))}
          </div>
          {form.paymentMethod === "E_WALLET_MOCK" && (
            <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Chưa cấu hình khóa merchant, nên đơn sẽ được ghi nhận ở chế độ ví điện tử demo.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Phương thức giao hàng</label>
          <div className="grid gap-3 md:grid-cols-2">
            {shippingOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, shippingMethod: item.id }))}
                className={`rounded-2xl border p-3 text-left text-sm transition ${
                  form.shippingMethod === item.id ? "border-primary-500 bg-cyan-50 shadow-soft" : "border-cyan-100 bg-white hover:border-primary-300"
                }`}
              >
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                <p className="mt-2 text-sm font-bold text-primary-700">{item.fee.toLocaleString()} VND</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Mã giảm giá</label>
          <input
            value={form.couponCode}
            onChange={(event) => setForm((prev) => ({ ...prev, couponCode: event.target.value.toUpperCase() }))}
            placeholder="Nhập mã nếu chưa áp dụng trong giỏ hàng"
            className="w-full"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Ghi chu</label>
          <textarea
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            rows={3}
          />
        </div>
      </section>

      <aside className="card space-y-3 p-5">
        <h2 className="font-heading text-xl font-bold text-slate-900">Thông tin đơn hàng</h2>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-xs text-slate-600">
              <span>{item.productName} x{item.quantity}</span>
              <span>{Number(item.lineTotal || 0).toLocaleString()} VND</span>
            </div>
          ))}
        </div>
        <p className="flex justify-between text-sm"><span>Tạm tính</span><span>{Number(cart?.subtotal || 0).toLocaleString()} VND</span></p>
        <p className="flex justify-between text-sm"><span>Phi ship</span><span>{selectedShipping.fee.toLocaleString()} VND</span></p>
        <p className="flex justify-between text-sm"><span>Giảm giá</span><span>- {Number(cart?.discount || 0).toLocaleString()} VND</span></p>
        <p className="flex justify-between border-t border-cyan-200 pt-2 text-lg font-bold text-primary-700"><span>Thanh toán</span><span>{payableTotal.toLocaleString()} VND</span></p>
        <button className="btn-primary w-full" onClick={submitCheckout} disabled={submitting || loadingAddress}>
          {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
        </button>
      </aside>
    </div>
  );
}
