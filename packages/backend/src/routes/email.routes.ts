import { Router } from "express";
import { emailController } from "../controllers/email.controller";
import {
  authenticate,
  authorize,
  optionalAuth,
} from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const createTemplateSchema = z.object({
  body: z.object({
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
  }),
});

const sendEmailSchema = z.object({
  body: z.object({
    to: z.array(z.string().email()),
    templateId: z.string().optional(),
    subject: z.string().min(1, "El asunto es requerido"),
    htmlContent: z.string().min(1, "El contenido es requerido"),
    textContent: z.string().optional(),
    variables: z.record(z.any()).optional(),
    scheduledAt: z.coerce.date().optional(),
    trackOpens: z.boolean().optional().default(true),
    trackClicks: z.boolean().optional().default(true),
  }),
});

const sendCampaignSchema = z.object({
  body: z.object({
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
  }),
});

const getTemplatesQuerySchema = z.object({
  query: z.object({
    category: z.string().optional(),
  }),
});

const getTemplateParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid template ID"),
  }),
});

const previewTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid template ID"),
  }),
  body: z.object({
    variables: z.record(z.any()).optional(),
  }),
});

const getEmailHistoryQuerySchema = z.object({
  query: z.object({
    contactId: z.string().uuid().optional(),
    status: z.string().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .default(20),
  }),
});

const getEmailStatsQuerySchema = z.object({
  query: z.object({
    period: z
      .enum(["day", "week", "month", "year"])
      .optional()
      .default("month"),
  }),
});

const trackingParamsSchema = z.object({
  params: z.object({
    trackingId: z.string().uuid("Invalid tracking ID"),
  }),
});

const trackingQuerySchema = z.object({
  query: z.object({
    url: z.string().url().optional(),
  }),
});

// Tracking routes (public - no authentication required)
router.get(
  "/track/open/:trackingId",
  validateParams(trackingParamsSchema.shape.params),
  emailController.trackEmailOpen
);

router.get(
  "/track/click/:trackingId",
  validateParams(trackingParamsSchema.shape.params),
  validateQuery(trackingQuerySchema.shape.query),
  emailController.trackEmailClick
);

// All other routes require authentication
router.use(authenticate);

// Templates
router.get(
  "/templates",
  validateQuery(getTemplatesQuerySchema.shape.query),
  emailController.getTemplates
);

router.get(
  "/templates/:id",
  validateParams(getTemplateParamsSchema.shape.params),
  emailController.getTemplate
);

router.post(
  "/templates",
  validateBody(createTemplateSchema.shape.body),
  emailController.createTemplate
);

router.put(
  "/templates/:id",
  validateParams(getTemplateParamsSchema.shape.params),
  validateBody(createTemplateSchema.shape.body.partial()),
  emailController.updateTemplate
);

router.delete(
  "/templates/:id",
  authorize("ADMIN", "MANAGER"),
  validateParams(getTemplateParamsSchema.shape.params),
  emailController.deleteTemplate
);

router.post(
  "/templates/:id/duplicate",
  validateParams(getTemplateParamsSchema.shape.params),
  emailController.duplicateTemplate
);

// Preview
router.post(
  "/templates/:id/preview",
  validateParams(previewTemplateSchema.shape.params),
  validateBody(previewTemplateSchema.shape.body),
  emailController.previewTemplate
);

// Envío de emails
router.post(
  "/send",
  validateBody(sendEmailSchema.shape.body),
  emailController.sendEmail
);

router.post(
  "/send-test",
  validateBody(sendEmailSchema.shape.body),
  emailController.sendTestEmail
);

// Campañas
router.post(
  "/campaigns",
  authorize("ADMIN", "MANAGER"),
  validateBody(sendCampaignSchema.shape.body),
  emailController.sendCampaign
);

router.get("/campaigns", emailController.getCampaigns);

router.get(
  "/campaigns/:id/stats",
  validateParams(
    z.object({
      params: z.object({
        id: z.string().uuid("Invalid campaign ID"),
      }),
    }).shape.params
  ),
  emailController.getCampaignStats
);

// Historial
router.get(
  "/history",
  validateQuery(getEmailHistoryQuerySchema.shape.query),
  emailController.getEmailHistory
);

// Métricas
router.get(
  "/stats",
  validateQuery(getEmailStatsQuerySchema.shape.query),
  emailController.getEmailStats
);

export default router;
