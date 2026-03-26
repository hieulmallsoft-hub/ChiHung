export default function LoadingSpinner({ text = "Dang tai..." }) {
  return (
    <div className="section-shell flex min-h-[220px] items-center justify-center">
      <div className="flex items-center gap-3 text-slate-600">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <span className="font-medium">{text}</span>
      </div>
    </div>
  );
}
