import { useAuthStore } from "../store/auth.store";

// Base URL backend — sesuaikan dengan environment variable Vite
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// ❌ REMOVED: getToken() function - tidak perlu lagi karena token di cookie

// Tipe generik response dari API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Kelas error kustom agar bisa baca status code
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Fungsi fetch utama untuk JSON request
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // ❌ REMOVED: const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // ❌ REMOVED: Authorization header - token sudah di cookie
    ...((options.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // ✅ ADDED: Kirim cookies ke backend
  });

  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().logout();
    }
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body?.message ?? "Terjadi kesalahan.");
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// Fungsi fetch khusus untuk FormData (upload file)
// Tidak perlu set Content-Type — browser yang atur boundary-nya
async function requestForm<T>(
  path: string,
  formData: FormData,
  method: string = "POST"
): Promise<T> {
  // ❌ REMOVED: const token = getToken();

  const headers: HeadersInit = {
    // ❌ REMOVED: Authorization header - token sudah di cookie
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    body: formData,
    headers,
    credentials: "include", // ✅ ADDED: Kirim cookies ke backend
  });

  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().logout();
    }
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body?.message ?? "Terjadi kesalahan.");
  }

  return res.json() as Promise<T>;
}

// Shorthand untuk method HTTP yang sering dipakai
export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
  // Untuk upload file (multipart/form-data)
  postForm: <T>(path: string, formData: FormData) => requestForm<T>(path, formData, "POST"),
  putForm: <T>(path: string, formData: FormData) => requestForm<T>(path, formData, "PUT"),
};
