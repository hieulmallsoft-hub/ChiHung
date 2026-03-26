export default function Footer() {
  return (
    <footer className="mt-16 border-t border-rose-100/90 bg-white/75 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-6 rounded-[1.8rem] border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-6 shadow-soft md:grid-cols-3 md:p-8">
          <div>
            <p className="font-heading text-2xl font-extrabold text-primary-700">SportShop</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Nen tang ban do the thao tich hop chat realtime, phu hop demo do an va mo rong production.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Build for graduation 2026</p>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-700">Danh muc hot</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {["Pickleball", "Cau long", "Bong da", "Gym", "Chay bo", "Bong ro"].map((item) => (
                <span key={item} className="label-chip">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-700">Lien he</p>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>Email: support@sportshop.local</p>
              <p>Hotline: 1900 8686</p>
              <p>Address: District 1, Ho Chi Minh City</p>
            </div>
            <p className="mt-4 text-xs text-slate-500">© {new Date().getFullYear()} SportShop. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
