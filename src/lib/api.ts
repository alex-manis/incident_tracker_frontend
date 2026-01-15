import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { LoginRequest, LoginResponse } from '@incident-tracker/shared';

const rawBase = import.meta.env.VITE_API_URL || "";
// Remove trailing slash, then ensure /api is added if not already present
const normalizedBase = rawBase.replace(/\/$/, "");
const baseURL = normalizedBase
  ? (normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`)
  : "/api";

// Auth endpoints that don't require Authorization header
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh'] as const;
const ACCESS_TOKEN_KEY = 'accessToken';
const LOGIN_PATH = '/login';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Refresh token lock to prevent race conditions
let isRefreshing = false;
type QueuedRequest = {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
};
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    } else {
      // This should not happen in normal flow, but handle it gracefully
      const axiosError = new Error('Token is null') as AxiosError;
      prom.reject(axiosError);
    }
  });

  failedQueue = [];
};

// Request interceptor to add access token
api.interceptors.request.use((config) => {
  // Don't add Authorization header for login and refresh endpoints
  // (login uses email/password, refresh uses cookies)
  const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => config.url?.includes(endpoint));
  if (isAuthEndpoint) {
    return config;
  }

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 errors and avoid infinite loops
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err: AxiosError) => {
            return Promise.reject(err);
          });
      }

      // Mark that we're refreshing
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await api.post<{ accessToken: string }>(
          "/auth/refresh",
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

        // Process queued requests
        processQueue(null, accessToken);

        // Update original request and retry
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear everything and redirect
        localStorage.removeItem(ACCESS_TOKEN_KEY);

        // Process queued requests with error
        processQueue(refreshError as AxiosError, null);

        // Only redirect if we're not already on login page
        // Note: Using window.location is necessary here as we're in an interceptor
        // outside React Router context
        if (window.location.pathname !== LOGIN_PATH) {
          window.location.href = LOGIN_PATH;
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse & { accessToken: string }> => {
    const response = await api.post<LoginResponse & { accessToken: string }>('/auth/login', credentials);
    const { accessToken } = response.data;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default api;
