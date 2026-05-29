import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  gender?: string;
  showThreads?: boolean;
  suggestions?: boolean;
};

type AuthStore = {
  user: User | null;
  // ❌ REMOVED: token (sekarang di HttpOnly cookie)
  isAuthenticated: boolean;

  setAuth: (user: User) => void; // ✅ CHANGED: tidak perlu token parameter lagi
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      // ❌ REMOVED: token: null
      isAuthenticated: false,

      setAuth: (user) =>
        set({
          user,
          // ❌ REMOVED: token
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          // ❌ REMOVED: token: null
          isAuthenticated: false,
        }),

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),
    }),
    {
      name: "auth-storage",
    }
  )
);
