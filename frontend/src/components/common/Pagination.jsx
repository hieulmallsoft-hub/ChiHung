export default function Pagination({ pageInfo, onPageChange }) {
  if (!pageInfo || pageInfo.totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        className="btn-secondary"
        disabled={pageInfo.number === 0}
        onClick={() => onPageChange(pageInfo.number - 1)}
      >
        Truoc
      </button>
      <span className="rounded-full border border-rose-100 bg-white px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm">
        Trang {pageInfo.number + 1} / {pageInfo.totalPages}
      </span>
      <button
        className="btn-secondary"
        disabled={pageInfo.number + 1 >= pageInfo.totalPages}
        onClick={() => onPageChange(pageInfo.number + 1)}
      >
        Sau
      </button>
    </div>
  );
}
