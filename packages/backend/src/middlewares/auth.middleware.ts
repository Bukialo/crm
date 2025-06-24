import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import { config } from "../config";
import { AuthService } from "../services/auth.service";
import { AppError } from "../utils/errors";
import { AuthUser } from "../types/shared";
import { logger } from "../utils/logger";

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        privateKey: config.firebase.privateKey,
        clientEmail: config.firebase.clientEmail,
      }),
    });
    logger.info("Firebase Admin initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize Firebase Admin:", error);
  }
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

// CORREGIDO: Agregado return void y manejo completo de todos los code paths
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "No token provided",
        code: "NO_TOKEN",
        message: "Authorization header with Bearer token is required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token || token.trim() === "") {
      res.status(401).json({
        success: false,
        error: "Empty token provided",
        code: "EMPTY_TOKEN",
      });
      return;
    }

    try {
      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Ensure we have required fields from Firebase
      if (!decodedToken.email) {
        res.status(401).json({
          success: false,
          error: "User email not available from Firebase token",
          code: "MISSING_EMAIL",
        });
        return;
      }

      // Get or create user in our database
      const user = await authService.findOrCreateUser({
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
      });

      if (!user.isActive) {
        res.status(403).json({
          success: false,
          error: "User account is disabled",
          code: "ACCOUNT_DISABLED",
        });
        return;
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

      logger.debug(`User authenticated: ${user.email} (${user.id})`);
      next();
    } catch (firebaseError: any) {
      logger.error("Firebase token verification failed:", firebaseError);

      // Handle specific Firebase errors
      if (firebaseError.code === "auth/id-token-expired") {
        res.status(401).json({
          success: false,
          error: "Token expired",
          code: "TOKEN_EXPIRED",
          message: "Please refresh your authentication token",
        });
        return;
      }

      if (firebaseError.code === "auth/invalid-id-token") {
        res.status(401).json({
          success: false,
          error: "Invalid token",
          code: "INVALID_TOKEN",
          message: "The provided token is not valid",
        });
        return;
      }

      if (firebaseError.code === "auth/project-not-found") {
        logger.error("Firebase project configuration error");
        res.status(500).json({
          success: false,
          error: "Authentication service configuration error",
          code: "CONFIG_ERROR",
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: "Authentication failed",
        code: "AUTH_FAILED",
        message: firebaseError.message || "Token verification failed",
      });
      return;
    }
  } catch (error: any) {
    logger.error("Authentication middleware error:", error);

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: "APP_ERROR",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal authentication error",
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred during authentication",
    });
    return;
  }
};

// Role-based authorization middleware - CORREGIDO: Return void y manejo completo
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized - No user found",
        code: "NO_USER",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
        requiredRoles: allowedRoles,
        userRole: req.user.role,
        message: `This action requires one of the following roles: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token (for mixed endpoints)
// CORREGIDO: Agregado underscore para res no usado
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // If no authorization header, continue without user
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.debug("Optional auth: No token provided, continuing without user");
      next();
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token || token.trim() === "") {
      logger.debug("Optional auth: Empty token, continuing without user");
      next();
      return;
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      if (!decodedToken.email) {
        logger.debug(
          "Optional auth: No email in token, continuing without user"
        );
        next();
        return;
      }

      const user = await authService.findOrCreateUser({
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          firebaseUid: user.firebaseUid,
        };
        logger.debug(`Optional auth: User authenticated: ${user.email}`);
      }
    } catch (error) {
      logger.debug(
        "Optional auth: Token verification failed, continuing without user:",
        error
      );
      // Ignore errors in optional auth - continue without user
    }
  } catch (error) {
    logger.debug(
      "Optional auth: Error occurred, continuing without user:",
      error
    );
    // Ignore errors in optional auth
  }

  next();
};

// Middleware to check if user owns resource or has admin/manager role
export const ownershipOrRole = (resourceField: string = "userId") => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        code: "NO_USER",
      });
      return;
    }

    // Admin and Manager can access any resource
    if (["ADMIN", "MANAGER"].includes(req.user.role)) {
      next();
      return;
    }

    // For other roles, check ownership
    const resourceUserId = req.params.userId || req.body[resourceField];

    if (resourceUserId && resourceUserId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: "Access denied. You can only access your own resources.",
        code: "ACCESS_DENIED",
      });
      return;
    }

    next();
  };
};

// Middleware to validate Firebase token without database lookup (for health checks)
// CORREGIDO: Return Promise<void> y verificación de token
export const validateFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "No token provided",
        code: "NO_TOKEN",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    // CORREGIDO: Verificar que token existe antes de usarlo
    if (!token) {
      res.status(401).json({
        success: false,
        error: "Empty token",
        code: "EMPTY_TOKEN",
      });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    // Ensure we have required fields from Firebase
    if (!decodedToken.email) {
      res.status(401).json({
        success: false,
        error: "User email not available from Firebase token",
        code: "MISSING_EMAIL",
      });
      return;
    }

    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      firstName: decodedToken.name?.split(" ")[0] || "",
      lastName: decodedToken.name?.split(" ").slice(1).join(" ") || "",
      role: "UNKNOWN",
      firebaseUid: decodedToken.uid,
    };

    next();
  } catch (error: any) {
    logger.error("Firebase token validation error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid token",
      code: "INVALID_TOKEN",
    });
    return;
  }
};

// Helper middleware to ensure Firebase is initialized
// CORREGIDO: Agregado underscore para req no usado y return void
export const ensureFirebaseInitialized = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!admin.apps.length) {
    res.status(500).json({
      success: false,
      error: "Firebase not initialized",
      code: "FIREBASE_NOT_INITIALIZED",
    });
    return;
  }
  next();
};

// Middleware for development/testing that bypasses authentication
export const bypassAuthInDevelopment = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (config.isDevelopment && req.headers["x-bypass-auth"] === "true") {
    // Create a mock user for development
    req.user = {
      id: "dev-user-123",
      email: "dev@bukialo.com",
      firstName: "Dev",
      lastName: "User",
      role: "ADMIN",
      firebaseUid: "dev-firebase-uid",
    };
    logger.warn("⚠️ Authentication bypassed for development");
    next();
    return;
  }

  // Continue with normal authentication
  authenticate(req, res, next);
};
