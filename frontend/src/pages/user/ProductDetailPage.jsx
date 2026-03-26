import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { catalogApi } from "../../api/catalogApi";
import { cartApi } from "../../api/cartApi";
import { reviewApi } from "../../api/reviewApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ProductCard from "../../components/common/ProductCard";
import SectionTitle from "../../components/common/SectionTitle";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { buildProductPlaceholder, resolveMediaUrl } from "../../utils/media";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [activeImage, setActiveImage] = useState(null);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const [detailRes, relatedRes, reviewRes] = await Promise.all([
        catalogApi.getProductDetail(id),
        catalogApi.getRelatedProducts(id),
        reviewApi.getProductReviews(id, { page: 0, size: 20 }),
      ]);

      setProduct(detailRes.data.data);
      setRelatedProducts(relatedRes.data.data || []);
      setReviews(reviewRes.data.data.content || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const addToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Vui long dang nhap de mua hang");
      return;
    }

    const safeQuantity = Math.max(1, Math.min(Number(product?.stockQuantity || 1), Number(qty) || 1));
    await cartApi.addItem({ productId: product.id, quantity: safeQuantity });
    await refreshCart();
    toast.success("Da them vao gio hang");
  };

  const buyNow = async () => {
    await addToCart();
    navigate("/cart");
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      toast.error("Vui long dang nhap de danh gia");
      return;
    }

    try {
      await reviewApi.createReview({
        productId: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      toast.success("Da gui danh gia");
      setReviewForm({ rating: 5, comment: "" });
      loadDetail();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong the gui danh gia");
    }
  };

  const mediaItems = useMemo(() => {
    if (!product) return [];
    const thumbnail = resolveMediaUrl(product.thumbnailUrl);
    const gallery = Array.isArray(product.imageUrls)
      ? product.imageUrls.map((url) => resolveMediaUrl(url)).filter(Boolean)
      : [];
    const merged = [thumbnail, ...gallery].filter(Boolean);
    const unique = Array.from(new Set(merged));
    return unique.length > 0 ? unique : [buildProductPlaceholder(product.name || "SportShop")];
  }, [product]);

  useEffect(() => {
    setActiveImage(null);
  }, [product?.id]);

  if (loading || !product) return <LoadingSpinner />;

  const price = Number(product.salePrice || product.price);
  const originalPrice = Number(product.price || price);
  const hasSale = Boolean(product.salePrice && Number(product.salePrice) < Number(product.price));
  const discountPercent = hasSale
    ? Math.max(1, Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100))
    : 0;
  const safeQty = Number.isNaN(qty) || qty < 1 ? 1 : qty;
  const maxQty = Math.max(1, product.stockQuantity || 1);
  const productImage = activeImage || mediaItems[0] || buildProductPlaceholder(product.name);

  const adjustQty = (delta) => {
    setQty((current) => {
      const next = Math.max(1, Math.min(maxQty, Number(current || 1) + delta));
      return next;
    });
  };

  return (
    <div className="space-y-10">
      <section className="section-shell grid gap-8 lg:grid-cols-[1.15fr,1fr] animate-reveal">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-soft">
            <img
              src={productImage}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.src = buildProductPlaceholder(product.name);
              }}
              className="h-[360px] w-full object-cover md:h-[460px]"
            />
            {hasSale && (
              <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                Giam {discountPercent}%
              </span>
            )}
            <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
              SKU {product.sku || "SP-NEW"}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {mediaItems.map((item, index) => (
              <button
                key={`${item}-${index}`}
                onClick={() => setActiveImage(item)}
                className={`h-20 w-24 overflow-hidden rounded-2xl border transition ${
                  item === productImage ? "border-primary-600 shadow-glow" : "border-rose-100 hover:border-primary-300"
                }`}
              >
                <img src={item} alt={`${product.name}-${index + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="label-chip">{product.categoryName}</span>
            <span className="label-chip">{product.brandName}</span>
            <span className="label-chip bg-amber-50 text-amber-700 border-amber-200">Chinh hang 100%</span>
          </div>

          <h1 className="font-heading text-3xl font-extrabold text-slate-900 md:text-4xl">{product.name}</h1>
          <p className="text-sm text-slate-600">{product.shortDescription}</p>

          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-rose-100 bg-white p-3 text-center text-xs text-slate-600">
            <div>
              <p className="text-lg font-bold text-slate-900">{(product.averageRating || 0).toFixed(1)}</p>
              <p>Danh gia</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{Number(product.soldCount || 0).toLocaleString()}</p>
              <p>Da ban</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{Number(product.stockQuantity || 0)}</p>
              <p>Ton kho</p>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-5">
            <div className="flex flex-wrap items-end gap-3">
              {hasSale && (
                <p className="text-base text-slate-400 line-through">{originalPrice.toLocaleString()} VND</p>
              )}
              <p className="text-4xl font-extrabold text-primary-700">{price.toLocaleString()} VND</p>
              {hasSale && <span className="badge bg-amber-200 text-amber-800">Tiet kiem {discountPercent}%</span>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700">Hoan 7 ngay</span>
              <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700">Free ship tu 500k</span>
              <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700">Bao hanh 12 thang</span>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-rose-100 bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <p className="font-semibold text-slate-800">So luong</p>
              <p className="text-xs text-slate-500">Toi da {maxQty}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => adjustQty(-1)} className="btn-secondary px-3">
                -
              </button>
              <input
                type="number"
                min="1"
                max={maxQty}
                value={safeQty}
                onChange={(event) => setQty(Math.max(1, Math.min(maxQty, Number(event.target.value))))}
                className="w-24 text-center"
              />
              <button onClick={() => adjustQty(1)} className="btn-secondary px-3">
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={addToCart} className="btn-secondary flex-1 border-primary-200 bg-rose-50 text-primary-700">
                Them vao gio
              </button>
              <button onClick={buyNow} className="btn-primary flex-1">
                Mua ngay
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white p-4 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-800">Thong tin van chuyen</p>
            <p className="mt-2">Nhanh 2-3 ngay, ho tro doi tra neu san pham loi.</p>
          </div>
        </div>
      </section>

      <section className="section-shell grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="space-y-6">
          <SectionTitle title="Mo ta chi tiet" />
          <div className="rounded-2xl border border-rose-100 bg-white p-5 text-sm leading-7 text-slate-700">
            {product.description}
          </div>
        </div>

        <div className="space-y-6">
          <SectionTitle title="Danh gia san pham" />
          <form onSubmit={submitReview} className="grid gap-3 md:grid-cols-[120px,1fr,auto]">
          <select
            value={reviewForm.rating}
            onChange={(event) => setReviewForm((prev) => ({ ...prev, rating: event.target.value }))}
          >
            {[5, 4, 3, 2, 1].map((rate) => (
              <option key={rate} value={rate}>
                {rate} sao
              </option>
            ))}
          </select>
          <input
            value={reviewForm.comment}
            onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
            placeholder="Nhan xet cua ban"
          />
          <button className="btn-primary" type="submit">
            Gui
          </button>
        </form>

          <div className="space-y-3">
            {reviews.length === 0 && (
              <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-4 text-sm text-slate-600">
                Chua co danh gia nao. Hay la nguoi dau tien!
              </div>
            )}
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-rose-100 bg-white p-4 shadow-soft">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-slate-900">{review.userName}</p>
                  <p className="font-semibold text-primary-700">{review.rating} sao</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionTitle title="San pham lien quan" subtitle="Goi y them de ban so sanh nhanh va chon size phu hop." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
