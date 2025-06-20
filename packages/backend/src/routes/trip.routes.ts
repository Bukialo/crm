import { Router } from "express";
import { tripController } from "../controllers/trip.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const tripBaseSchema = z
  .object({
    contactId: z.string().uuid("Invalid contact ID"),
    destination: z.string().min(1, "Destination is required").max(100),
    departureDate: z.coerce.date(),
    returnDate: z.coerce.date(),
    travelers: z
      .number()
      .int()
      .positive("Number of travelers must be positive"),
    estimatedBudget: z.number().positive("Estimated budget must be positive"),
    finalPrice: z.number().positive().optional(),
    commission: z.number().min(0).optional(),
    includesFlight: z.boolean().optional().default(false),
    includesHotel: z.boolean().optional().default(false),
    includesTransfer: z.boolean().optional().default(false),
    includesTours: z.boolean().optional().default(false),
    includesInsurance: z.boolean().optional().default(false),
    customServices: z.array(z.string()).optional().default([]),
    notes: z.string().optional(),
    internalNotes: z.string().optional(),
  })
  .refine((data) => data.returnDate > data.departureDate, {
    message: "Return date must be after departure date",
    path: ["returnDate"],
  });

const createTripSchema = z.object({
  body: tripBaseSchema,
});

const updateTripSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid trip ID"),
  }),
  body: z
    .object({
      contactId: z.string().uuid("Invalid contact ID").optional(),
      destination: z
        .string()
        .min(1, "Destination is required")
        .max(100)
        .optional(),
      departureDate: z.coerce.date().optional(),
      returnDate: z.coerce.date().optional(),
      travelers: z
        .number()
        .int()
        .positive("Number of travelers must be positive")
        .optional(),
      estimatedBudget: z
        .number()
        .positive("Estimated budget must be positive")
        .optional(),
      finalPrice: z.number().positive().optional(),
      commission: z.number().min(0).optional(),
      includesFlight: z.boolean().optional(),
      includesHotel: z.boolean().optional(),
      includesTransfer: z.boolean().optional(),
      includesTours: z.boolean().optional(),
      includesInsurance: z.boolean().optional(),
      customServices: z.array(z.string()).optional(),
      notes: z.string().optional(),
      internalNotes: z.string().optional(),
    })
    .refine(
      (data) => {
        // Solo validar fechas si ambas están presentes
        if (data.returnDate && data.departureDate) {
          return data.returnDate > data.departureDate;
        }
        return true;
      },
      {
        message: "Return date must be after departure date",
        path: ["returnDate"],
      }
    ),
});

const getTripSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid trip ID"),
  }),
});

const listTripsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .default(20),
    search: z.string().optional(),
    status: z
      .union([
        z.enum(["QUOTE", "BOOKED", "CONFIRMED", "COMPLETED", "CANCELLED"]),
        z.array(
          z.enum(["QUOTE", "BOOKED", "CONFIRMED", "COMPLETED", "CANCELLED"])
        ),
      ])
      .optional(),
    contactId: z.string().uuid().optional(),
    destination: z.string().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    sortBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "destination",
        "departureDate",
        "returnDate",
        "estimatedBudget",
        "finalPrice",
      ])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

const updateTripStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid trip ID"),
  }),
  body: z.object({
    status: z.enum(["QUOTE", "BOOKED", "CONFIRMED", "COMPLETED", "CANCELLED"]),
    reason: z.string().optional(),
  }),
});

// All routes require authentication
router.use(authenticate);

// List trips
router.get(
  "/",
  validateQuery(listTripsSchema.shape.query),
  tripController.findAll
);

// Create trip
router.post(
  "/",
  validateBody(createTripSchema.shape.body),
  tripController.create
);

// Get trip statistics
router.get("/stats", tripController.getStats);

// Get trip by ID
router.get(
  "/:id",
  validateParams(getTripSchema.shape.params),
  tripController.findById
);

// Update trip
router.put(
  "/:id",
  validateParams(updateTripSchema.shape.params),
  validateBody(updateTripSchema.shape.body),
  tripController.update
);

// Update trip status
router.patch(
  "/:id/status",
  validateParams(updateTripStatusSchema.shape.params),
  validateBody(updateTripStatusSchema.shape.body),
  tripController.updateStatus
);

// Delete trip
router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateParams(getTripSchema.shape.params),
  tripController.delete
);

export default router;
