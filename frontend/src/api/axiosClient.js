import axios from "axios";
import { tokenStorage } from "../utils/storage";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
export const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || API_BASE_URL).replace(/\/$/, "");

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

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
      error?.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/api/auth/refresh")
    ) {
      originalRequest._retry = true;
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        tokenStorage.clearSession();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const payload = refreshResponse.data?.data;
        tokenStorage.setSession({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user || tokenStorage.getUser(),
        });

        originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        tokenStorage.clearSession();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
