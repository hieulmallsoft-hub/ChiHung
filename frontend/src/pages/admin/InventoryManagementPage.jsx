import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";

export default function InventoryManagementPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [logs, setLogs] = useState([]);
  const [keyword, setKeyword] = useState("");

  const loadProducts = async () => {
    const response = await adminApi.getProducts({ page: 0, size: 30 });
    setProducts(response.data.data.content || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadLogs = async (productId) => {
    const response = await adminApi.getInventoryLogs(productId);
    setLogs(response.data.data || []);
  };

  const adjustStock = async (product) => {
    const quantity = window.prompt(`Nhap ton kho moi cho ${product.name}`, product.stockQuantity);
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">Inventory</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-white">Inventory Management</h1>
          <p className="mt-1 text-sm text-slate-300">Theo doi ton kho va dieu chinh nhanh.</p>
          <input
            className="admin-input mt-4 w-full"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm tên hoặc SKU"
          />
        </div>

        <div className="space-y-3 text-sm">
          {visibleProducts.map((product) => (
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
        </div>
      </div>

      <div className="admin-card">
        <h2 className="mb-4 font-heading text-lg font-semibold text-white">Inventory Logs</h2>
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
          <p className="text-sm text-slate-400">Chon san pham de xem lich su ton kho.</p>
        )}
      </div>
    </div>
  );
}
