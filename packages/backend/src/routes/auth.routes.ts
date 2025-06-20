import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  firebaseUid: z.string().min(1, "Firebase UID is required"),
  role: z
    .enum(["ADMIN", "MANAGER", "AGENT", "VIEWER"])
    .optional()
    .default("AGENT"),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
});

// Public routes
router.post("/register", validateBody(registerSchema), authController.register);

// Nueva ruta combinada para login/registro (RECOMENDADA)
router.post(
  "/login-or-register",
  validateBody(registerSchema),
  authController.loginOrRegister
);

router.get("/verify-token", optionalAuth, authController.verifyToken);

// Protected routes
router.use(authenticate);

router.get("/me", authController.getCurrentUser);
router.put(
  "/profile",
  validateBody(updateProfileSchema),
  authController.updateProfile
);
router.post("/logout", authController.logout);
router.delete("/account", authController.deleteAccount);

export default router;
