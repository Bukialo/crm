import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateBody } from  "../middlewares/validation.middleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Procesar consulta de IA
router.post("/query", aiController.query);

// Obtener historial de chat
router.get("/chat-history", aiController.getChatHistory);

// Obtener insights automáticos
router.get("/insights", aiController.getInsights);

// Generar reporte
router.post("/generate-report", aiController.generateReport);

// Obtener sugerencias contextuales
router.post("/suggestions", aiController.getSuggestions);

export default router;
