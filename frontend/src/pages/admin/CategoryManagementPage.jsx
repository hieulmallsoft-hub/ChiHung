import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", active: true });

  const load = async () => {
    const response = await adminApi.getCategories();
    setCategories(response.data.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await adminApi.saveCategory(form);
    setForm({ name: "", description: "", active: true });
    toast.success("Da tao category");
    load();
  };

  const remove = async (id) => {
    await adminApi.deleteCategory(id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="admin-card">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">Catalog</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-white">Category Management</h1>
          <p className="mt-1 text-sm text-slate-300">To chuc danh muc san pham va noi dung.</p>
        </div>

        <form className="grid gap-3 md:grid-cols-4" onSubmit={submit}>
          <input
            required
            className="admin-input"
            placeholder="Ten category"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className="admin-input md:col-span-2"
            placeholder="Mo ta"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <button className="btn-primary" type="submit">Them moi</button>
        </form>
      </div>

      <div className="admin-card">
        <h2 className="mb-4 font-heading text-lg font-semibold text-white">Danh sach category</h2>
        <div className="space-y-3 text-sm">
          {categories.map((item) => (
            <div key={item.id} className="admin-subtle flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-xs text-slate-400">{item.slug}</p>
              </div>
              <button className="text-sm font-semibold text-rose-300 hover:text-rose-200" onClick={() => remove(item.id)}>
                Xoa
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
