import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { AuthUser } from "@bukialo/shared";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: true,
        setUser: (user) => set({ user }),
        setLoading: (loading) => set({ isLoading: loading }),
        logout: () => {
          set({ user: null });
          localStorage.removeItem("token");
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({ user: state.user }), // Only persist user
      }
    )
  )
);
