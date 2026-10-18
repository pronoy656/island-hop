import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { env } from "@/env";

import { cookie } from "@/lib/cookie-client";
import { mockApi } from "@/lib/mock-api";

// Toggle mock mode; set to false for real live backend operation
export const USE_MOCK_API = false;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = cookie.get("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string; errorMessages?: Array<{ message: string; path?: string }> }>) => {
    // Ignore intentionally canceled/aborted requests (React 19 lifecycle cleanup & React Query signal)
    if (axios.isCancel(err)) {
      return Promise.reject(err);
    }

    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const method = err.config?.method?.toUpperCase() || "REQUEST";
      const url = err.config?.url || "";
      const firstDetail = err.response?.data?.errorMessages?.[0]?.message;
      const mainMessage = err.response?.data?.message;
      const serverMessage =
        (firstDetail && (mainMessage === "Validation Error" || !mainMessage))
          ? firstDetail
          : mainMessage || firstDetail || err.message || "An unexpected network error occurred";

      // Detailed console error logging ONLY for genuine server/network errors
      console.error(
        `🚨 [API Error ${status || "Network"}]: ${method} ${url}\n` +
        `• Server Message: ${serverMessage}\n` +
        `• Details:`,
        err.response?.data ?? err.message
      );

      // Handle 401 Unauthorized (Expired or Missing Token)
      if (status === 401 && typeof window !== "undefined") {
        cookie.remove("accessToken");
        const pathname = window.location.pathname;
        if (
          !pathname.startsWith("/login") &&
          !pathname.startsWith("/signup") &&
          !pathname.startsWith("/verify-email")
        ) {
          window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
        }
      }

      return Promise.reject(new Error(serverMessage));
    }
    return Promise.reject(err);
  }
);

type Cfg = AxiosRequestConfig & { signal?: AbortSignal };

export const get = async <T>(url: string, config?: Cfg): Promise<T> => {
  if (USE_MOCK_API) {
    if (url === "/user/profile" || url.includes("/user/profile")) {
      return (await mockApi.getProfile()) as unknown as T;
    }
  }
  try {
    return (await api.get<T>(url, config)).data;
  } catch (error) {
    if (USE_MOCK_API) {
      if (url.includes("/user/profile")) {
        return (await mockApi.getProfile()) as unknown as T;
      }
    }
    throw error;
  }
};

export const post = async <T, B = unknown>(url: string, body?: B, config?: Cfg): Promise<T> => {
  if (USE_MOCK_API) {
    if (url === "/auth/login" || url.includes("/auth/login")) {
      return (await mockApi.login(body as unknown as Parameters<typeof mockApi.login>[0])) as unknown as T;
    }
    if (url === "/user" || url.includes("/user")) {
      return (await mockApi.signup(body as unknown as Parameters<typeof mockApi.signup>[0])) as unknown as T;
    }
  }
  try {
    return (await api.post<T>(url, body, config)).data;
  } catch (error) {
    if (USE_MOCK_API) {
      if (url.includes("/auth/login")) {
        return (await mockApi.login(body as unknown as Parameters<typeof mockApi.login>[0])) as unknown as T;
      }
      if (url.includes("/user")) {
        return (await mockApi.signup(body as unknown as Parameters<typeof mockApi.signup>[0])) as unknown as T;
      }
    }
    throw error;
  }
};

export const patch = async <T, B = unknown>(url: string, body?: B, config?: Cfg): Promise<T> =>
  (await api.patch<T>(url, body, config)).data;

export const put = async <T, B = unknown>(url: string, body?: B, config?: Cfg): Promise<T> =>
  (await api.put<T>(url, body, config)).data;

export const del = async <T>(url: string, config?: Cfg): Promise<T> =>
  (await api.delete<T>(url, config)).data;
