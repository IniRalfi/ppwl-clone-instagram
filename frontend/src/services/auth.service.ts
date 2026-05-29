import { apiClient } from "./api.client";
import { User } from "../store/auth.store";

export interface AuthResponse {
  user: User;
  // ❌ REMOVED: accessToken - sekarang di HttpOnly cookie
}

/** Login menggunakan email & password */
export async function loginUser(
  email: string,
  password: string
): Promise<{ data: AuthResponse; message?: string }> {
  return await apiClient.post<{ data: AuthResponse; message?: string }>("/auth/login", {
    email,
    password,
  });
}

/** Registrasi pengguna baru */
export async function registerUser(payload: {
  email: string;
  password: string;
  name: string;
  username: string;
}): Promise<{ message?: string }> {
  return await apiClient.post<{ message?: string }>("/auth/register", payload);
}

/** Login/Register menggunakan Google OAuth */
export async function loginWithGoogle(
  token: string
): Promise<{ data: AuthResponse; message?: string }> {
  return await apiClient.post<{ data: AuthResponse; message?: string }>("/auth/google", { token });
}

/** Logout - Clear cookie di backend */
export async function logoutUser(): Promise<{ message?: string }> {
  return await apiClient.post<{ message?: string }>("/auth/logout", {});
}
