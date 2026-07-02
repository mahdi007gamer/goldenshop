import { ApiError, ApiResponse } from "./error-handler";

const BASE_URL = "";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const json: ApiResponse<T> = await response.json();

    if (!response.ok || !json.success) {
      throw new ApiError(
        json.error?.message ?? "Request failed",
        json.error?.code ?? "UNKNOWN_ERROR",
        response.status,
        json.error?.details
      );
    }

    return json.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new ApiError("Network error. Please check your connection.", "NETWORK_ERROR", 0);
    }
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
