import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";

export default function InventoryManagementPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [logs, setLogs] = useState([]);

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

    await adminApi.adjustStock(product.id, { newStockQuantity: Number(quantity), reason: "Adjust from admin UI" });
    toast.success("Cap nhat ton kho thanh cong");
    setSelectedProduct(product.id);
    loadProducts();
    loadLogs(product.id);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
      <div className="admin-card">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">Inventory</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-white">Inventory Management</h1>
          <p className="mt-1 text-sm text-slate-300">Theo doi ton kho va dieu chinh nhanh.</p>
        </div>

        <div className="space-y-3 text-sm">
          {products.map((product) => (
            <div key={product.id} className="admin-subtle flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{product.name}</p>
                <p className="text-xs text-slate-400">Ton kho: {product.stockQuantity}</p>
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
