import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware";
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

// Public routes
router.post(
  "/register",
  validateBody(registerSchema.shape.body),
  authController.register
);

router.get("/verify-token", optionalAuth, authController.verifyToken);

// Protected routes
router.use(authenticate);

router.get("/me", authController.getCurrentUser);
router.put(
  "/profile",
  validateBody(updateProfileSchema.shape.body),
  authController.updateProfile
);
router.post("/logout", authController.logout);
router.delete("/account", authController.deleteAccount);

export default router;
