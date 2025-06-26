import { z } from "zod";

// CORREGIDO: Importar enums desde tipos locales
import { TripStatus } from "../types";

// Base trip schema - CORREGIDO: Asegurar que sea un objeto Zod válido
const tripBaseSchema = z
  .object({
    contactId: z.string().min(1, "Contact ID is required"), // Más flexible que .uuid()
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

// Create trip schema
export const createTripSchema = z.object({
  body: tripBaseSchema,
});

// Update trip schema - CORREGIDO: Usar el schema base correctamente
export const updateTripSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Trip ID is required"),
  }),
  body: z
    .object({
      contactId: z.string().min(1, "Contact ID is required").optional(),
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

// Get trip by ID schema
export const getTripSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Trip ID is required"),
  }),
});

// List trips query schema
export const listTripsSchema = z.object({
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
        z.nativeEnum(TripStatus),
        z.array(z.nativeEnum(TripStatus)),
      ])
      .optional(),
    contactId: z.string().optional(),
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

// Update trip status schema
export const updateTripStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Trip ID is required"),
  }),
  body: z.object({
    status: z.nativeEnum(TripStatus),
    reason: z.string().optional(),
  }),
});

// Trip statistics schema
export const getTripStatsSchema = z.object({
  query: z.object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    contactId: z.string().optional(),
  }),
});

// Export trip services schema for documentation
export const tripServicesSchema = z.object({
  includesFlight: z.boolean().default(false),
  includesHotel: z.boolean().default(false),
  includesTransfer: z.boolean().default(false),
  includesTours: z.boolean().default(false),
  includesInsurance: z.boolean().default(false),
  customServices: z.array(z.string()).default([]),
});

// Trip budget schema
export const tripBudgetSchema = z.object({
  estimatedBudget: z.number().positive("Budget must be positive"),
  finalPrice: z.number().positive().optional(),
  commission: z.number().min(0, "Commission cannot be negative").optional(),
  currency: z.string().length(3, "Currency must be 3 characters").default("USD"),
});

// Trip dates validation schema
export const tripDatesSchema = z.object({
  departureDate: z.coerce.date(),
  returnDate: z.coerce.date(),
}).refine(
  (data) => data.returnDate > data.departureDate,
  {
    message: "Return date must be after departure date",
    path: ["returnDate"],
  }
);

// Validation helpers
export const validateTripDates = (departureDate: Date, returnDate: Date): boolean => {
  return returnDate > departureDate;
};

export const validateTripBudget = (budget: number): boolean => {
  return budget > 0;
};

export const validateTravelers = (travelers: number): boolean => {
  return travelers > 0 && travelers <= 50; // Reasonable limit
};

// Export all schemas and enums
export {
  tripBaseSchema,
  TripStatus,
};