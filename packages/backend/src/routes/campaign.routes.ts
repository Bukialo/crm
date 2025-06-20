import { Router } from "express";
import { campaignController } from "../controllers/campaign.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
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

const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Campaign name is required").max(255),
    type: z.enum(["EMAIL", "SMS", "WHATSAPP"]),
    subject: z.string().max(255).optional(),
    content: z.string().min(1, "Content is required"),
    templateId: z.string().uuid().optional(),
    targetCriteria: targetCriteriaSchema,
    useAiPersonalization: z.boolean().default(false),
    scheduledDate: z.coerce.date().optional(),
    timezone: z.string().default("UTC"),
  }),
});

const updateCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
  body: createCampaignSchema.shape.body.partial(),
});

const getCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
});

const listCampaignsSchema = z.object({
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

const sendCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
});

const previewCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
  body: z.object({
    recipients: z.array(z.string().uuid()).optional(),
    contactId: z.string().uuid().optional(),
  }),
});

const testSendSchema = z.object({
  body: z.object({
    emails: z
      .array(z.string().email("Invalid email address"))
      .min(1, "At least one email is required")
      .max(5, "Maximum 5 test emails allowed"),
  }),
});

const scheduleCampaignSchema = z.object({
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

const updateCampaignStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid campaign ID"),
  }),
  body: z.object({
    status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "CANCELLED"]),
    reason: z.string().optional(),
  }),
});

// All routes require authentication
router.use(authenticate);

// List campaigns
router.get(
  "/",
  validateQuery(listCampaignsSchema.shape.query),
  campaignController.findAll
);

// Create campaign
router.post(
  "/",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateBody(createCampaignSchema.shape.body),
  campaignController.create
);

// Get campaign by ID
router.get(
  "/:id",
  validateParams(getCampaignSchema.shape.params),
  campaignController.findById
);

// Update campaign
router.put(
  "/:id",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateParams(updateCampaignSchema.shape.params),
  validateBody(updateCampaignSchema.shape.body),
  campaignController.update
);

// Delete campaign
router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateParams(getCampaignSchema.shape.params),
  campaignController.delete
);

// Send campaign
router.post(
  "/:id/send",
  authorize("ADMIN", "MANAGER"),
  validateParams(sendCampaignSchema.shape.params),
  campaignController.send
);

// Duplicate campaign
router.post(
  "/:id/duplicate",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateParams(getCampaignSchema.shape.params),
  campaignController.duplicate
);

// Get campaign statistics
router.get(
  "/:id/stats",
  validateParams(getCampaignSchema.shape.params),
  campaignController.getStats
);

// Get campaign analytics
router.get(
  "/:id/analytics",
  validateParams(getCampaignSchema.shape.params),
  campaignController.getAnalytics
);

// Preview campaign
router.post(
  "/:id/preview",
  validateParams(previewCampaignSchema.shape.params),
  validateBody(previewCampaignSchema.shape.body),
  campaignController.preview
);

// Test send campaign
router.post(
  "/:id/test-send",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateParams(getCampaignSchema.shape.params),
  validateBody(testSendSchema.shape.body),
  campaignController.testSend
);

// Schedule campaign
router.post(
  "/:id/schedule",
  authorize("ADMIN", "MANAGER"),
  validateParams(scheduleCampaignSchema.shape.params),
  validateBody(scheduleCampaignSchema.shape.body),
  campaignController.schedule
);

// Update campaign status (pause, resume, cancel)
router.patch(
  "/:id/status",
  authorize("ADMIN", "MANAGER"),
  validateParams(updateCampaignStatusSchema.shape.params),
  validateBody(updateCampaignStatusSchema.shape.body),
  campaignController.updateStatus
);

// Get campaign recipients
router.get(
  "/:id/recipients",
  validateParams(getCampaignSchema.shape.params),
  campaignController.getRecipients
);

export default router;
