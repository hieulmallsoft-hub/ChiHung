export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/60 to-black/60 p-6 shadow-lg md:grid-cols-3 md:p-10 backdrop-blur-md">
          <div>
            <p className="font-heading text-2xl font-black text-white tracking-tight">SportShop</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Nền tảng bán đồ thể thao cao cấp, mang lại trải nghiệm mua sắm tuyệt đỉnh cho các tín đồ đam mê chinh phục.
            </p>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.25em] text-primary-400">Build for graduation 2026</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Danh mục nổi bật</p>
            <div className="mt-4 flex flex-wrap gap-2.5 text-xs">
              {["Pickleball", "Cầu lông", "Bóng đá", "Gym", "Chạy bộ", "Bóng rổ"].map((item) => (
                <span key={item} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition-colors hover:bg-white/15 hover:text-white">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Liên hệ</p>
            <div className="mt-4 space-y-2 text-sm text-slate-400 font-light">
              <p className="hover:text-white transition-colors cursor-pointer">Email: support@sportshop.vn</p>
              <p className="hover:text-white transition-colors cursor-pointer">Hotline: 1900 8686</p>
              <p className="hover:text-white transition-colors cursor-pointer">Address: District 1, Ho Chi Minh City</p>
            </div>
            <p className="mt-6 text-[11px] text-slate-500 font-medium">© {new Date().getFullYear()} SportShop. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
