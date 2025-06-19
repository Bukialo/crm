import { Router } from "express";
import { automationController } from "../controllers/automation.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import {
  createAutomationSchema,
  updateAutomationSchema,
  getAutomationSchema,
  listAutomationsSchema,
  executeAutomationSchema,
} from "../schemas/automation.schema";

const router = Router();

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
