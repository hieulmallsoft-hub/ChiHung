import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";

const roleLabels = {
  ROLE_ADMIN: "Quản trị viên",
  ROLE_USER: "Người dùng",
};

const userStatusLabels = {
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khóa",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");

  const loadUsers = async () => {
    const response = await adminApi.getUsers({ keyword, page: 0, size: 20 });
    setUsers(response.data.data.content || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (admin = false) => {
    const fullName = window.prompt("Họ tên");
    const email = window.prompt("Email");
    const password = window.prompt("Mật khẩu");
    if (!fullName || !email || !password) return;

    await adminApi.createUser({ fullName, email, password }, admin);
    toast.success(admin ? "Đã tạo quản trị viên" : "Đã tạo người dùng");
    loadUsers();
  };

  const lockUser = async (id) => {
    await adminApi.lockUser(id);
    toast.success("Đã khóa người dùng");
    loadUsers();
  };

  return (
    <div className="space-y-4">
      <div className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Người dùng</p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-white">Quản lý người dùng</h1>
            <p className="mt-1 text-sm text-slate-300">Quản lý tài khoản và phân quyền hệ thống.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => createUser(false)}>
              Thêm người dùng
            </button>
            <button className="btn-primary" onClick={() => createUser(true)}>
              Thêm quản trị viên
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="admin-input"
            placeholder="Tìm người dùng theo tên hoặc email"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={loadUsers}>
            Tìm
          </button>
        </div>
      </div>

      <div className="admin-card p-0">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="py-3 pl-4">Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th className="pr-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 pl-4 text-white">{user.fullName}</td>
                  <td className="text-slate-300">{user.email}</td>
                  <td className="text-slate-300">{(user.roles || []).map((role) => roleLabels[role] || role).join(", ")}</td>
                  <td>
                    <span className="admin-pill">{userStatusLabels[user.status] || user.status}</span>
                  </td>
                  <td className="pr-4 text-right">
                    <button className="text-xs font-semibold text-cyan-300 hover:text-cyan-200" onClick={() => lockUser(user.id)}>
                      Khóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
