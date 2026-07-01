export default function ErrorState({ message = "Đã có lỗi xảy ra." }) {
  return (
    <div className="card border border-primary-200 bg-primary-50 p-4 text-primary-700">
      <p className="font-semibold">Lỗi hệ thống</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}
