// Base URL backend — sesuaikan dengan environment variable Vite
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Helper: ambil token dari Zustand persist store (key: "auth-storage")
function getToken(): string | null {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
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

// Fungsi fetch utama untuk JSON request
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

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body?.message ?? "Terjadi kesalahan.");
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// Fungsi fetch khusus untuk FormData (upload file)
// Tidak perlu set Content-Type — browser yang atur boundary-nya
async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    body: formData,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
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
  postForm: <T>(path: string, formData: FormData) => requestForm<T>(path, formData),
};

