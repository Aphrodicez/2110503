import { apiFetch, ApiResponse } from "@/lib/api";
import { AuthCredentials, RegisterInput, User } from "@/types";

interface TokenResponse {
  success: boolean;
  token: string;
}

export const loginRequest = (payload: AuthCredentials) =>
  apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    json: payload,
    skipAuth: true,
  });

export const registerRequest = (payload: RegisterInput) =>
  apiFetch<TokenResponse>("/auth/register", {
    method: "POST",
    json: payload,
    skipAuth: true,
  });

export const getCurrentUser = async () => {
  const response = await apiFetch<ApiResponse<User>>("/auth/me");
  return response.data;
};
