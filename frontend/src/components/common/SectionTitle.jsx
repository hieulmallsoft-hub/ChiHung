export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-5">
      <div className="mb-3 h-1.5 w-20 rounded-full bg-gradient-to-r from-primary-600 to-rose-300" />
      <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">{subtitle}</p>}
    </div>
  );
}
