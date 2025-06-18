import { useAuthStore } from "../store/auth.store";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import api from "../lib/axios";
import toast from "react-hot-toast";

export const useAuth = () => {
  const { user, isLoading, setUser, logout } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Get user data from backend
      const { data } = await api.get("/auth/me");

      setUser({
        id: data.data.id,
        email: data.data.email,
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        role: data.data.role,
        firebaseUid: firebaseUser.uid,
      });

      toast.success("¡Bienvenido de vuelta!");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/user-not-found") {
        toast.error("Usuario no encontrado");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Contraseña incorrecta");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Email inválido");
      } else {
        toast.error("Error al iniciar sesión");
      }
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      // Create Firebase user
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`,
      });

      // Create user in backend
      const { data } = await api.post("/auth/register", {
        email,
        firstName,
        lastName,
        firebaseUid: firebaseUser.uid,
      });

      setUser({
        id: data.data.id,
        email: data.data.email,
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        role: data.data.role,
        firebaseUid: firebaseUser.uid,
      });

      toast.success("¡Cuenta creada exitosamente!");
      return true;
    } catch (error: any) {
      console.error("Register error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Este email ya está registrado");
      } else if (error.code === "auth/weak-password") {
        toast.error("La contraseña debe tener al menos 6 caracteres");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Email inválido");
      } else {
        toast.error("Error al crear la cuenta");
      }
      return false;
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
      logout();
      toast.success("Sesión cerrada");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Email de recuperación enviado");
      return true;
    } catch (error: any) {
      console.error("Reset password error:", error);
      if (error.code === "auth/user-not-found") {
        toast.error("Usuario no encontrado");
      } else {
        toast.error("Error al enviar email de recuperación");
      }
      return false;
    }
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout: logoutUser,
    resetPassword,
  };
};
