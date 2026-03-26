import axiosClient from "./axiosClient";

export const userApi = {
  getProfile() {
    return axiosClient.get("/api/users/me");
  },
  updateProfile(payload) {
    return axiosClient.put("/api/users/me", payload);
  },
  changePassword(payload) {
    return axiosClient.post("/api/users/change-password", payload);
  },
  getAddresses() {
    return axiosClient.get("/api/users/me/addresses");
  },
  addAddress(payload) {
    return axiosClient.post("/api/users/me/addresses", payload);
  },
  updateAddress(id, payload) {
    return axiosClient.put(`/api/users/me/addresses/${id}`, payload);
  },
  deleteAddress(id) {
    return axiosClient.delete(`/api/users/me/addresses/${id}`);
  },
};
