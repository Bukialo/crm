import { z } from "zod";

// Target criteria schema
const targetCriteriaSchema = z.object({
  status: z.array(z.enum(["INTERESADO", "PASAJERO", "CLIENTE"])).optional(),
  destinations: z.array(z.string()).optional(),
  budgetRange: z.array(z.enum(["LOW", "MEDIUM", "HIGH", "LUXURY"])).optional(),
  lastTripDays: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  source: z
    .array(
      z.enum([
        "WEBSITE",
        "REFERRAL",
        "SOCIAL_MEDIA",
        "ADVERTISING",
        "DIRECT",
        "PARTNER",
        "OTHER",
      ])
    )
    .optional(),
  assignedAgentId: z.string().uuid().optional(),
});

// Base campaign schema
const campaignBaseSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(255),
  type: z.enum(["EMAIL", "SMS", "WHATSAPP"]),
  subject: z.string().max(255).optional(),
  content: z.string().min(1, "Content is required"),
  templateId: z.string().uuid().optional(),
  targetCriteria: targetCriteriaSchema,
  useAiPersonalization: z.boolean().default(false),
  scheduledDate: z.coerce.date().optional(),
  timezone: z.string().default("UTC"),
});

// Create campaign schema
export const createCampaignSchema = z.object({
  body: campaignBaseSchema,
});

// Update campaign schema
export const updateCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
  body: campaignBaseSchema.partial(),
});

// Get campaign by ID schema
export const getCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
});

// List campaigns query schema
export const listCampaignsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .default(20),
    status: z
      .union([
        z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "CANCELLED"]),
        z.array(z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "CANCELLED"])),
      ])
      .optional(),
    type: z
      .union([
        z.enum(["EMAIL", "SMS", "WHATSAPP"]),
        z.array(z.enum(["EMAIL", "SMS", "WHATSAPP"])),
      ])
      .optional(),
    createdById: z.string().uuid().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    sortBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "name",
        "scheduledDate",
        "sentDate",
        "recipientCount",
      ])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

// Send campaign schema
export const sendCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
});

// Preview campaign schema
export const previewCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
  body: z.object({
    recipients: z.array(z.string().uuid()).optional(),
    contactId: z.string().uuid().optional(),
  }),
});

// Test send schema
export const testSendSchema = z.object({
  body: z.object({
    emails: z
      .array(z.string().email("Invalid email address"))
      .min(1, "At least one email is required")
      .max(5, "Maximum 5 test emails allowed"),
  }),
});

// Schedule campaign schema
export const scheduleCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
  body: z.object({
    scheduledDate: z.coerce
      .date()
      .refine(
        (date) => date > new Date(),
        "Scheduled date must be in the future"
      ),
    timezone: z.string().default("UTC"),
  }),
});

// Update campaign status schema
export const updateCampaignStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
  body: z.object({
    status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "CANCELLED"]),
    reason: z.string().optional(),
  }),
});

// Get recipients schema
export const getRecipientsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .default(50),
    status: z
      .enum(["pending", "sent", "opened", "clicked", "converted", "failed"])
      .optional(),
    search: z.string().optional(),
  }),
});

// Campaign analytics schema
export const getCampaignAnalyticsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
  query: z.object({
    period: z.enum(["day", "week", "month"]).optional().default("day"),
    timezone: z.string().optional().default("UTC"),
  }),
});
