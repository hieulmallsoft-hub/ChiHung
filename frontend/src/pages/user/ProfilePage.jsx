import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { userApi } from "../../api/userApi";
import { useAuth } from "../../hooks/useAuth";

const initialAddressForm = {
  receiverName: "",
  receiverPhone: "",
  line1: "",
  city: "",
  country: "Vietnam",
  defaultAddress: false,
};

export default function ProfilePage() {
  const { updateCurrentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  const loadData = async () => {
    try {
      const [profileRes, addressRes] = await Promise.all([userApi.getProfile(), userApi.getAddresses()]);
      setProfile(profileRes.data.data);
      setAddresses(addressRes.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không tải được thông tin tài khoản");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const sanitizePhone = (value) => value.replace(/\D+/g, "");

  const saveProfile = async () => {
    try {
      const payload = {
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        avatarUrl: profile.avatarUrl || "",
      };
      const response = await userApi.updateProfile(payload);
      setProfile(response.data.data);
      updateCurrentUser(response.data.data);
      toast.success("Cập nhật hồ sơ thành công");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cập nhật hồ sơ thất bại");
    }
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm(initialAddressForm);
  };

  const startEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      receiverName: address.receiverName || "",
      receiverPhone: address.receiverPhone || "",
      line1: address.line1 || "",
      city: address.city || "",
      country: address.country || "Vietnam",
      defaultAddress: Boolean(address.defaultAddress),
    });
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    try {
      setSavingAddress(true);
      const payload = {
        ...addressForm,
        receiverPhone: sanitizePhone(addressForm.receiverPhone),
        defaultAddress: editingAddressId ? addressForm.defaultAddress : addresses.length === 0 || addressForm.defaultAddress,
      };

      if (editingAddressId) {
        await userApi.updateAddress(editingAddressId, payload);
        toast.success("Đã cập nhật địa chỉ");
      } else {
        await userApi.addAddress(payload);
        toast.success("Đã thêm địa chỉ");
      }

      resetAddressForm();
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể lưu địa chỉ");
    } finally {
      setSavingAddress(false);
    }
  };

  const setDefaultAddress = async (address) => {
    try {
      await userApi.updateAddress(address.id, { ...address, defaultAddress: true });
      toast.success("Đã đặt địa chỉ mặc định");
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể đặt địa chỉ mặc định");
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    try {
      await userApi.deleteAddress(id);
      toast.success("Đã xóa địa chỉ");
      if (editingAddressId === id) {
        resetAddressForm();
      }
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể xóa địa chỉ");
    }
  };

  const changePassword = async () => {
    try {
      await userApi.changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast.success("Đã đổi mật khẩu");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể đổi mật khẩu");
    }
  };

  if (!profile) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="card space-y-3 p-5">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-sm text-slate-600">
          Cập nhật thông tin để nhận hỗ trợ và giao hàng nhanh hơn.
        </div>
        <input value={profile.fullName || ""} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} />
        <input value={profile.email || ""} readOnly className="cursor-not-allowed bg-slate-100 text-slate-500" />
        <input value={profile.phone || ""} onChange={(e) => setProfile((p) => ({ ...p, phone: sanitizePhone(e.target.value) }))} />
        <input value={profile.avatarUrl || ""} placeholder="Avatar URL" onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))} />
        <button className="btn-primary" onClick={saveProfile}>Lưu thay đổi</button>
      </section>

      <section className="space-y-5">
        <div className="card space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-slate-900">Địa chỉ của tôi</h2>
            {editingAddressId && (
              <button type="button" className="text-xs font-semibold text-primary-700" onClick={resetAddressForm}>
                Hủy sửa
              </button>
            )}
          </div>
          <form onSubmit={saveAddress} className="grid gap-2 rounded-xl border border-cyan-100 bg-cyan-50 p-3 md:grid-cols-2">
            <input
              required
              placeholder="Tên người nhận"
              value={addressForm.receiverName}
              onChange={(e) => setAddressForm((p) => ({ ...p, receiverName: e.target.value }))}
            />
            <input
              required
              placeholder="Số điện thoại"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={addressForm.receiverPhone}
              onChange={(e) => setAddressForm((p) => ({ ...p, receiverPhone: sanitizePhone(e.target.value) }))}
            />
            <input
              required
              placeholder="Địa chỉ cụ thể"
              className="md:col-span-2"
              value={addressForm.line1}
              onChange={(e) => setAddressForm((p) => ({ ...p, line1: e.target.value }))}
            />
            <input
              required
              placeholder="Thành phố"
              value={addressForm.city}
              onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
            />
            <input
              placeholder="Quốc gia"
              value={addressForm.country}
              onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))}
            />
            <label className="md:col-span-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={addressForm.defaultAddress}
                onChange={(e) => setAddressForm((p) => ({ ...p, defaultAddress: e.target.checked }))}
              />
              Đặt làm địa chỉ mặc định
            </label>
            <button type="submit" className="btn-secondary md:col-span-2" disabled={savingAddress}>
              {savingAddress ? "Đang lưu..." : editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
            </button>
          </form>
          <div className="space-y-2">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-xl border border-cyan-100 bg-white p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{address.receiverName} - {address.receiverPhone}</p>
                    <p className="text-slate-500">{address.line1}, {address.city}</p>
                    {address.defaultAddress && <span className="badge mt-2">Mặc định</span>}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {!address.defaultAddress && (
                      <button className="text-xs font-semibold text-primary-700 hover:text-primary-600" onClick={() => setDefaultAddress(address)}>
                        Mặc định
                      </button>
                    )}
                    <button className="text-xs font-semibold text-primary-700 hover:text-primary-600" onClick={() => startEditAddress(address)}>
                      Sửa
                    </button>
                    <button className="text-xs font-semibold text-red-600 hover:text-red-500" onClick={() => deleteAddress(address.id)}>
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-3 p-5">
          <h2 className="font-heading text-xl font-bold text-slate-900">Đổi mật khẩu</h2>
          <input type="password" placeholder="Mật khẩu hiện tại" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
          <input type="password" placeholder="Mật khẩu mới" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
          <button className="btn-primary" onClick={changePassword}>Cập nhật mật khẩu</button>
        </div>
      </section>
    </div>
  );
}
