import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { userApi } from "../../api/userApi";

const initialAddressForm = {
  receiverName: "",
  receiverPhone: "",
  line1: "",
  city: "",
  country: "Vietnam",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [savingAddress, setSavingAddress] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  const loadData = async () => {
    try {
      const [profileRes, addressRes] = await Promise.all([userApi.getProfile(), userApi.getAddresses()]);
      setProfile(profileRes.data.data);
      setAddresses(addressRes.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong tai duoc thong tin tai khoan");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveProfile = async () => {
    try {
      await userApi.updateProfile(profile);
      toast.success("Cap nhat ho so thanh cong");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cap nhat ho so that bai");
    }
  };

  const sanitizePhone = (value) => value.replace(/\D+/g, "");

  const addAddress = async (event) => {
    event.preventDefault();
    try {
      setSavingAddress(true);
      await userApi.addAddress({
        ...addressForm,
        receiverPhone: sanitizePhone(addressForm.receiverPhone),
        defaultAddress: addresses.length === 0,
      });
      setAddressForm(initialAddressForm);
      toast.success("Da them dia chi");
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong the them dia chi");
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (id) => {
    try {
      await userApi.deleteAddress(id);
      toast.success("Da xoa dia chi");
      loadData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong the xoa dia chi");
    }
  };

  const changePassword = async () => {
    try {
      await userApi.changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast.success("Da doi mat khau");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong the doi mat khau");
    }
  };

  if (!profile) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="card space-y-3 p-5">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Ho so ca nhan</h1>
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-slate-600">
          Cap nhat thong tin de nhan ho tro va giao hang nhanh hon.
        </div>
        <input value={profile.fullName || ""} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} />
        <input value={profile.email || ""} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
        <input value={profile.phone || ""} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
        <input value={profile.avatarUrl || ""} placeholder="Avatar URL" onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))} />
        <button className="btn-primary" onClick={saveProfile}>Luu thay doi</button>
      </section>

      <section className="space-y-5">
        <div className="card space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-slate-900">Dia chi cua toi</h2>
          </div>
          <form onSubmit={addAddress} className="grid gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 md:grid-cols-2">
            <input
              required
              placeholder="Ten nguoi nhan"
              value={addressForm.receiverName}
              onChange={(e) => setAddressForm((p) => ({ ...p, receiverName: e.target.value }))}
            />
            <input
              required
              placeholder="So dien thoai"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={addressForm.receiverPhone}
              onChange={(e) => setAddressForm((p) => ({ ...p, receiverPhone: sanitizePhone(e.target.value) }))}
            />
            <input
              required
              placeholder="Dia chi cu the"
              className="md:col-span-2"
              value={addressForm.line1}
              onChange={(e) => setAddressForm((p) => ({ ...p, line1: e.target.value }))}
            />
            <input
              required
              placeholder="Thanh pho"
              value={addressForm.city}
              onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
            />
            <input
              placeholder="Quoc gia"
              value={addressForm.country}
              onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))}
            />
            <button type="submit" className="btn-secondary md:col-span-2" disabled={savingAddress}>
              {savingAddress ? "Dang luu..." : "Them dia chi"}
            </button>
          </form>
          <div className="space-y-2">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-xl border border-rose-100 bg-white p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{address.receiverName} - {address.receiverPhone}</p>
                    <p className="text-slate-500">{address.line1}, {address.city}</p>
                    {address.defaultAddress && <span className="badge mt-2">Mac dinh</span>}
                  </div>
                  <button className="text-xs font-semibold text-primary-700 hover:text-primary-600" onClick={() => deleteAddress(address.id)}>
                    Xoa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-3 p-5">
          <h2 className="font-heading text-xl font-bold text-slate-900">Doi mat khau</h2>
          <input type="password" placeholder="Mat khau hien tai" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
          <input type="password" placeholder="Mat khau moi" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
          <button className="btn-primary" onClick={changePassword}>Cap nhat mat khau</button>
        </div>
      </section>
    </div>
  );
}
