import axiosClient from "./axiosClient";

export const orderApi = {
  checkout(payload) {
    return axiosClient.post("/api/orders/checkout", payload);
  },
  getMyOrders(params) {
    return axiosClient.get("/api/orders/me", { params });
  },
  getMyOrderDetail(id) {
    return axiosClient.get(`/api/orders/me/${id}`);
  },
  cancelOrder(id) {
    return axiosClient.post(`/api/orders/me/${id}/cancel`);
  },
  getSpendingStats() {
    return axiosClient.get("/api/orders/me/stats");
  },
};
