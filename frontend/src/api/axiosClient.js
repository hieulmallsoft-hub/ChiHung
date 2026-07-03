import axios from "axios";
import { tokenStorage } from "../utils/storage";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
export const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || API_BASE_URL).replace(/\/$/, "");

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

function redirectToLogin() {
  const loginPath = window.location.pathname.startsWith("/admin") ? "/admin-login" : "/login";
  if (window.location.pathname !== loginPath) {
    window.location.href = loginPath;
  }
}

axiosClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest &&
      error?.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/api/auth/refresh")
    ) {
      originalRequest._retry = true;
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        tokenStorage.clearSession();
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const payload = refreshResponse.data?.data;
        if (!payload?.accessToken) {
          throw new Error("Invalid refresh response");
        }

        tokenStorage.setSession({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user || tokenStorage.getUser(),
        });

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        tokenStorage.clearSession();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
