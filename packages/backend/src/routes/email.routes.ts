import { Router } from "express";
import { emailController } from "../controllers/email.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const createTemplateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  category: z.enum([
    "WELCOME",
    "QUOTE",
    "FOLLOW_UP",
    "SEASONAL",
    "POST_TRIP",
    "CUSTOM",
  ]),
  subject: z.string().min(1, "El asunto es requerido"),
  htmlContent: z.string().min(1, "El contenido HTML es requerido"),
  textContent: z.string().optional(),
  variables: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["text", "number", "date", "boolean"]),
      required: z.boolean().optional(),
      defaultValue: z.any().optional(),
      description: z.string().optional(),
    })
  ),
  aiPersonalization: z
    .object({
      enabled: z.boolean(),
      context: z.string().optional(),
      tone: z
        .enum(["PROFESSIONAL", "FRIENDLY", "URGENT", "EXCITING"])
        .optional(),
    })
    .optional(),
});

const sendEmailSchema = z.object({
  to: z.array(z.string().email()),
  templateId: z.string().optional(),
  subject: z.string().min(1, "El asunto es requerido"),
  htmlContent: z.string().min(1, "El contenido es requerido"),
  textContent: z.string().optional(),
  variables: z.record(z.any()).optional(),
  scheduledAt: z.coerce.date().optional(),
  trackOpens: z.boolean().optional().default(true),
  trackClicks: z.boolean().optional().default(true),
});

const sendCampaignSchema = z.object({
  name: z.string().min(1, "El nombre de la campaña es requerido"),
  templateId: z.string(),
  targetCriteria: z.object({
    status: z.array(z.enum(["INTERESADO", "PASAJERO", "CLIENTE"])).optional(),
    tags: z.array(z.string()).optional(),
    destinations: z.array(z.string()).optional(),
    budgetRange: z
      .array(z.enum(["LOW", "MEDIUM", "HIGH", "LUXURY"]))
      .optional(),
    lastTripDays: z.number().optional(),
  }),
  scheduledDate: z.coerce.date().optional(),
  useAiPersonalization: z.boolean().optional().default(false),
});

const getTemplatesQuerySchema = z.object({
  category: z.string().optional(),
});

const getTemplateParamsSchema = z.object({
  id: z.string().uuid("Invalid template ID"),
});

const previewTemplateSchema = z.object({
  id: z.string().uuid("Invalid template ID"),
});

const previewTemplateBodySchema = z.object({
  variables: z.record(z.any()).optional(),
});

const getEmailHistoryQuerySchema = z.object({
  contactId: z.string().uuid().optional(),
  status: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

const getEmailStatsQuerySchema = z.object({
  period: z.enum(["day", "week", "month", "year"]).optional().default("month"),
});

const trackingParamsSchema = z.object({
  trackingId: z.string().uuid("Invalid tracking ID"),
});

const trackingQuerySchema = z.object({
  url: z.string().url().optional(),
});

// Tracking routes (public - no authentication required)
router.get(
  "/track/open/:trackingId",
  validateParams(trackingParamsSchema),
  emailController.trackEmailOpen
);

router.get(
  "/track/click/:trackingId",
  validateParams(trackingParamsSchema),
  validateQuery(trackingQuerySchema),
  emailController.trackEmailClick
);

// All other routes require authentication
router.use(authenticate);

// Templates
router.get(
  "/templates",
  validateQuery(getTemplatesQuerySchema),
  emailController.getTemplates
);

router.get(
  "/templates/:id",
  validateParams(getTemplateParamsSchema),
  emailController.getTemplate
);

router.post(
  "/templates",
  validateBody(createTemplateSchema),
  emailController.createTemplate
);

router.put(
  "/templates/:id",
  validateParams(getTemplateParamsSchema),
  validateBody(createTemplateSchema.partial()),
  emailController.updateTemplate
);

router.delete(
  "/templates/:id",
  authorize("ADMIN", "MANAGER"),
  validateParams(getTemplateParamsSchema),
  emailController.deleteTemplate
);

router.post(
  "/templates/:id/duplicate",
  validateParams(getTemplateParamsSchema),
  emailController.duplicateTemplate
);

// Preview
router.post(
  "/templates/:id/preview",
  validateParams(previewTemplateSchema),
  validateBody(previewTemplateBodySchema),
  emailController.previewTemplate
);

// Envío de emails
router.post("/send", validateBody(sendEmailSchema), emailController.sendEmail);

router.post(
  "/send-test",
  validateBody(sendEmailSchema),
  emailController.sendTestEmail
);

// Campañas
router.post(
  "/campaigns",
  authorize("ADMIN", "MANAGER"),
  validateBody(sendCampaignSchema),
  emailController.sendCampaign
);

router.get("/campaigns", emailController.getCampaigns);

router.get(
  "/campaigns/:id/stats",
  validateParams(
    z.object({
      id: z.string().uuid("Invalid campaign ID"),
    })
  ),
  emailController.getCampaignStats
);

// Historial
router.get(
  "/history",
  validateQuery(getEmailHistoryQuerySchema),
  emailController.getEmailHistory
);

// Métricas
router.get(
  "/stats",
  validateQuery(getEmailStatsQuerySchema),
  emailController.getEmailStats
);

export default router;
