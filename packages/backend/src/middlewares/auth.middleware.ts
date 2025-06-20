import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import { config } from "../config";
import { AuthService } from "../services/auth.service";
import { AppError } from "../utils/errors";
import { AuthUser } from "@bukialo/shared";
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

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
        code: "NO_TOKEN",
        message: "Authorization header with Bearer token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token.trim() === "") {
      return res.status(401).json({
        success: false,
        error: "Empty token provided",
        code: "EMPTY_TOKEN",
      });
    }

    try {
      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Ensure we have required fields from Firebase
      if (!decodedToken.email) {
        return res.status(401).json({
          success: false,
          error: "User email not available from Firebase token",
          code: "MISSING_EMAIL",
        });
      }

      // Get or create user in our database
      const user = await authService.findOrCreateUser({
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
      });

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: "User account is disabled",
          code: "ACCOUNT_DISABLED",
        });
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
        return res.status(401).json({
          success: false,
          error: "Token expired",
          code: "TOKEN_EXPIRED",
          message: "Please refresh your authentication token",
        });
      }

      if (firebaseError.code === "auth/invalid-id-token") {
        return res.status(401).json({
          success: false,
          error: "Invalid token",
          code: "INVALID_TOKEN",
          message: "The provided token is not valid",
        });
      }

      if (firebaseError.code === "auth/project-not-found") {
        logger.error("Firebase project configuration error");
        return res.status(500).json({
          success: false,
          error: "Authentication service configuration error",
          code: "CONFIG_ERROR",
        });
      }

      return res.status(401).json({
        success: false,
        error: "Authentication failed",
        code: "AUTH_FAILED",
        message: firebaseError.message || "Token verification failed",
      });
    }
  } catch (error: any) {
    logger.error("Authentication middleware error:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: "APP_ERROR",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal authentication error",
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred during authentication",
    });
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - No user found",
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
        message: `This action requires one of the following roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token (for mixed endpoints)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // If no authorization header, continue without user
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.debug("Optional auth: No token provided, continuing without user");
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token || token.trim() === "") {
      logger.debug("Optional auth: Empty token, continuing without user");
      return next();
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      if (!decodedToken.email) {
        logger.debug(
          "Optional auth: No email in token, continuing without user"
        );
        return next();
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
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        code: "NO_USER",
      });
    }

    // Admin and Manager can access any resource
    if (["ADMIN", "MANAGER"].includes(req.user.role)) {
      return next();
    }

    // For other roles, check ownership
    const resourceUserId = req.params.userId || req.body[resourceField];

    if (resourceUserId && resourceUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only access your own resources.",
        code: "ACCESS_DENIED",
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

    // Ensure we have required fields from Firebase
    if (!decodedToken.email) {
      throw new AppError("User email not available from Firebase token", 401);
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
    return res.status(401).json({
      success: false,
      error: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }
};

// Helper middleware to ensure Firebase is initialized
export const ensureFirebaseInitialized = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!admin.apps.length) {
    return res.status(500).json({
      success: false,
      error: "Firebase not initialized",
      code: "FIREBASE_NOT_INITIALIZED",
    });
  }
  next();
};

// Middleware for development/testing that bypasses authentication
export const bypassAuthInDevelopment = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    return next();
  }

  // Continue with normal authentication
  return authenticate(req, res, next);
};
