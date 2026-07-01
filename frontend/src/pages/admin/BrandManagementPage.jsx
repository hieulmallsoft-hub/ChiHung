import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";

export default function BrandManagementPage() {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", active: true });

  const load = async () => {
    const response = await adminApi.getBrands();
    setBrands(response.data.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await adminApi.saveBrand(form);
    setForm({ name: "", description: "", active: true });
    toast.success("Đã tạo thương hiệu");
    load();
  };

  const remove = async (id) => {
    await adminApi.deleteBrand(id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="admin-card">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Danh mục</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-white">Quản lý thương hiệu</h1>
          <p className="mt-1 text-sm text-slate-300">Quản lý thương hiệu nổi bật.</p>
        </div>

        <form className="grid gap-3 md:grid-cols-4" onSubmit={submit}>
          <input
            required
            className="admin-input"
            placeholder="Tên thương hiệu"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className="admin-input md:col-span-2"
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <button className="btn-primary" type="submit">Thêm mới</button>
        </form>
      </div>

      <div className="admin-card">
        <h2 className="mb-4 font-heading text-lg font-semibold text-white">Danh sách thương hiệu</h2>
        <div className="space-y-3 text-sm">
          {brands.map((item) => (
            <div key={item.id} className="admin-subtle flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-xs text-slate-400">{item.slug}</p>
              </div>
              <button className="text-sm font-semibold text-cyan-300 hover:text-cyan-200" onClick={() => remove(item.id)}>
                Xóa
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
