import { z } from "zod";

// Base trip schema - CORREGIDO: Asegurar que sea un objeto Zod válido
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

// Create trip schema
export const createTripSchema = z.object({
  body: tripBaseSchema,
});

// Update trip schema - CORREGIDO: Usar el schema base correctamente
export const updateTripSchema = z.object({
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

// Get trip by ID schema
export const getTripSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid trip ID"),
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

// Update trip status schema
export const updateTripStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid trip ID"),
  }),
  body: z.object({
    status: z.enum(["QUOTE", "BOOKED", "CONFIRMED", "COMPLETED", "CANCELLED"]),
    reason: z.string().optional(),
  }),
});

// Trip statistics schema
export const getTripStatsSchema = z.object({
  query: z.object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    contactId: z.string().uuid().optional(),
  }),
});
