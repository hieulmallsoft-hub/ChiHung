import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
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
  const [keyword, setKeyword] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const [productRes, categoryRes, brandRes] = await Promise.all([
      adminApi.getProducts({ page: 0, size: 20, keyword }),
      adminApi.getCategories(),
      adminApi.getBrands(),
    ]);

    setProducts(productRes.data.data.content || []);
    setCategories(categoryRes.data.data || []);
    setBrands(brandRes.data.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const canSubmit = useMemo(() => form.name && form.sku && form.categoryId && form.brandId && form.price, [form]);

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    await adminApi.saveProduct({
      ...form,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stockQuantity: Number(form.stockQuantity),
      imageUrls: form.imageUrls.filter(Boolean),
    });

    toast.success("Da tao san pham");
    setForm(defaultForm);
    load();
  };

  const remove = async (id) => {
    await adminApi.deleteProduct(id);
    toast.success("Da xoa san pham");
    load();
  };

  const uploadImage = async (event, target = "thumbnail") => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const response = await adminApi.uploadMedia(file);
      const url = response.data.data.url;
      if (target === "thumbnail") {
        setForm((prev) => ({ ...prev, thumbnailUrl: url }));
      } else {
        setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
      }
      toast.success("Da upload anh");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong upload duoc anh");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="admin-card">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">Catalog</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-white">Product Management</h1>
          <p className="mt-1 text-sm text-slate-300">Tao moi va quan ly danh muc san pham.</p>
        </div>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
          <input className="admin-input" required placeholder="Ten san pham" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="admin-input" required placeholder="SKU" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} />
          <select className="admin-select" required value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}>
            <option value="">Chon category</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select className="admin-select" required value={form.brandId} onChange={(e) => setForm((p) => ({ ...p, brandId: e.target.value }))}>
            <option value="">Chon brand</option>
            {brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <input className="admin-input" required type="number" placeholder="Gia" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
          <input className="admin-input" type="number" placeholder="Gia khuyen mai" value={form.salePrice} onChange={(e) => setForm((p) => ({ ...p, salePrice: e.target.value }))} />
          <input className="admin-input" type="number" placeholder="Ton kho" value={form.stockQuantity} onChange={(e) => setForm((p) => ({ ...p, stockQuantity: e.target.value }))} />
          <input className="admin-input" placeholder="Thumbnail URL" value={form.thumbnailUrl} onChange={(e) => setForm((p) => ({ ...p, thumbnailUrl: e.target.value }))} />
          <label className="admin-subtle cursor-pointer text-sm">
            <span className="font-semibold text-white">{uploading ? "Dang upload..." : "Upload thumbnail"}</span>
            <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadImage(event, "thumbnail")} disabled={uploading} />
          </label>
          <label className="admin-subtle cursor-pointer text-sm">
            <span className="font-semibold text-white">{uploading ? "Dang upload..." : "Upload anh phu"}</span>
            <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadImage(event, "gallery")} disabled={uploading} />
          </label>
          <input className="admin-input md:col-span-2" placeholder="Mo ta ngan" value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} />
          <textarea className="admin-input md:col-span-2" placeholder="Mo ta chi tiet" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          <input className="admin-input" placeholder="Anh phu 1" onChange={(e) => setForm((p) => ({ ...p, imageUrls: [e.target.value, p.imageUrls[1], p.imageUrls[2]] }))} />
          <input className="admin-input" placeholder="Anh phu 2" onChange={(e) => setForm((p) => ({ ...p, imageUrls: [p.imageUrls[0], e.target.value, p.imageUrls[2]] }))} />
          {(form.thumbnailUrl || form.imageUrls.filter(Boolean).length > 0) && (
            <div className="md:col-span-2 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              {[form.thumbnailUrl, ...form.imageUrls].filter(Boolean).map((url) => (
                <img key={url} src={resolveMediaUrl(url)} alt="Preview" className="h-20 w-24 rounded-xl object-cover" />
              ))}
            </div>
          )}
          <button className="btn-primary md:col-span-2" type="submit">Luu san pham</button>
        </form>
      </div>

      <div className="admin-card">
        <div className="mb-4 flex gap-2">
          <input className="admin-input" placeholder="Tim san pham" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={load}>Tim</button>
        </div>
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="admin-subtle flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{product.name}</p>
                <p className="text-xs text-slate-400">{product.sku} | Ton: {product.stockQuantity}</p>
              </div>
              <button className="text-sm font-semibold text-rose-300 hover:text-rose-200" onClick={() => remove(product.id)}>
                Xoa
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
