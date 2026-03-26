import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";

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
    const fullName = window.prompt("Ho ten");
    const email = window.prompt("Email");
    const password = window.prompt("Mat khau");
    if (!fullName || !email || !password) return;

    await adminApi.createUser({ fullName, email, password }, admin);
    toast.success(admin ? "Da tao admin" : "Da tao user");
    loadUsers();
  };

  const lockUser = async (id) => {
    await adminApi.lockUser(id);
    toast.success("Da khoa user");
    loadUsers();
  };

  return (
    <div className="space-y-4">
      <div className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">Users</p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-white">User Management</h1>
            <p className="mt-1 text-sm text-slate-300">Quan ly tai khoan va phan quyen he thong.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => createUser(false)}>
              Them user
            </button>
            <button className="btn-primary" onClick={() => createUser(true)}>
              Them admin
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="admin-input"
            placeholder="Tim user theo ten hoac email"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={loadUsers}>
            Tim
          </button>
        </div>
      </div>

      <div className="admin-card p-0">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="py-3 pl-4">Ho ten</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 pl-4 text-white">{user.fullName}</td>
                  <td className="text-slate-300">{user.email}</td>
                  <td className="text-slate-300">{(user.roles || []).join(", ")}</td>
                  <td>
                    <span className="admin-pill">{user.status}</span>
                  </td>
                  <td className="pr-4 text-right">
                    <button className="text-xs font-semibold text-rose-300 hover:text-rose-200" onClick={() => lockUser(user.id)}>
                      Khoa
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
