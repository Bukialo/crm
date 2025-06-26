import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { logger } from "../utils/logger";
import { AppError } from "../utils/errors";
import { config } from "../config";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        firebaseUid: string;
      };
    }
  }
}

// CORREGIDO: Agregado underscore para next no usado
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error({
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.id,
  });

  // Handle known error types
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      ...(config.isDevelopment && { stack: error.stack }),
    });
    return;
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validation failed",
      errors: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
    return;
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === "P2002") {
      const field = (error.meta?.target as string[])?.[0];
      res.status(409).json({
        success: false,
        error: `${field} already exists`,
      });
      return;
    }

    // Record not found
    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        error: "Record not found",
      });
      return;
    }

    // Foreign key constraint violation
    if (error.code === "P2003") {
      res.status(400).json({
        success: false,
        error: "Invalid reference",
      });
      return;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      error: "Invalid data provided",
      ...(config.isDevelopment && { details: error.message }),
    });
    return;
  }

  // Handle syntax errors from body parsing
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({
      success: false,
      error: "Invalid JSON",
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: config.isProduction ? "Internal server error" : error.message,
    ...(config.isDevelopment && { stack: error.stack }),
  });
};

// Async error handler wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
