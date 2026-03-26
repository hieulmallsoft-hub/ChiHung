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
    <article className="group overflow-hidden rounded-3xl border border-rose-100/90 bg-white shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-glow">
      <div className="relative overflow-hidden">
        <img
          src={imageSource}
          alt={product.name}
          onError={() => setHasError(true)}
          className="h-56 w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-80" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-primary-700">
          {categoryLabel}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
          }`}
        >
          {stock > 0 ? `Con ${stock}` : "Het hang"}
        </span>
        {hasSale && (
          <span className="absolute bottom-3 left-3 rounded-full bg-primary-700 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            -{discountPercent}%
          </span>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="line-clamp-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
            {product.brandName || "SportShop"}
          </p>
          <p className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
            {(product.averageRating || 0).toFixed(1)} ★
          </p>
        </div>
        <h3 className="line-clamp-2 font-heading text-lg font-bold leading-snug text-slate-900">{product.name}</h3>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            {hasSale && (
              <p className="text-sm text-slate-400 line-through">{Number(product.price).toLocaleString()} VND</p>
            )}
            <p className="text-xl font-bold text-primary-700">{Number(displayPrice).toLocaleString()} VND</p>
          </div>
          <Link to={`/products/${product.id}`} className="btn-primary whitespace-nowrap px-3.5">
            Chi tiet
          </Link>
        </div>
      </div>
    </article>
  );
}
