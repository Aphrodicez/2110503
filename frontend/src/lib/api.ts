const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
export const AUTH_TOKEN_KEY = "campbook_token";

interface ApiFetchOptions extends RequestInit {
  json?: unknown;
  skipAuth?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  pagination?: unknown;
  token?: string;
  message?: string;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {}

export const apiFetch = async <T>(path: string, options: ApiFetchOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers || {});
  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!options.skipAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
    credentials: "include",
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const message = (payload as { message?: string })?.message || "Request failed";
    throw new Error(message);
  }

  return payload as T;
};

export { API_BASE_URL };
