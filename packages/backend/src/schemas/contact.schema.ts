import { z } from "zod";
import {
  ContactStatus,
  BudgetRange,
  TravelStyle,
  ContactSource,
} from "@bukialo/shared";

// Base contact schema
const contactBaseSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
  status: z.nativeEnum(ContactStatus).optional(),
  preferredDestinations: z.array(z.string()).optional().default([]),
  budgetRange: z.nativeEnum(BudgetRange).optional().nullable(),
  travelStyle: z.array(z.nativeEnum(TravelStyle)).optional().default([]),
  groupSize: z.number().int().positive().optional().nullable(),
  preferredSeasons: z.array(z.string()).optional().default([]),
  source: z.nativeEnum(ContactSource).optional(),
  referralSource: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  assignedAgentId: z.string().uuid().optional().nullable(),
});

// Create contact schema
export const createContactSchema = z.object({
  body: contactBaseSchema,
});

// Update contact schema
export const updateContactSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid contact ID"),
  }),
  body: contactBaseSchema.partial(),
});

// Get contact by ID schema
export const getContactSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid contact ID"),
  }),
});

// List contacts query schema
export const listContactsSchema = z.object({
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
        z.nativeEnum(ContactStatus),
        z.array(z.nativeEnum(ContactStatus)),
      ])
      .optional(),
    assignedAgentId: z.string().uuid().optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    source: z
      .union([
        z.nativeEnum(ContactSource),
        z.array(z.nativeEnum(ContactSource)),
      ])
      .optional(),
    budgetRange: z
      .union([z.nativeEnum(BudgetRange), z.array(z.nativeEnum(BudgetRange))])
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

// Bulk import contacts schema
export const bulkImportContactsSchema = z.object({
  body: z.object({
    contacts: z.array(contactBaseSchema),
    skipDuplicates: z.boolean().optional().default(true),
  }),
});

// Add note to contact schema
export const addContactNoteSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid contact ID"),
  }),
  body: z.object({
    content: z.string().min(1, "Note content is required"),
    isImportant: z.boolean().optional().default(false),
  }),
});

// Update contact status schema
export const updateContactStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid contact ID"),
  }),
  body: z.object({
    status: z.nativeEnum(ContactStatus),
    reason: z.string().optional(),
  }),
});

// Export contacts schema
export const exportContactsSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "xlsx"]).optional().default("csv"),
    fields: z.array(z.string()).optional(),
    ...listContactsSchema.shape.query.shape, // Include all filter options
  }),
});
