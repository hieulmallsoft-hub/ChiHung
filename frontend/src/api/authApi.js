import axiosClient from "./axiosClient";

export const authApi = {
  login(payload) {
    return axiosClient.post("/api/auth/login", payload);
  },
  register(payload) {
    return axiosClient.post("/api/auth/register", payload);
  },
  refresh(refreshToken) {
    return axiosClient.post("/api/auth/refresh", { refreshToken });
  },
  logout(refreshToken) {
    return axiosClient.post("/api/auth/logout", { refreshToken });
  },
  forgotPassword(payload) {
    return axiosClient.post("/api/auth/forgot-password", payload);
  },
  resetPassword(payload) {
    return axiosClient.post("/api/auth/reset-password", payload);
  },
};
