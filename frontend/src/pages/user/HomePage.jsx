import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { catalogApi } from "../../api/catalogApi";
import ProductCard from "../../components/common/ProductCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SectionTitle from "../../components/common/SectionTitle";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const highlights = [
    "Pickleball & Cau long",
    "Giay chay bo",
    "Gym accessories",
    "Bong da chinh hang",
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const response = await catalogApi.getProducts({ page: 0, size: 8, sortBy: "bestSeller" });
        setProducts(response.data.data.content || []);
      } catch (error) {
        setProducts([]);
        toast.error(error?.response?.data?.message || "Khong tai duoc danh sach san pham");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md md:p-14">
        <div className="pointer-events-none absolute -left-16 top-24 h-64 w-64 rounded-full bg-primary-600/30 blur-[80px] float-slow pulse-soft" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-rose-500/20 blur-[100px] float-slower" />

        <div className="relative grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center z-10">
          <div className="space-y-8">
            <span className="inline-flex w-fit items-center rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-primary-300 anim-fade-up anim-delay-1 backdrop-blur-sm shadow-[0_0_15px_rgba(225,29,72,0.3)]">
              Cửa hàng Thể thao Premium + Realtime Chat
            </span>

            <h1 className="font-heading text-5xl font-black leading-[1.1] md:text-7xl anim-fade-up anim-delay-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400">
              Thiết bị đẳng cấp,
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-rose-400">chạm đỉnh vinh quang.</span>
            </h1>

            <p className="max-w-xl text-base text-slate-300 md:text-lg anim-fade-up anim-delay-3 leading-relaxed font-light">
              Khám phá bộ sưu tập thể thao đỉnh cao: từ vợt pickleball, giày chạy bộ chuyên dụng đến trang phục thi đấu. Sẵn sàng bứt phá giới hạn.
            </p>

            <div className="flex flex-wrap gap-4 anim-fade-up anim-delay-4">
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-rose-700 px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(225,29,72,0.5)]"
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-[150%] skew-x-[-25deg] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                Khám phá ngay
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:border-white/40"
              >
                Chat hỗ trợ 24/7
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 backdrop-blur-xl md:p-8 anim-fade-up anim-delay-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <p className="text-sm font-semibold tracking-wider text-slate-300 uppercase anim-fade-in anim-delay-3">Xu hướng hiện tại</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {highlights.map((item, index) => (
                <span
                  key={item}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 anim-fade-up ${
                    index === 0 ? "bg-primary-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]" : "bg-white/5 text-slate-300 hover:bg-white/15 border border-white/10"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-white/5 bg-white/5 px-2 py-4 backdrop-blur-md transition-transform hover:-translate-y-1 anim-fade-up anim-delay-1">
                <p className="text-3xl font-black text-white">50+</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Sản phẩm</p>
              </div>
              <div className="rounded-2xl border border-primary-500/20 bg-primary-900/20 px-2 py-4 backdrop-blur-md transition-transform hover:-translate-y-1 anim-fade-up anim-delay-2 shadow-[inset_0_0_20px_rgba(225,29,72,0.1)]">
                <p className="text-3xl font-black text-primary-400">24/7</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-primary-300/80">Hỗ trợ Live</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 px-2 py-4 backdrop-blur-md transition-transform hover:-translate-y-1 anim-fade-up anim-delay-3">
                <p className="text-3xl font-black text-white">100%</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Chính hãng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionTitle title="Sản phẩm nổi bật" subtitle="Những item được săn đón nhiều nhất trong tháng" />
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`anim-fade-up ${index % 4 === 0 ? "anim-delay-1" : index % 4 === 1 ? "anim-delay-2" : index % 4 === 2 ? "anim-delay-3" : "anim-delay-4"}`}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Trải nghiệm mượt mà",
            desc: "Tìm kiếm và lọc sản phẩm cực nhanh với giao diện tối ưu hóa hiệu suất.",
          },
          {
            title: "Đồng bộ tức thời",
            desc: "Số lượng tồn kho được cập nhật realtime, đảm bảo trải nghiệm mua sắm chuẩn xác.",
          },
          {
            title: "Tương tác trực tiếp",
            desc: "Kết nối ngay với đội ngũ hỗ trợ qua hệ thống chat tích hợp sẵn trên mọi trang.",
          },
        ].map((item, index) => (
          <article
            key={item.title}
            className={`rounded-[2rem] border border-white/20 bg-white/10 p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] hover:bg-white/15 anim-fade-up ${index === 0 ? "anim-delay-1" : index === 1 ? "anim-delay-2" : "anim-delay-3"}`}
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.4)]">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="font-heading text-xl font-bold text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.desc}</p>
          </article>
        ))}
      </section>

      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl md:p-12 anim-fade-up">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-600/20 blur-[80px] float-slow pulse-soft" />
        <div className="absolute top-0 right-0 h-full w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary-400">Bạn cần tư vấn?</p>
            <h2 className="mt-3 font-heading text-4xl font-black text-white md:text-5xl tracking-tight">
              Chúng tôi luôn sẵn sàng hỗ trợ
            </h2>
            <p className="mt-4 text-base text-slate-400 leading-relaxed font-light">
              Mở khung chat ngay góc màn hình để trò chuyện cùng chuyên viên. Chọn size, tìm kiếm sản phẩm phù hợp chưa bao giờ dễ dàng đến thế.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/chat" className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 font-bold text-slate-900 transition-all hover:bg-slate-200 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Bắt đầu Chat
            </Link>
            <Link to="/products" className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white/10 hover:border-white/30 backdrop-blur-sm">
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
