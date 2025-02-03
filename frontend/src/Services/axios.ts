import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request Interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status == 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post("/api/refresh");
        localStorage.setItem("accessToken", data.token);
        return api(originalRequest);
      } catch (refreshError) {
        window.dispatchEvent(new Event("logout"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
