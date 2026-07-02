import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { AdminError, getAdminErrorMessage } from "../../components/admin/AdminStatus";
import { resolveMediaUrl } from "../../utils/media";

const defaultForm = {
  name: "",
  sku: "",
  categoryId: "",
  brandId: "",
  price: "",
  salePrice: "",
  shortDescription: "",
  description: "",
  thumbnailUrl: "",
  stockQuantity: 0,
  imageUrls: [],
};

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localPreviews, setLocalPreviews] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [productRes, categoryRes, brandRes] = await Promise.all([
        adminApi.getProducts({ page: 0, size: 20, keyword }),
        adminApi.getCategories(),
        adminApi.getBrands(),
      ]);

      setProducts(productRes.data.data.content || []);
      setCategories(categoryRes.data.data || []);
      setBrands(brandRes.data.data || []);
    } catch (error) {
      const message = getAdminErrorMessage(error, "Khong tai duoc du lieu quan tri");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const canSubmit = useMemo(
    () => form.name && form.sku && form.categoryId && form.brandId && form.price,
    [form]
  );

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setLocalPreviews([]);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      await adminApi.saveProduct(
        {
          ...form,
          price: Number(form.price),
          salePrice: form.salePrice ? Number(form.salePrice) : null,
          stockQuantity: Number(form.stockQuantity),
          imageUrls: form.imageUrls.filter(Boolean),
        },
        editingId
      );

      toast.success(editingId ? "Da cap nhat san pham" : "Da tao san pham");
      resetForm();
      load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong luu duoc san pham");
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      categoryId: product.categoryId || "",
      brandId: product.brandId || "",
      price: product.price ?? "",
      salePrice: product.salePrice ?? "",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      thumbnailUrl: product.thumbnailUrl || "",
      stockQuantity: product.stockQuantity ?? 0,
      imageUrls: Array.isArray(product.imageUrls) ? product.imageUrls.filter(Boolean) : [],
    });
    setLocalPreviews([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Xoa san pham nay?")) return;

    try {
      await adminApi.deleteProduct(id);
      toast.success("Da xoa san pham");
      if (editingId === id) resetForm();
      load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong xoa duoc san pham");
    }
  };

  const uploadImage = async (event, target = "thumbnail") => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);

    try {
      setUploading(true);
      setLocalPreviews((prev) => [...prev, { url: previewUrl, target }]);
      const response = await adminApi.uploadMedia(file);
      const url = response.data.data.url;
      if (target === "thumbnail") {
        setForm((prev) => ({ ...prev, thumbnailUrl: url }));
      } else {
        setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
      }
      setLocalPreviews((prev) => prev.filter((item) => item.url !== previewUrl));
      URL.revokeObjectURL(previewUrl);
      toast.success("Da upload anh");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong upload duoc anh");
      setLocalPreviews((prev) => prev.filter((item) => item.url !== previewUrl));
      URL.revokeObjectURL(previewUrl);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const setGalleryImage = (index, value) => {
    setForm((prev) => {
      const next = [...prev.imageUrls];
      next[index] = value;
      return { ...prev, imageUrls: next };
    });
  };

  return (
    <div className="space-y-4">
      <div className="admin-card">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">San pham</p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-white">
              {editingId ? "Cap nhat san pham" : "Quan ly san pham"}
            </h1>
            <p className="mt-1 text-sm text-slate-300">Tao moi, cap nhat va xoa san pham trong he thong.</p>
          </div>
          {editingId && (
            <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={resetForm}>
              Huy sua
            </button>
          )}
        </div>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
          <input className="admin-input" required placeholder="Ten san pham" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="admin-input" required placeholder="SKU" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} />
          <select className="admin-select" required value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}>
            <option value="">Chon danh muc</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select className="admin-select" required value={form.brandId} onChange={(e) => setForm((p) => ({ ...p, brandId: e.target.value }))}>
            <option value="">Chon thuong hieu</option>
            {brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <input className="admin-input" required type="number" min="0" placeholder="Gia" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
          <input className="admin-input" type="number" min="0" placeholder="Gia khuyen mai" value={form.salePrice} onChange={(e) => setForm((p) => ({ ...p, salePrice: e.target.value }))} />
          <input className="admin-input" type="number" min="0" placeholder="Ton kho" value={form.stockQuantity} onChange={(e) => setForm((p) => ({ ...p, stockQuantity: e.target.value }))} />
          <input className="admin-input" placeholder="Thumbnail URL" value={form.thumbnailUrl} onChange={(e) => setForm((p) => ({ ...p, thumbnailUrl: e.target.value }))} />
          <label className="admin-subtle cursor-pointer text-sm">
            <span className="font-semibold text-white">{uploading ? "Dang upload..." : "Tai anh dai dien"}</span>
            <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadImage(event, "thumbnail")} disabled={uploading} />
          </label>
          <label className="admin-subtle cursor-pointer text-sm">
            <span className="font-semibold text-white">{uploading ? "Dang upload..." : "Tai anh phu"}</span>
            <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadImage(event, "gallery")} disabled={uploading} />
          </label>
          <input className="admin-input md:col-span-2" placeholder="Mo ta ngan" value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} />
          <textarea className="admin-input md:col-span-2" placeholder="Mo ta chi tiet" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          <input className="admin-input" placeholder="Anh phu 1" value={form.imageUrls[0] || ""} onChange={(e) => setGalleryImage(0, e.target.value)} />
          <input className="admin-input" placeholder="Anh phu 2" value={form.imageUrls[1] || ""} onChange={(e) => setGalleryImage(1, e.target.value)} />
          {(form.thumbnailUrl || form.imageUrls.filter(Boolean).length > 0 || localPreviews.length > 0) && (
            <div className="md:col-span-2 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              {localPreviews.map((preview) => (
                <div key={preview.url} className="relative">
                  <img src={preview.url} alt="Dang upload" className="h-20 w-24 rounded-xl object-cover opacity-75" />
                  <span className="absolute inset-x-1 bottom-1 rounded-lg bg-slate-950/80 px-1 py-0.5 text-center text-[10px] font-semibold text-white">
                    uploading
                  </span>
                </div>
              ))}
              {[form.thumbnailUrl, ...form.imageUrls].filter(Boolean).map((url) => (
                <img key={url} src={resolveMediaUrl(url)} alt="Preview" className="h-20 w-24 rounded-xl object-cover" />
              ))}
            </div>
          )}
          <button className="btn-primary md:col-span-2" type="submit" disabled={!canSubmit}>
            {editingId ? "Cap nhat san pham" : "Luu san pham"}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <div className="mb-4 flex gap-2">
          <input className="admin-input" placeholder="Tim san pham" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={load} disabled={loading}>
            {loading ? "Dang tai..." : "Tim"}
          </button>
        </div>
        {error && <AdminError message={error} onRetry={load} />}
        <div className="space-y-3">
          {!error && products.map((product) => (
            <div key={product.id} className="admin-subtle flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-white">{product.name}</p>
                <p className="text-xs text-slate-400">{product.sku} | Ton: {product.stockQuantity}</p>
              </div>
              <div className="flex shrink-0 gap-3">
                <button className="text-sm font-semibold text-cyan-300 hover:text-cyan-200" onClick={() => startEdit(product)}>
                  Sua
                </button>
                <button className="text-sm font-semibold text-rose-300 hover:text-rose-200" onClick={() => remove(product.id)}>
                  Xoa
                </button>
              </div>
            </div>
          ))}
          {!loading && !error && products.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Khong co san pham nao.</p>
          )}
        </div>
      </div>
    </div>
  );
}
