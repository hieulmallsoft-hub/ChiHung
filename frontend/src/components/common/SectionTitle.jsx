export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-8">
      <div className="mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-primary-500 to-cyan-400 shadow-[0_0_15px_rgba(14,165,233,0.4)]" />
      <h2 className="font-heading text-4xl font-black tracking-tight text-white md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base font-light">{subtitle}</p>}
    </div>
  );
}
