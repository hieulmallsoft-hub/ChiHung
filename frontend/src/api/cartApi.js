import axiosClient from "./axiosClient";

export const cartApi = {
  getCart() {
    return axiosClient.get("/api/cart");
  },
  addItem(payload) {
    return axiosClient.post("/api/cart/items", payload);
  },
  updateItem(id, payload) {
    return axiosClient.put(`/api/cart/items/${id}`, payload);
  },
  removeItem(id) {
    return axiosClient.delete(`/api/cart/items/${id}`);
  },
  applyCoupon(code) {
    return axiosClient.post(`/api/cart/coupon/${code}`);
  },
  clearCoupon() {
    return axiosClient.delete("/api/cart/coupon");
  },
};
