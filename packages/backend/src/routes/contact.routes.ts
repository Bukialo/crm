import { Router } from "express";
import { contactController } from "../controllers/contact.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

// MEJORAR: Validación UUID más flexible
const uuidSchema = z.string().refine((val) => {
  // Verificar si es un UUID válido O si es un string que podría ser un ID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(val) || (val && val.length > 0);
}, "Invalid ID format");

// Validation schemas
const contactBaseSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
  status: z.enum(["INTERESADO", "PASAJERO", "CLIENTE"]).optional(),
  preferredDestinations: z.array(z.string()).optional().default([]),
  budgetRange: z
    .enum(["LOW", "MEDIUM", "HIGH", "LUXURY"])
    .optional()
    .nullable(),
  travelStyle: z
    .array(
      z.enum([
        "ADVENTURE",
        "RELAXATION",
        "CULTURAL",
        "BUSINESS",
        "LUXURY",
        "FAMILY",
        "ROMANTIC",
      ])
    )
    .optional()
    .default([]),
  groupSize: z.number().int().positive().optional().nullable(),
  preferredSeasons: z.array(z.string()).optional().default([]),
  source: z
    .enum([
      "WEBSITE",
      "REFERRAL",
      "SOCIAL_MEDIA",
      "ADVERTISING",
      "DIRECT",
      "PARTNER",
      "OTHER",
    ])
    .optional(),
  referralSource: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  assignedAgentId: z.string().optional().nullable(),
});

const createContactSchema = z.object({
  body: contactBaseSchema,
});

const updateContactSchema = z.object({
  params: z.object({
    id: uuidSchema, // ← USAR LA VALIDACIÓN MEJORADA
  }),
  body: contactBaseSchema.partial(),
});

const getContactSchema = z.object({
  params: z.object({
    id: uuidSchema, // ← USAR LA VALIDACIÓN MEJORADA
  }),
});

const listContactsSchema = z.object({
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
        z.enum(["INTERESADO", "PASAJERO", "CLIENTE"]),
        z.array(z.enum(["INTERESADO", "PASAJERO", "CLIENTE"])),
      ])
      .optional(),
    assignedAgentId: uuidSchema.optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    source: z
      .union([
        z.enum([
          "WEBSITE",
          "REFERRAL",
          "SOCIAL_MEDIA",
          "ADVERTISING",
          "DIRECT",
          "PARTNER",
          "OTHER",
        ]),
        z.array(
          z.enum([
            "WEBSITE",
            "REFERRAL",
            "SOCIAL_MEDIA",
            "ADVERTISING",
            "DIRECT",
            "PARTNER",
            "OTHER",
          ])
        ),
      ])
      .optional(),
    budgetRange: z
      .union([
        z.enum(["LOW", "MEDIUM", "HIGH", "LUXURY"]),
        z.array(z.enum(["LOW", "MEDIUM", "HIGH", "LUXURY"])),
      ])
      .optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    sortBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "firstName",
        "lastName",
        "email",
        "lastContact",
        "nextFollowUp",
      ])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

const bulkImportContactsSchema = z.object({
  body: z.object({
    contacts: z.array(contactBaseSchema),
    skipDuplicates: z.boolean().optional().default(true),
  }),
});

const addContactNoteSchema = z.object({
  params: z.object({
    id: uuidSchema, // ← USAR LA VALIDACIÓN MEJORADA
  }),
  body: z.object({
    content: z.string().min(1, "Note content is required"),
    isImportant: z.boolean().optional().default(false),
  }),
});

const updateContactStatusSchema = z.object({
  params: z.object({
    id: uuidSchema, // ← USAR LA VALIDACIÓN MEJORADA
  }),
  body: z.object({
    status: z.enum(["INTERESADO", "PASAJERO", "CLIENTE"]),
    reason: z.string().optional(),
  }),
});

const exportContactsSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "xlsx"]).optional().default("csv"),
    fields: z.array(z.string()).optional(),
    // Include all filter options from listContactsSchema
    search: z.string().optional(),
    status: z
      .union([
        z.enum(["INTERESADO", "PASAJERO", "CLIENTE"]),
        z.array(z.enum(["INTERESADO", "PASAJERO", "CLIENTE"])),
      ])
      .optional(),
    assignedAgentId: uuidSchema.optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    source: z
      .union([
        z.enum([
          "WEBSITE",
          "REFERRAL",
          "SOCIAL_MEDIA",
          "ADVERTISING",
          "DIRECT",
          "PARTNER",
          "OTHER",
        ]),
        z.array(
          z.enum([
            "WEBSITE",
            "REFERRAL",
            "SOCIAL_MEDIA",
            "ADVERTISING",
            "DIRECT",
            "PARTNER",
            "OTHER",
          ])
        ),
      ])
      .optional(),
    budgetRange: z
      .union([
        z.enum(["LOW", "MEDIUM", "HIGH", "LUXURY"]),
        z.array(z.enum(["LOW", "MEDIUM", "HIGH", "LUXURY"])),
      ])
      .optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }),
});

// All routes require authentication
router.use(authenticate);

// Export contacts (before /:id routes)
router.get(
  "/export",
  validateQuery(exportContactsSchema.shape.query),
  contactController.export
);

// List contacts
router.get(
  "/",
  validateQuery(listContactsSchema.shape.query),
  contactController.findAll
);

// Create contact
router.post(
  "/",
  validateBody(createContactSchema.shape.body),
  contactController.create
);

// Bulk import contacts
router.post(
  "/bulk-import",
  authorize("ADMIN", "MANAGER"),
  validateBody(bulkImportContactsSchema.shape.body),
  contactController.bulkImport
);

// MEJORAR: Añadir manejo de errores más específico para IDs
router.get(
  "/:id",
  (req, res, next) => {
    // Validación manual más flexible
    const { id } = req.params;
    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Contact ID is required",
      });
    }
    next();
  },
  contactController.findById
);

// Update contact
router.put(
  "/:id",
  (req, res, next) => {
    const { id } = req.params;
    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Contact ID is required",
      });
    }
    next();
  },
  validateBody(updateContactSchema.shape.body),
  contactController.update
);

// Update contact status
router.patch(
  "/:id/status",
  (req, res, next) => {
    const { id } = req.params;
    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Contact ID is required",
      });
    }
    next();
  },
  validateBody(updateContactStatusSchema.shape.body),
  contactController.updateStatus
);

// Delete contact
router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  (req, res, next) => {
    const { id } = req.params;
    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Contact ID is required",
      });
    }
    next();
  },
  contactController.delete
);

// Add note to contact
router.post(
  "/:id/notes",
  (req, res, next) => {
    const { id } = req.params;
    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Contact ID is required",
      });
    }
    next();
  },
  validateBody(addContactNoteSchema.shape.body),
  contactController.addNote
);

export default router;
