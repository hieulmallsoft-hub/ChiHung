export default function EmptyState({ title = "Khong co du lieu", description = "" }) {
  return (
    <div className="section-shell p-8 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-rose-100 text-xl text-primary-700">
        !
      </div>
      <h3 className="font-heading text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
