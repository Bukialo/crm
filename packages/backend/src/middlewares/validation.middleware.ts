import { Request, Response, NextFunction } from "express";
import { z, ZodSchema, ZodError } from "zod";

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

export const validate = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            received:
              err.path.length > 0 ? getNestedValue(req, err.path) : undefined,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

export const validateBody = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Request body validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            received:
              err.path.length > 0
                ? getNestedValue(req.body, err.path)
                : req.body,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Query parameters validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            received:
              err.path.length > 0
                ? getNestedValue(req.query, err.path)
                : req.query,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(
          `❌ Params validation failed for ${req.method} ${req.path}:`,
          {
            params: req.params,
            errors: error.errors,
          }
        );

        res.status(400).json({
          success: false,
          error: "URL parameters validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            received:
              err.path.length > 0
                ? getNestedValue(req.params, err.path)
                : req.params,
          })),
          debug: {
            path: req.path,
            method: req.method,
            params: req.params,
          },
        });
        return;
      }
      next(error);
    }
  };
};

// Helper function to get nested values from objects
function getNestedValue(obj: any, path: (string | number)[]): any {
  return path.reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// Flexible ID validation that accepts various formats
export const validateId = (paramName: string = "id") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];

    // More flexible ID validation
    if (!id || id.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: `${paramName} parameter is required`,
        received: id,
      });
      return;
    }

    // Check if it's a valid UUID format OR at least a non-empty string
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValidUuid = uuidRegex.test(id);
    const isValidId = id.length >= 1 && id.length <= 100; // Basic length check

    if (!isValidUuid && !isValidId) {
      res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format`,
        received: id,
        expected: "Valid UUID or non-empty string",
      });
      return;
    }

    next();
  };
};

// Middleware specifically for contact ID validation
export const validateContactId = validateId("id");

// Middleware for optional authentication that doesn't fail
export const optionalValidation = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Try to validate, but don't fail if validation errors occur
      const result = await schema.safeParseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (result.success) {
        // If validation passes, update the request objects
        if (result.data.body) req.body = result.data.body;
        if (result.data.query) req.query = result.data.query;
        if (result.data.params) req.params = result.data.params;
      } else {
        // Log validation warnings but continue
        console.warn(
          `⚠️ Optional validation failed for ${req.method} ${req.path}:`,
          result.error.errors
        );
      }

      next();
    } catch (error) {
      // Even if parsing fails completely, continue with original data
      console.warn(
        `⚠️ Optional validation error for ${req.method} ${req.path}:`,
        error
      );
      next();
    }
  };
};

// Enhanced error handler for validation
export const handleValidationError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validation error",
      details: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      })),
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
    return;
  }

  next(error);
};

// Utility function to create flexible UUID schema
export const createFlexibleUuidSchema = (fieldName: string = "id") => {
  return z.string().refine(
    (val) => {
      if (!val || val.trim().length === 0) {
        return false;
      }

      // Check if it's a valid UUID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const isValidUuid = uuidRegex.test(val);

      // Or if it's a reasonable string ID
      const isReasonableId =
        val.length >= 1 && val.length <= 100 && !/[<>\\\/\0]/.test(val);

      return isValidUuid || isReasonableId;
    },
    {
      message: `Invalid ${fieldName} format. Must be a valid UUID or safe string identifier.`,
    }
  );
};

// Pre-built schemas for common validations
export const commonSchemas = {
  id: createFlexibleUuidSchema("id"),
  contactId: createFlexibleUuidSchema("contactId"),
  userId: createFlexibleUuidSchema("userId"),
  tripId: createFlexibleUuidSchema("tripId"),
  email: z.string().email("Invalid email format"),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone format")
    .optional(),
  pagination: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .default(20),
  }),
  dateRange: z
    .object({
      dateFrom: z.coerce.date().optional(),
      dateTo: z.coerce.date().optional(),
    })
    .refine(
      (data) => {
        if (data.dateFrom && data.dateTo) {
          return data.dateFrom <= data.dateTo;
        }
        return true;
      },
      {
        message: "dateFrom must be before or equal to dateTo",
      }
    ),
};

// Middleware to log validation attempts (for debugging)
export const logValidation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log(`🔍 Validation check: ${req.method} ${req.path}`, {
    params: req.params,
    query: Object.keys(req.query),
    body: req.body ? Object.keys(req.body) : "no body",
  });
  next();
};
