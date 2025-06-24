import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    // ✅ HEADER CRÍTICO para bypass en desarrollo
    "X-Bypass-Auth": "true",
  },
  timeout: 10000,
});

// Request interceptor - SIMPLIFICADO
api.interceptors.request.use(
  (config) => {
    // ✅ SIEMPRE agregar bypass en desarrollo
    config.headers["X-Bypass-Auth"] = "true";

    // Agregar token solo en producción
    const token = localStorage.getItem("token");
    if (token && import.meta.env.PROD) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Request headers:", config.headers); // Debug
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - SIMPLIFICADO
api.interceptors.response.use(
  (response) => {
    console.log("Response success:", response.status); // Debug
    return response;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;

    console.error("API Error:", { status, message, url: error.config?.url }); // Debug

    // Solo mostrar toast para errores críticos
    if (status && status >= 500) {
      toast.error(`Error del servidor: ${message}`);
    } else if (status === 401 && import.meta.env.PROD) {
      toast.error("Sesión expirada");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
