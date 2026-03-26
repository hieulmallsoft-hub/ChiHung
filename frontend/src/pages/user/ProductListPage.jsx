import { useEffect, useMemo, useState } from "react";
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
  sortBy: "newest",
};

export default function ProductListPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState(initialFilter);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [categoryRes, brandRes] = await Promise.all([catalogApi.getCategories(), catalogApi.getBrands()]);
        setCategories(categoryRes.data.data || []);
        setBrands(brandRes.data.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Khong tai duoc bo loc san pham");
      }
    };
    bootstrap();
  }, []);

  const params = useMemo(() => {
    const p = { ...filters, page, size: 12 };
    Object.keys(p).forEach((key) => {
      if (p[key] === "") delete p[key];
    });
    return p;
  }, [filters, page]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await catalogApi.getProducts(params);
        setPageData(response.data.data);
      } catch (error) {
        setPageData({ content: [], totalElements: 0, totalPages: 0, number: 0 });
        toast.error(error?.response?.data?.message || "Khong tai duoc danh sach san pham");
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

  return (
    <div className="space-y-6">
      <SectionTitle title="Tat ca san pham" subtitle="Tim kiem, loc va sap xep theo nhu cau" />

      <div className="section-shell space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Bo loc thong minh</p>
          <button
            className="btn-ghost"
            onClick={() => {
              setFilters(initialFilter);
              setPage(0);
            }}
          >
            Reset bo loc
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-6">
        <input
          value={filters.keyword}
          onChange={(e) => handleFilterChange("keyword", e.target.value)}
          placeholder="Tim ten san pham"
          className="md:col-span-2"
        />

        <select
          value={filters.categoryId}
          onChange={(e) => handleFilterChange("categoryId", e.target.value)}
        >
          <option value="">Tat ca danh muc</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={filters.brandId}
          onChange={(e) => handleFilterChange("brandId", e.target.value)}
        >
          <option value="">Tat ca thuong hieu</option>
          {brands.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={filters.minPrice}
          onChange={(e) => handleFilterChange("minPrice", e.target.value)}
          placeholder="Gia tu"
        />
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
          placeholder="Gia den"
        />

        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
        >
          <option value="newest">Moi nhat</option>
          <option value="priceAsc">Gia tang dan</option>
          <option value="priceDesc">Gia giam dan</option>
          <option value="bestSeller">Ban chay</option>
        </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="flex items-center justify-between rounded-2xl border border-rose-100/90 bg-white/90 px-4 py-3 text-sm text-slate-500">
            <p>
              Tim thay <span className="font-semibold text-primary-700">{pageData?.totalElements || 0}</span> san pham
            </p>
            <p className="text-xs uppercase tracking-[0.12em] text-rose-500">Catalog Sports Gear</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(pageData?.content || []).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination pageInfo={pageData} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
