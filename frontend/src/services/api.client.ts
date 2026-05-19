// Base URL backend — sesuaikan dengan environment variable Vite
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Helper: ambil token dari localStorage
function getToken(): string | null {
  return localStorage.getItem("token");
}

// Tipe generik response dari API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Kelas error kustom agar bisa baca status code
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Fungsi fetch utama yang sudah include auth header dan error handling
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // Kalau response bukan ok (4xx/5xx), lempar error
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body?.message ?? "Terjadi kesalahan.");
  }

  // Kalau response 204 No Content, kembalikan undefined
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// Shorthand untuk method HTTP yang sering dipakai
export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
