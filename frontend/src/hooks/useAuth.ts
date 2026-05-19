import { useEffect, useState } from "react";
import type { User } from "../../../shared/src/types/user";

// Tipe state auth
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// Simpan/ambil user dari localStorage
function loadAuth(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    const user: User | null = raw ? JSON.parse(raw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => ({
    ...loadAuth(),
    isLoading: false,
  }));

  // Sync state kalau ada perubahan di localStorage (misal logout di tab lain)
  useEffect(() => {
    const handleStorage = () => {
      setAuth((prev) => ({ ...prev, ...loadAuth() }));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Simpan login ke localStorage dan update state
  const login = (user: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ user, token, isLoading: false });
  };

  // Hapus semua data auth
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ user: null, token: null, isLoading: false });
  };

  return {
    user: auth.user,
    token: auth.token,
    isLoading: auth.isLoading,
    isAuthenticated: !!auth.token && !!auth.user,
    login,
    logout,
  };
}
