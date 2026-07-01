import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { catalogApi } from "../../api/catalogApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ProductCard from "../../components/common/ProductCard";
import Pagination from "../../components/common/Pagination";
import SectionTitle from "../../components/common/SectionTitle";

const initialFilter = {
  keyword: "",
  categoryId: "",
  brandId: "",
  minPrice: "",
  maxPrice: "",
  inStock: "",
  sortBy: "newest",
};

export default function ProductListPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState(initialFilter);
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);
  const [searchParams] = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword") || "";

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [categoryRes, brandRes] = await Promise.all([catalogApi.getCategories(), catalogApi.getBrands()]);
        setCategories(categoryRes.data.data || []);
        setBrands(brandRes.data.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Không tải được bộ lọc sản phẩm");
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.keyword === keywordFromUrl) return prev;
      return { ...prev, keyword: keywordFromUrl };
    });
    setPage(0);
  }, [keywordFromUrl]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(filters.keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [filters.keyword]);

  const params = useMemo(() => {
    const p = { ...filters, keyword: debouncedKeyword, page, size: 12 };
    Object.keys(p).forEach((key) => {
      if (p[key] === "") delete p[key];
    });
    return p;
  }, [filters, debouncedKeyword, page]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await catalogApi.getProducts(params);
        setPageData(response.data.data);
      } catch (error) {
        setPageData({ content: [], totalElements: 0, totalPages: 0, number: 0 });
        toast.error(error?.response?.data?.message || "Không tải được danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [params]);

  const handleFilterChange = (field, value) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-400 backdrop-blur-sm focus:border-primary-500 focus:bg-white/10 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner outline-none [&>option]:bg-slate-900 [&>option]:text-white";

  return (
    <div className="space-y-8 anim-fade-up">
      <SectionTitle title="Khám phá Sản phẩm" subtitle="Bộ sưu tập đầy đủ với hàng ngàn sản phẩm cao cấp" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary-600/20 blur-[60px] float-slow pulse-soft" />
        
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-400">
            Bộ lọc thông minh
          </p>
          <button
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-white/30"
            onClick={() => {
              setFilters(initialFilter);
              setPage(0);
            }}
          >
            Đặt lại bộ lọc
          </button>
        </div>

        <div className="relative z-10 grid gap-4 md:grid-cols-6 lg:grid-cols-6">
          <input
            value={filters.keyword}
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
            placeholder="Tìm tên sản phẩm..."
            className={`md:col-span-2 lg:col-span-2 ${inputClass}`}
          />

          <select
            value={filters.categoryId}
            onChange={(e) => handleFilterChange("categoryId", e.target.value)}
            className={inputClass}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            value={filters.brandId}
            onChange={(e) => handleFilterChange("brandId", e.target.value)}
            className={inputClass}
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            placeholder="Giá từ"
            className={inputClass}
          />
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            placeholder="Giá đến"
            className={inputClass}
          />

          <select
            value={filters.inStock}
            onChange={(e) => handleFilterChange("inStock", e.target.value)}
            className={inputClass}
          >
            <option value="">Tất cả tồn kho</option>
            <option value="true">Còn hàng</option>
            <option value="false">Hết hàng</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className={inputClass}
          >
            <option value="newest">Mới nhất</option>
            <option value="priceAsc">Giá tăng dần</option>
            <option value="priceDesc">Giá giảm dần</option>
            <option value="bestSeller">Bán chạy</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300 backdrop-blur-md">
            <p>
              Hiển thị <span className="font-bold text-primary-400">{pageData?.content?.length || 0}</span> trên tổng số <span className="font-bold text-white">{pageData?.totalElements || 0}</span> sản phẩm
            </p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-teal-400 font-bold hidden sm:block">Tồn kho trực tiếp</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(pageData?.content || []).map((product, i) => (
              <div
                key={product.id}
                className={`anim-fade-up ${i % 4 === 0 ? "anim-delay-1" : i % 4 === 1 ? "anim-delay-2" : i % 4 === 2 ? "anim-delay-3" : "anim-delay-4"}`}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          {(!pageData?.content || pageData.content.length === 0) && (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <svg className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <p className="text-lg font-semibold text-white">Không tìm thấy sản phẩm nào</p>
              <p className="mt-2 text-sm text-slate-400">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
            </div>
          )}

          {pageData?.totalPages > 1 && (
            <div className="flex justify-center pt-8 border-t border-white/10">
              <Pagination pageInfo={pageData} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
