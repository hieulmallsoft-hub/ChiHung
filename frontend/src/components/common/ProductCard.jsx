import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buildProductPlaceholder, resolveMediaUrl } from "../../utils/media";

export default function ProductCard({ product }) {
  const [hasError, setHasError] = useState(false);
  const displayPrice = product.salePrice || product.price;
  const hasSale = Boolean(product.salePrice && Number(product.salePrice) < Number(product.price));
  const discountPercent = hasSale
    ? Math.max(1, Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100))
    : 0;
  const categoryLabel = product.categoryName || "Sports gear";
  const stock = Number(product.stockQuantity || 0);

  const placeholderImage = useMemo(() => buildProductPlaceholder(product.name), [product.name]);
  const resolvedImage = resolveMediaUrl(product.thumbnailUrl);
  const imageSource = hasError ? placeholderImage : resolvedImage || placeholderImage;

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:bg-white/15 hover:border-white/30">
      <div className="relative overflow-hidden">
        <img
          src={imageSource}
          alt={product.name}
          onError={() => setHasError(true)}
          className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 opacity-90 transition-opacity duration-300 group-hover:opacity-70" />
        <span className="absolute left-4 top-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
          {categoryLabel}
        </span>
        <span
          className={`absolute right-4 top-4 rounded-full backdrop-blur-md border border-white/10 px-3 py-1.5 text-[11px] font-bold shadow-sm ${
            stock > 0 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-slate-500/20 text-slate-300"
          }`}
        >
          {stock > 0 ? `Còn ${stock}` : "Hết hàng"}
        </span>
        {hasSale && (
          <span className="absolute bottom-4 left-4 rounded-full bg-primary-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]">
            -{discountPercent}%
          </span>
        )}
      </div>

      <div className="space-y-4 p-6 relative z-10 -mt-8">
        <div className="flex items-center justify-between gap-2">
          <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-400">
            {product.brandName || "SportShop"}
          </p>
          <p className="flex items-center gap-1 rounded-full bg-white/5 border border-white/5 px-2.5 py-1 text-[11px] font-bold text-yellow-400 backdrop-blur-md">
            {(product.averageRating || 0).toFixed(1)} 
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          </p>
        </div>
        <h3 className="line-clamp-2 font-heading text-lg font-bold leading-snug text-white transition-colors group-hover:text-primary-300">{product.name}</h3>

        <div className="flex items-end justify-between gap-4 pt-2 border-t border-white/5">
          <div className="min-w-0 pt-2">
            {hasSale && (
              <p className="text-xs text-slate-500 line-through mb-1">{Number(product.price).toLocaleString()} VND</p>
            )}
            <p className="text-xl font-black text-primary-400 drop-shadow-sm">{Number(displayPrice).toLocaleString()} đ</p>
          </div>
          <Link to={`/products/${product.id}`} className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-primary-600 hover:border-primary-500 hover:shadow-[0_0_15px_rgba(225,29,72,0.4)]">
            Mua ngay
          </Link>
        </div>
      </div>
    </article>
  );
}
