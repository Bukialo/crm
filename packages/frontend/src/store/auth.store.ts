// src/store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "ADMIN" | "AGENT" | "VIEWER";
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true });

        try {
          // Aquí iría la lógica real de autenticación con Firebase
          // Por ahora, simulamos la autenticación

          // Simulación de delay de red
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mock user data - reemplazar con Firebase Auth real
          const mockUser: User = {
            id: "1",
            email: email,
            name: "Usuario Demo",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
            role: "ADMIN",
            createdAt: new Date(),
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
          });

          // En una implementación real, aquí guardarías el token
          localStorage.setItem("auth_token", "mock_token_123");
        } catch (error) {
          console.error("Login error:", error);
          set({ isLoading: false });
          throw new Error("Credenciales inválidas");
        }
      },

      logout: () => {
        // Limpiar localStorage
        localStorage.removeItem("auth_token");

        // Reset state
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData },
          });
        }
      },

      checkAuth: () => {
        // Verificar si hay un token guardado
        const token = localStorage.getItem("auth_token");

        if (token) {
          // En una implementación real, verificarías el token con el servidor
          // Por ahora, mantenemos al usuario logueado si hay token
          const { user } = get();
          if (user) {
            set({ isAuthenticated: true });
          }
        } else {
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      // Solo persistir ciertos campos
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
