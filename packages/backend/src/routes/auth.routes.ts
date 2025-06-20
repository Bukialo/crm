import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import {
  authenticate,
  optionalAuth,
  validateFirebaseToken,
} from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    firebaseUid: z.string().min(1, "Firebase UID is required"),
    role: z
      .enum(["ADMIN", "MANAGER", "AGENT", "VIEWER"])
      .optional()
      .default("AGENT"),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    timezone: z.string().optional(),
  }),
});

// RUTAS PÚBLICAS (sin autenticación estricta)

// Health check para autenticación
router.get("/", (req, res) => {
  res.json({
    service: "Bukialo Auth Service",
    status: "active",
    timestamp: new Date().toISOString(),
    endpoints: {
      public: [
        "GET /api/auth - this endpoint",
        "GET /api/auth/status - check auth status",
        "POST /api/auth/register - register new user",
        "GET /api/auth/verify-token - verify token (optional auth)",
      ],
      protected: [
        "GET /api/auth/me - get current user info",
        "PUT /api/auth/profile - update profile",
        "POST /api/auth/logout - logout user",
        "DELETE /api/auth/account - delete account",
      ],
    },
    message: "Authentication service is working",
  });
});

// Status check (público)
router.get("/status", (req, res) => {
  res.json({
    status: "operational",
    service: "authentication",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Register (público pero con validación)
router.post(
  "/register",
  validateBody(registerSchema.shape.body),
  authController.register
);

// Verify token (autenticación opcional - no falla si no hay token)
router.get("/verify-token", optionalAuth, (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
      },
      message: "Token is valid",
    });
  } else {
    res.json({
      success: true,
      authenticated: false,
      message: "No valid token provided",
    });
  }
});

// Check if user exists by Firebase UID (público)
router.get("/check-user/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    // Aquí verificarías si el usuario existe en tu base de datos
    // Por ahora devolvemos un response básico
    res.json({
      success: true,
      exists: false, // Implementar lógica real
      message: "User check completed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error checking user",
    });
  }
});

// RUTAS PROTEGIDAS (requieren autenticación)
router.use(authenticate);

// Get current user - LA RUTA QUE ESTABA FALTANDO
router.get("/me", authController.getCurrentUser);

// Update profile
router.put(
  "/profile",
  validateBody(updateProfileSchema.shape.body),
  authController.updateProfile
);

// Logout
router.post("/logout", authController.logout);

// Delete account
router.delete("/account", authController.deleteAccount);

// Additional protected routes
router.get("/session", (req, res) => {
  res.json({
    success: true,
    session: {
      user: req.user,
      timestamp: new Date().toISOString(),
      authenticated: true,
    },
  });
});

// Refresh token info
router.post("/refresh", (req, res) => {
  // En un sistema real, aquí manejarías el refresh de tokens
  res.json({
    success: true,
    message: "Token refresh would happen here",
    user: req.user,
  });
});

export default router;
