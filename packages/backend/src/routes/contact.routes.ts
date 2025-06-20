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
  assignedAgentId: z.string().uuid().optional().nullable(),
});

const createContactSchema = z.object({
  body: contactBaseSchema,
});

const updateContactSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid contact ID"),
  }),
  body: contactBaseSchema.partial(),
});

const getContactSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid contact ID"),
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
    assignedAgentId: z.string().uuid().optional(),
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
    id: z.string().uuid("Invalid contact ID"),
  }),
  body: z.object({
    content: z.string().min(1, "Note content is required"),
    isImportant: z.boolean().optional().default(false),
  }),
});

const updateContactStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid contact ID"),
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
    assignedAgentId: z.string().uuid().optional(),
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

// Get contact by ID
router.get(
  "/:id",
  validateParams(getContactSchema.shape.params),
  contactController.findById
);

// Update contact
router.put(
  "/:id",
  validateParams(updateContactSchema.shape.params),
  validateBody(updateContactSchema.shape.body),
  contactController.update
);

// Update contact status
router.patch(
  "/:id/status",
  validateParams(updateContactStatusSchema.shape.params),
  validateBody(updateContactStatusSchema.shape.body),
  contactController.updateStatus
);

// Delete contact
router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateParams(getContactSchema.shape.params),
  contactController.delete
);

// Add note to contact
router.post(
  "/:id/notes",
  validateParams(addContactNoteSchema.shape.params),
  validateBody(addContactNoteSchema.shape.body),
  contactController.addNote
);

export default router;
