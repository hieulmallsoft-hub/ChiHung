import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { AdminError, AdminLoading, getAdminErrorMessage } from "../../components/admin/AdminStatus";

export default function InventoryManagementPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [logs, setLogs] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminApi.getProducts({ page: 0, size: 30 });
      setProducts(response.data.data.content || []);
    } catch (loadError) {
      setError(getAdminErrorMessage(loadError, "Khong tai duoc ton kho"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadLogs = async (productId) => {
    try {
      const response = await adminApi.getInventoryLogs(productId);
      setLogs(response.data.data || []);
    } catch (loadError) {
      toast.error(getAdminErrorMessage(loadError, "Khong tai duoc lich su ton kho"));
    }
  };

  const adjustStock = async (product) => {
    const quantity = window.prompt(`Nhập tồn kho mới cho ${product.name}`, product.stockQuantity);
    if (quantity === null) return;
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      toast.error("Tồn kho phải là số nguyên không âm");
      return;
    }
    const reason = window.prompt("Nhập lý do điều chỉnh tồn kho");
    if (!reason?.trim()) {
      toast.error("Cần nhập lý do điều chỉnh");
      return;
    }

    try {
      await adminApi.adjustStock(product.id, { newStockQuantity: parsedQuantity, reason: reason.trim() });
      toast.success("Cập nhật tồn kho thành công");
      setSelectedProduct(product.id);
      await Promise.all([loadProducts(), loadLogs(product.id)]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật tồn kho");
    }
  };

  const visibleProducts = products.filter((product) => {
    const value = keyword.trim().toLowerCase();
    return !value || product.name.toLowerCase().includes(value) || product.sku?.toLowerCase().includes(value);
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
      <div className="admin-card">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Tồn kho</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-white">Quản lý tồn kho</h1>
          <p className="mt-1 text-sm text-slate-300">Theo dõi tồn kho và điều chỉnh nhanh.</p>
          <input
            className="admin-input mt-4 w-full"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm tên hoặc SKU"
          />
        </div>

        {loading && <AdminLoading message="Dang tai ton kho..." />}
        {error && !loading && <AdminError message={error} onRetry={loadProducts} />}
        <div className="space-y-3 text-sm">
          {!loading && !error && visibleProducts.map((product) => (
            <div key={product.id} className="admin-subtle flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{product.name}</p>
                <p className={`text-xs font-semibold ${
                  product.stockQuantity === 0 ? "text-rose-300" : product.stockQuantity <= 5 ? "text-amber-300" : "text-emerald-300"
                }`}>
                  Tồn kho: {product.stockQuantity}
                  {product.stockQuantity === 0 ? " · Hết hàng" : product.stockQuantity <= 5 ? " · Sắp hết" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => { setSelectedProduct(product.id); loadLogs(product.id); }}
                >
                  Xem log
                </button>
                <button className="btn-primary" onClick={() => adjustStock(product)}>
                  Chinh ton
                </button>
              </div>
            </div>
          ))}
          {!loading && !error && visibleProducts.length === 0 && (
            <p className="admin-subtle text-sm text-slate-300">Khong co san pham phu hop.</p>
          )}
        </div>
      </div>

      <div className="admin-card">
        <h2 className="mb-4 font-heading text-lg font-semibold text-white">Lịch sử tồn kho</h2>
        {selectedProduct ? (
          <div className="space-y-3 text-sm">
            {logs.map((log, index) => (
              <div key={index} className="admin-subtle">
                <p className="font-semibold text-white">{log.changeType}</p>
                <p className="text-xs text-slate-400">
                  {log.quantityBefore} {" -> "} {log.quantityAfter}
                </p>
                <p className="text-xs text-slate-400">{log.reason}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString("vi-VN") : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Chọn sản phẩm để xem lịch sử tồn kho.</p>
        )}
      </div>
    </div>
  );
}
