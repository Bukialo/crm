import { Router } from "express";
import { emailController } from "../controllers/email.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Templates
router.get("/templates", emailController.getTemplates);
router.get("/templates/:id", emailController.getTemplate);
router.post("/templates", emailController.createTemplate);
router.put("/templates/:id", emailController.updateTemplate);
router.delete(
  "/templates/:id",
  authorize("ADMIN", "MANAGER"),
  emailController.deleteTemplate
);
router.post("/templates/:id/duplicate", emailController.duplicateTemplate);

// Preview
router.post("/templates/:id/preview", emailController.previewTemplate);

// Envío de emails
router.post("/send", emailController.sendEmail);
router.post("/send-test", emailController.sendTestEmail);

// Campañas
router.post(
  "/campaigns",
  authorize("ADMIN", "MANAGER"),
  emailController.sendCampaign
);
router.get("/campaigns", emailController.getCampaigns);
router.get("/campaigns/:id/stats", emailController.getCampaignStats);

// Historial
router.get("/history", emailController.getEmailHistory);

// Métricas
router.get("/stats", emailController.getEmailStats);

// Tracking (rutas públicas - sin autenticación)
router.get("/track/open/:trackingId", emailController.trackEmailOpen);
router.get("/track/click/:trackingId", emailController.trackEmailClick);

export default router;
