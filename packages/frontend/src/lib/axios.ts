import axios, { AxiosError } from "axios";
import { auth } from "./firebase";
import toast from "react-hot-toast";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expired or invalid
          if (auth.currentUser) {
            try {
              // Try to refresh the token
              await auth.currentUser.getIdToken(true);
              // Retry the original request
              return api.request(error.config!);
            } catch (refreshError) {
              // Refresh failed, logout user
              await auth.signOut();
              window.location.href = "/login";
              toast.error(
                "Sesión expirada. Por favor, inicia sesión nuevamente."
              );
            }
          }
          break;

        case 403:
          toast.error("No tienes permisos para realizar esta acción");
          break;

        case 404:
          // Don't show toast for 404s, handle in components
          break;

        case 422:
        case 400:
          // Validation errors
          if (data?.errors) {
            data.errors.forEach((err: any) => {
              toast.error(err.message || "Error de validación");
            });
          } else {
            toast.error(data?.error || "Error en la solicitud");
          }
          break;

        case 500:
          toast.error("Error del servidor. Por favor, intenta más tarde.");
          break;

        default:
          toast.error(data?.error || "Ha ocurrido un error");
      }
    } else if (error.request) {
      toast.error("No se pudo conectar con el servidor");
    } else {
      toast.error("Error al procesar la solicitud");
    }

    return Promise.reject(error);
  }
);

export default api;
