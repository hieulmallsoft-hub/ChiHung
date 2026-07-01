import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";

const emptyForm = {
  code: "",
  discountType: "PERCENT",
  discountValue: "",
  minOrderValue: "",
  maxDiscount: "",
  usageLimit: "",
  active: true,
};

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeCoupons = useMemo(() => coupons.filter((item) => item.active).length, [coupons]);

  const load = async () => {
    const response = await adminApi.getCoupons();
    setCoupons(response.data.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      discountValue: Number(form.discountValue),
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : null,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    };

    try {
      setLoading(true);
      await adminApi.saveCoupon(payload, editingId);
      toast.success(editingId ? "Đã cập nhật mã giảm giá" : "Đã tạo mã giảm giá");
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không lưu được mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm({
      code: item.code || "",
      discountType: item.discountType || "PERCENT",
      discountValue: item.discountValue ?? "",
      minOrderValue: item.minOrderValue ?? "",
      maxDiscount: item.maxDiscount ?? "",
      usageLimit: item.usageLimit ?? "",
      active: Boolean(item.active),
    });
  };

  const deactivate = async (id) => {
    if (!window.confirm("Vo hieu hoa coupon nay?")) return;
    await adminApi.deleteCoupon(id);
    toast.success("Đã vô hiệu hóa mã giảm giá");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Khuyến mãi</p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-white">Quản lý mã giảm giá</h1>
            <p className="mt-1 text-sm text-slate-300">Tạo mã giảm giá, giới hạn sử dụng và theo dõi lượt áp dụng.</p>
          </div>
          <div className="admin-subtle text-sm">
            <p className="text-slate-400">Đang kích hoạt</p>
            <p className="text-2xl font-bold text-white">{activeCoupons}</p>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={submit}>
          <input className="admin-input" required placeholder="Mã giảm giá" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
          <select className="admin-select" value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}>
            <option value="PERCENT">Phần trăm</option>
            <option value="FIXED">Số tiền cố định</option>
          </select>
          <input className="admin-input" required type="number" min="0" placeholder="Giá trị giảm" value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} />
          <input className="admin-input" type="number" min="0" placeholder="Đơn tối thiểu" value={form.minOrderValue} onChange={(e) => setForm((p) => ({ ...p, minOrderValue: e.target.value }))} />
          <input className="admin-input" type="number" min="0" placeholder="Giảm tối đa" value={form.maxDiscount} onChange={(e) => setForm((p) => ({ ...p, maxDiscount: e.target.value }))} />
          <input className="admin-input" type="number" min="1" placeholder="Giới hạn lượt dùng" value={form.usageLimit} onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))} />
          <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
            Kich hoat
          </label>
          <button className="btn-primary" disabled={loading} type="submit">
            {editingId ? "Cập nhật" : "Thêm mã giảm giá"}
          </button>
        </form>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Giảm giá</th>
              <th className="px-4 py-3">Tối thiểu/Tối đa</th>
              <th className="px-4 py-3">Lượt dùng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-semibold text-white">{item.code}</td>
                <td className="px-4 py-3">{item.discountType === "PERCENT" ? `${item.discountValue}%` : `${Number(item.discountValue || 0).toLocaleString()} VND`}</td>
                <td className="px-4 py-3 text-slate-300">
                  {Number(item.minOrderValue || 0).toLocaleString()} / {Number(item.maxDiscount || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3">{item.usageCount || 0}/{item.usageLimit || "∞"}</td>
                <td className="px-4 py-3">
                  <span className={`admin-pill ${item.active ? "text-teal-200" : "text-slate-400"}`}>{item.active ? "Đang bật" : "Đã tắt"}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="mr-3 text-sm font-semibold text-cyan-200 hover:text-white" onClick={() => edit(item)}>Sửa</button>
                  <button className="text-sm font-semibold text-slate-300 hover:text-white" onClick={() => deactivate(item.id)}>Tắt</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
