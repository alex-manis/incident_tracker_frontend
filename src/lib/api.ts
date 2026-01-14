import axios, { AxiosError } from 'axios';
import { LoginRequest, LoginResponse } from '@incident-tracker/shared';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Request interceptor to add access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await api.post(
          "/auth/refresh",
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data as { accessToken: string };

        localStorage.setItem("accessToken", accessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse & { accessToken: string }> => {
    const response = await api.post('/auth/login', credentials);
    const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default api;
