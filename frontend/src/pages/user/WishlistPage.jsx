import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { catalogApi } from "../../api/catalogApi";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { buildProductPlaceholder, resolveMediaUrl } from "../../utils/media";

const WISHLIST_KEY = "sportshop_wishlist";

function readWishlist() {
  try {
    const value = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item) => item?.id) : [];
  } catch {
    return [];
  }
}

function saveWishlist(items) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      const storedItems = readWishlist();
      if (storedItems.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const responses = await Promise.allSettled(
        storedItems.map((item) => catalogApi.getProductDetail(item.id))
      );

      const nextItems = storedItems.map((storedItem, index) => {
        const response = responses[index];
        if (response.status === "fulfilled") {
          return response.value.data.data;
        }
        return storedItem;
      });

      setItems(nextItems);
      saveWishlist(nextItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.salePrice || item.price,
        thumbnailUrl: item.thumbnailUrl,
      })));
      setLoading(false);
    };

    loadWishlist();
  }, []);

  const totalValue = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.salePrice || item.price || 0), 0),
    [items]
  );

  const removeItem = (id) => {
    const nextItems = items.filter((item) => item.id !== id);
    setItems(nextItems);
    saveWishlist(nextItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.salePrice || item.price,
      thumbnailUrl: item.thumbnailUrl,
    })));
    toast.success("Da bo khoi danh sach yeu thich");
  };

  const clearWishlist = () => {
    setItems([]);
    saveWishlist([]);
    toast.success("Da xoa danh sach yeu thich");
  };

  if (loading) return <LoadingSpinner />;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Chua co san pham yeu thich"
        description="Hay bam trai tim hoac nut yeu thich trong trang chi tiet san pham."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-rose-300">
              <Heart className="h-4 w-4 fill-current" />
              Wishlist
            </p>
            <h1 className="mt-3 font-heading text-3xl font-black text-white md:text-4xl">
              San pham yeu thich
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {items.length} san pham dang luu, tam tinh {totalValue.toLocaleString()} VND.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/products" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20">
              Tiep tuc mua sam
            </Link>
            <button className="btn-secondary border-rose-200 bg-rose-50 text-rose-700" onClick={clearWishlist}>
              Xoa tat ca
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const image = resolveMediaUrl(item.thumbnailUrl) || buildProductPlaceholder(item.name);
          const price = Number(item.salePrice || item.price || 0);
          const originalPrice = Number(item.price || price);
          const hasSale = Boolean(item.salePrice && Number(item.salePrice) < Number(item.price));
          const stock = Number(item.stockQuantity ?? 0);

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15"
            >
              <Link to={`/products/${item.id}`} className="block">
                <img
                  src={image}
                  alt={item.name}
                  onError={(event) => {
                    event.currentTarget.src = buildProductPlaceholder(item.name);
                  }}
                  className="h-56 w-full object-cover"
                />
              </Link>
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                      {item.brandName || "SportShop"}
                    </p>
                    <Link to={`/products/${item.id}`} className="mt-1 block font-heading text-lg font-bold text-white hover:text-cyan-300">
                      {item.name}
                    </Link>
                  </div>
                  <button
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-rose-300/30 bg-rose-500/10 text-rose-300 transition hover:bg-rose-500/20"
                    onClick={() => removeItem(item.id)}
                    type="button"
                    aria-label="Bo khoi yeu thich"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                  <div>
                    {hasSale && (
                      <p className="text-xs text-slate-400 line-through">{originalPrice.toLocaleString()} VND</p>
                    )}
                    <p className="text-xl font-black text-cyan-300">{price.toLocaleString()} VND</p>
                    <p className={`mt-1 text-xs font-semibold ${stock > 0 ? "text-teal-300" : "text-slate-400"}`}>
                      {stock > 0 ? `Con ${stock}` : "Xem chi tiet ton kho"}
                    </p>
                  </div>
                  <Link
                    to={`/products/${item.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-500"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Mua
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
