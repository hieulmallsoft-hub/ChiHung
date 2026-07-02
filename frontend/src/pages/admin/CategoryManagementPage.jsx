import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { AdminError, AdminLoading, getAdminErrorMessage } from "../../components/admin/AdminStatus";

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", active: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminApi.getCategories();
      setCategories(response.data.data || []);
    } catch (loadError) {
      setError(getAdminErrorMessage(loadError, "Khong tai duoc danh muc"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await adminApi.saveCategory(form);
      setForm({ name: "", description: "", active: true });
      toast.success("Đã tạo danh mục");
      load();
    } catch (submitError) {
      toast.error(getAdminErrorMessage(submitError, "Khong luu duoc danh muc"));
    }
  };

  const remove = async (id) => {
    try {
      await adminApi.deleteCategory(id);
      load();
    } catch (removeError) {
      toast.error(getAdminErrorMessage(removeError, "Khong xoa duoc danh muc"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="admin-card">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Danh mục</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-white">Quản lý danh mục</h1>
          <p className="mt-1 text-sm text-slate-300">Tổ chức danh mục sản phẩm và nội dung.</p>
        </div>

        <form className="grid gap-3 md:grid-cols-4" onSubmit={submit}>
          <input
            required
            className="admin-input"
            placeholder="Tên danh mục"
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
        <h2 className="mb-4 font-heading text-lg font-semibold text-white">Danh sách danh mục</h2>
        {loading && <AdminLoading message="Dang tai danh muc..." />}
        {error && !loading && <AdminError message={error} onRetry={load} />}
        <div className="space-y-3 text-sm">
          {!loading && !error && categories.map((item) => (
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
          {!loading && !error && categories.length === 0 && (
            <p className="admin-subtle text-sm text-slate-300">Chua co danh muc nao.</p>
          )}
        </div>
      </div>
    </div>
  );
}
