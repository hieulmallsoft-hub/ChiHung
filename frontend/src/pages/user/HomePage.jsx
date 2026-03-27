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
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-primary-300/40 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-6 text-white shadow-glow md:p-10">
        <div className="pointer-events-none absolute -left-16 top-24 h-52 w-52 rounded-full bg-white/20 blur-3xl float-slow pulse-soft" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-200/20 blur-3xl float-slower" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex w-fit items-center rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-100 anim-fade-up anim-delay-1">
              Sport Ecommerce + Realtime Chat
            </span>

            <h1 className="font-heading text-4xl font-extrabold leading-[1.02] md:text-6xl anim-fade-up anim-delay-2">
              Ban do the thao dep,
              <br />
              chat voi admin trong 1 click
            </h1>

            <p className="max-w-2xl text-base text-rose-100 md:text-lg anim-fade-up anim-delay-3">
              Tu vot pickleball, giay chay bo, quan ao gym den phu kien thi dau. Ton kho cap nhat lien tuc, dat hang va
              nhan tu van truc tiep ngay tren web.
            </p>

            <div className="flex flex-wrap gap-3 anim-fade-up anim-delay-4">
              <Link
                to="/products"
                className="inline-flex items-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary-700 transition hover:-translate-y-0.5"
              >
                Kham pha san pham
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center rounded-xl border border-white/60 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Chat ho tro ngay
              </Link>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/25 bg-white/10 p-5 backdrop-blur md:p-6 anim-fade-up anim-delay-3">
            <p className="text-sm font-semibold text-rose-100 anim-fade-in anim-delay-3">Danh muc duoc quan tam nhieu</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {highlights.map((item, index) => (
                <span
                  key={item}
                  className={`rounded-full px-3 py-1 text-xs font-bold anim-fade-up ${
                    index === 0 ? "bg-white text-primary-700" : "bg-white/20 text-white"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/20 px-2 py-3 backdrop-blur anim-fade-up anim-delay-1">
                <p className="text-2xl font-bold">30+</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-100">San pham</p>
              </div>
              <div className="rounded-xl bg-white/20 px-2 py-3 backdrop-blur anim-fade-up anim-delay-2">
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-100">Chat support</p>
              </div>
              <div className="rounded-xl bg-white/20 px-2 py-3 backdrop-blur anim-fade-up anim-delay-3">
                <p className="text-2xl font-bold">99%</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-100">Don dung han</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-4 anim-fade-up anim-delay-4">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-100">Realtime support</p>
              <p className="mt-1 text-sm font-semibold text-white">Nhan vien online, phan hoi trong luc ban dang mua hang.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle title="San pham ban chay" subtitle="Top san pham duoc dat mua nhieu nhat trong tuan" />
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "UI nhanh, hien dai",
            desc: "Loc, tim, sap xep san pham theo mon, thuong hieu va muc gia trong vai giay.",
          },
          {
            title: "Dat hang chinh xac ton kho",
            desc: "Kiem tra ton kho truoc checkout, cap nhat trang thai don hang ro rang.",
          },
          {
            title: "Chat realtime 2 chieu",
            desc: "User nhan thong bao truc tiep, admin tiep nhan va phan hoi ngay lap tuc.",
          },
        ].map((item, index) => (
          <article
            key={item.title}
            className={`section-shell anim-fade-up ${index === 0 ? "anim-delay-1" : index === 1 ? "anim-delay-2" : "anim-delay-3"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Feature</p>
            <h3 className="mt-2 font-heading text-2xl font-bold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
          </article>
        ))}
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-rose-200/80 bg-white p-6 shadow-soft md:p-9 anim-fade-up">
        <div className="absolute -right-20 top-0 h-52 w-52 rounded-full bg-primary-100/70 blur-3xl float-slow pulse-soft" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Ready to checkout</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold text-slate-900 md:text-4xl">
              Can tu van size, chat ngay voi admin
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Khong can roi khoi trang. Mo bong bong chat de nhan tu van san pham, so luong ton kho, ho tro checkout.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/chat" className="btn-primary px-5 py-2.5">
              Mo chat support
            </Link>
            <Link to="/products" className="btn-secondary px-5 py-2.5">
              Xem catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
