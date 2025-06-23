import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { ApiResponse } from "@bukialo/shared";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  // GET /api/dashboard - Dashboard completo
  getDashboardData = asyncHandler(async (req: Request, res: Response) => {
    const dashboardData = await this.dashboardService.getDashboardData();

    const response: ApiResponse = {
      success: true,
      data: dashboardData,
    };

    res.json(response);
  });

  // GET /api/dashboard/stats - Estadísticas generales
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.dashboardService.getStats();

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.json(response);
  });

  // GET /api/dashboard/sales-chart - Gráfico de ventas
  getSalesChart = asyncHandler(async (req: Request, res: Response) => {
    const salesData = await this.dashboardService.getSalesChart();

    const response: ApiResponse = {
      success: true,
      data: salesData,
    };

    res.json(response);
  });

  // GET /api/dashboard/top-destinations - Top destinos
  getTopDestinations = asyncHandler(async (req: Request, res: Response) => {
    const { limit = "5" } = req.query;
    const destinations = await this.dashboardService.getTopDestinations(
      parseInt(limit as string)
    );

    const response: ApiResponse = {
      success: true,
      data: destinations,
    };

    res.json(response);
  });

  // GET /api/dashboard/agent-performance - Rendimiento de agentes
  getAgentPerformance = asyncHandler(async (req: Request, res: Response) => {
    const performance = await this.dashboardService.getAgentPerformance();

    const response: ApiResponse = {
      success: true,
      data: performance,
    };

    res.json(response);
  });

  // GET /api/dashboard/recent-activity - Actividad reciente
  getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
    const { limit = "10" } = req.query;
    const activities = await this.dashboardService.getRecentActivity(
      parseInt(limit as string)
    );

    const response: ApiResponse = {
      success: true,
      data: activities,
    };

    res.json(response);
  });

  // GET /api/dashboard/metrics - Métricas por rango de fechas
  getMetricsByDateRange = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "startDate and endDate are required",
      });
    }

    const metrics = await this.dashboardService.getMetricsByDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    const response: ApiResponse = {
      success: true,
      data: metrics,
    };

    res.json(response);
  });
}

export const dashboardController = new DashboardController();
