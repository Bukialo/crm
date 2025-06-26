import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // Aumentado el timeout
});

// Request interceptor - MEJORADO
api.interceptors.request.use(
  (config) => {
    // ✅ Solo agregar bypass en desarrollo
    if (import.meta.env.DEV) {
      config.headers["X-Bypass-Auth"] = "true";
    }

    // Agregar token en producción o si existe
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ FIX: Limpiar headers undefined
    Object.keys(config.headers).forEach((key) => {
      if (config.headers[key] === undefined || config.headers[key] === null) {
        delete config.headers[key];
      }
    });

    console.log("🚀 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data ? "✓" : "✗",
    });

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - MEJORADO
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data?.success ? "✓" : "✗",
    });
    return response;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;
    const url = error.config?.url;

    console.error("❌ API Error:", {
      status,
      message,
      url,
      method: error.config?.method?.toUpperCase(),
    });

    // Manejar errores específicos
    switch (status) {
      case 400:
        console.warn("⚠️ Bad Request:", message);
        break;
      case 401:
        if (import.meta.env.PROD) {
          toast.error("Sesión expirada");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        break;
      case 403:
        toast.error("No tienes permisos para esta acción");
        break;
      case 404:
        console.warn("⚠️ Resource not found:", url);
        break;
      case 500:
        toast.error("Error del servidor. Intenta de nuevo.");
        break;
      default:
        if (status && status >= 400) {
          toast.error(`Error ${status}: ${message}`);
        }
    }

    return Promise.reject(error);
  }
);

export default api;
