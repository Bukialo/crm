import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import { config } from "../config";
import { AuthService } from "../services/auth.service";
import { AppError } from "../utils/errors";
import { AuthUser } from "@bukialo/shared";
import { logger } from "../utils/logger";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      privateKey: config.firebase.privateKey,
      clientEmail: config.firebase.clientEmail,
    }),
  });
}

const authService = new AuthService();

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get or create user in our database
    const user = await authService.findOrCreateUser({
      uid: decodedToken.uid,
      email: decodedToken.email!,
      displayName: decodedToken.name,
    });

    if (!user.isActive) {
      throw new AppError("User account is disabled", 403);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      firebaseUid: user.firebaseUid,
    };

    next();
  } catch (error: any) {
    logger.error("Authentication error:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    // Firebase specific errors
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.code === "auth/invalid-id-token") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    if (error.code === "auth/project-not-found") {
      logger.error("Firebase project configuration error");
      return res.status(500).json({
        success: false,
        error: "Authentication service configuration error",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Authentication failed",
      code: "AUTH_FAILED",
    });
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        code: "NO_USER",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    const user = await authService.getUserByFirebaseUid(decodedToken.uid);

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firebaseUid: user.firebaseUid,
      };
    }
  } catch (error) {
    logger.debug("Optional auth failed, continuing without user:", error);
    // Ignore errors in optional auth
  }

  next();
};

// Middleware to check if user owns resource or has admin/manager role
export const ownershipOrRole = (resourceField: string = "userId") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    // Admin and Manager can access any resource
    if (["ADMIN", "MANAGER"].includes(req.user.role)) {
      return next();
    }

    // For other roles, check ownership
    // This would need to be implemented based on the specific resource
    // For now, we'll just check if the user ID matches
    const resourceUserId = req.params.userId || req.body[resourceField];

    if (resourceUserId && resourceUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only access your own resources.",
      });
    }

    next();
  };
};

// Middleware to validate Firebase token without database lookup (for health checks)
export const validateFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email!,
      firstName: decodedToken.name?.split(" ")[0] || "",
      lastName: decodedToken.name?.split(" ").slice(1).join(" ") || "",
      role: "UNKNOWN",
      firebaseUid: decodedToken.uid,
    };

    next();
  } catch (error: any) {
    logger.error("Firebase token validation error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};
