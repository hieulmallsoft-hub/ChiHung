export function getAdminErrorMessage(error, fallback = "Khong tai duoc du lieu quan tri") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ECONNABORTED") return "Ket noi den may chu qua lau. Vui long thu lai.";
  if (error?.message === "Network Error") return "Khong ket noi duoc backend. Hay kiem tra may chu API.";
  return fallback;
}

export function AdminLoading({ message = "Dang tai du lieu..." }) {
  return (
    <div className="admin-subtle flex min-h-[160px] items-center justify-center">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-200">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
        {message}
      </div>
    </div>
  );
}

export function AdminError({ message, onRetry }) {
  return (
    <div className="admin-subtle border-rose-300/30 bg-rose-950/30">
      <p className="font-heading text-lg font-semibold text-white">Khong tai duoc du lieu</p>
      <p className="mt-2 text-sm text-rose-100">{message}</p>
      {onRetry && (
        <button type="button" className="btn-secondary mt-4 border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={onRetry}>
          Thu lai
        </button>
      )}
    </div>
  );
}
