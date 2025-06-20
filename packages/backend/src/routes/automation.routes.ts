import { Router } from "express";
import { automationController } from "../controllers/automation.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const createAutomationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(255),
    description: z.string().max(1000).optional(),
    triggerType: z.enum([
      "CONTACT_CREATED",
      "TRIP_QUOTE_REQUESTED",
      "PAYMENT_OVERDUE",
      "TRIP_COMPLETED",
      "NO_ACTIVITY_30_DAYS",
      "SEASONAL_OPPORTUNITY",
      "BIRTHDAY",
      "CUSTOM",
    ]),
    triggerConditions: z.record(z.any()),
    actions: z
      .array(
        z.object({
          type: z.enum([
            "SEND_EMAIL",
            "CREATE_TASK",
            "SCHEDULE_CALL",
            "ADD_TAG",
            "UPDATE_STATUS",
            "GENERATE_QUOTE",
            "ASSIGN_AGENT",
            "SEND_WHATSAPP",
          ]),
          parameters: z.record(z.any()),
          delayMinutes: z.number().min(0).optional().default(0),
          order: z.number().int().min(1),
        })
      )
      .min(1, "At least one action is required")
      .max(10),
  }),
});

const updateAutomationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid automation ID"),
  }),
  body: createAutomationSchema.shape.body.partial(),
});

const getAutomationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid automation ID"),
  }),
});

const listAutomationsSchema = z.object({
  query: z.object({
    isActive: z.enum(["true", "false"]).optional(),
    triggerType: z
      .enum([
        "CONTACT_CREATED",
        "TRIP_QUOTE_REQUESTED",
        "PAYMENT_OVERDUE",
        "TRIP_COMPLETED",
        "NO_ACTIVITY_30_DAYS",
        "SEASONAL_OPPORTUNITY",
        "BIRTHDAY",
        "CUSTOM",
      ])
      .optional(),
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

const executeAutomationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid automation ID"),
  }),
  body: z.object({
    triggerData: z.record(z.any()),
  }),
});

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener templates de triggers y acciones
router.get("/trigger-templates", automationController.getTriggerTemplates);
router.get("/action-templates", automationController.getActionTemplates);

// Obtener estadísticas
router.get("/stats", automationController.getStats);

// Listar automatizaciones
router.get(
  "/",
  validateQuery(listAutomationsSchema.shape.query),
  automationController.findAll
);

// Crear automatización
router.post(
  "/",
  authorize("ADMIN", "MANAGER"),
  validateBody(createAutomationSchema.shape.body),
  automationController.create
);

// Obtener automatización por ID
router.get(
  "/:id",
  validateParams(getAutomationSchema.shape.params),
  automationController.findById
);

// Actualizar automatización
router.put(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateParams(updateAutomationSchema.shape.params),
  validateBody(updateAutomationSchema.shape.body),
  automationController.update
);

// Eliminar automatización
router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateParams(getAutomationSchema.shape.params),
  automationController.delete
);

// Activar/desactivar automatización
router.patch(
  "/:id/toggle",
  authorize("ADMIN", "MANAGER"),
  validateParams(getAutomationSchema.shape.params),
  automationController.toggleActive
);

// Ejecutar automatización manualmente (para testing)
router.post(
  "/:id/execute",
  authorize("ADMIN", "MANAGER"),
  validateParams(executeAutomationSchema.shape.params),
  validateBody(executeAutomationSchema.shape.body),
  automationController.execute
);

export default router;
