import axiosClient from "./axiosClient";

export const adminApi = {
  getDashboard() {
    return axiosClient.get("/api/admin/dashboard");
  },
  getUsers(params) {
    return axiosClient.get("/api/admin/users", { params });
  },
  createUser(payload, admin = false) {
    return axiosClient.post(`/api/admin/users?admin=${admin}`, payload);
  },
  updateUser(id, payload) {
    return axiosClient.put(`/api/admin/users/${id}`, payload);
  },
  lockUser(id) {
    return axiosClient.post(`/api/admin/users/${id}/lock`);
  },
  resetPassword(id, newPassword) {
    return axiosClient.post(`/api/admin/users/${id}/reset-password`, { newPassword });
  },
  getCategories() {
    return axiosClient.get("/api/admin/categories");
  },
  saveCategory(payload, id) {
    return id
      ? axiosClient.put(`/api/admin/categories/${id}`, payload)
      : axiosClient.post("/api/admin/categories", payload);
  },
  deleteCategory(id) {
    return axiosClient.delete(`/api/admin/categories/${id}`);
  },
  getBrands() {
    return axiosClient.get("/api/admin/brands");
  },
  saveBrand(payload, id) {
    return id
      ? axiosClient.put(`/api/admin/brands/${id}`, payload)
      : axiosClient.post("/api/admin/brands", payload);
  },
  deleteBrand(id) {
    return axiosClient.delete(`/api/admin/brands/${id}`);
  },
  getProducts(params) {
    return axiosClient.get("/api/admin/products", { params });
  },
  saveProduct(payload, id) {
    return id
      ? axiosClient.put(`/api/admin/products/${id}`, payload)
      : axiosClient.post("/api/admin/products", payload);
  },
  deleteProduct(id) {
    return axiosClient.delete(`/api/admin/products/${id}`);
  },
  adjustStock(productId, payload) {
    return axiosClient.put(`/api/admin/inventory/products/${productId}`, payload);
  },
  getInventoryLogs(productId) {
    return axiosClient.get(`/api/admin/inventory/products/${productId}/logs`);
  },
  getOrders(params) {
    return axiosClient.get("/api/admin/orders", { params });
  },
  updateOrderStatus(id, status) {
    return axiosClient.put(`/api/admin/orders/${id}/status`, { status });
  },
  updateOrderPayment(id, payload) {
    return axiosClient.put(`/api/admin/orders/${id}/payment`, payload);
  },
  getReport() {
    return axiosClient.get("/api/admin/reports/revenue");
  },
  getChatRooms(params) {
    return axiosClient.get("/api/admin/chats/rooms", { params });
  },
  resolveRoom(roomId) {
    return axiosClient.put(`/api/admin/chats/rooms/${roomId}/resolve`);
  },
  editChatMessage(messageId, payload) {
    return axiosClient.put(`/api/admin/chats/messages/${messageId}`, payload);
  },
  deleteChatMessage(messageId) {
    return axiosClient.delete(`/api/admin/chats/messages/${messageId}`);
  },
};
