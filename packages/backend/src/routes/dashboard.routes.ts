import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Dashboard completo (usado por frontend)
router.get("/", dashboardController.getDashboardData);

// Estadísticas generales
router.get("/stats", dashboardController.getStats);

// Gráfico de ventas
router.get("/sales-chart", dashboardController.getSalesChart);

// Top destinos
router.get("/top-destinations", dashboardController.getTopDestinations);

// Rendimiento de agentes
router.get("/agent-performance", dashboardController.getAgentPerformance);

// Actividad reciente
router.get("/recent-activity", dashboardController.getRecentActivity);

// Métricas específicas por fecha
router.get("/metrics", dashboardController.getMetricsByDateRange);

export default router;
