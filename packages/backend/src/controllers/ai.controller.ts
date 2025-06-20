import { Request, Response } from "express";
import { AiService } from "../services/ai.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { ApiResponse } from "@bukialo/shared";

export class AiController {
  private aiService: AiService;

  constructor() {
    this.aiService = new AiService();
  }

  // Procesar consulta de IA
  query = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { query, context } = req.body;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "La consulta no puede estar vacía",
        });
      }

      const result = await this.aiService.processQuery(
        { query, context },
        req.user!.id
      );

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Error in AI query:", error);
      res.status(500).json({
        success: false,
        error: "Error procesando la consulta de IA",
        message: error.message,
      });
    }
  });

  // Obtener historial de chat
  getChatHistory = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;

    // Por ahora devolvemos un array vacío
    // En producción, esto vendría de una tabla de base de datos
    const messages = [];

    const response: ApiResponse = {
      success: true,
      data: messages,
    };

    res.json(response);
  });

  // Obtener insights automáticos
  getInsights = asyncHandler(async (req: Request, res: Response) => {
    try {
      const insights = await this.aiService.getInsights();

      const response: ApiResponse = {
        success: true,
        data: insights,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Error getting insights:", error);
      res.status(500).json({
        success: false,
        error: "Error obteniendo insights",
        message: error.message,
      });
    }
  });

  // Generar reporte
  generateReport = asyncHandler(async (req: Request, res: Response) => {
    const { type, params } = req.body;

    // Aquí se implementaría la generación de reportes
    // Por ahora devolvemos un placeholder
    const reportUrl = `/reports/${type}_${Date.now()}.pdf`;

    const response: ApiResponse = {
      success: true,
      data: { reportUrl, type, params },
      message: "Reporte generado exitosamente",
    };

    res.json(response);
  });

  // Obtener sugerencias contextuales
  getSuggestions = asyncHandler(async (req: Request, res: Response) => {
    const { context } = req.body;

    // Sugerencias basadas en el contexto
    const suggestions = [
      "¿Cuántos contactos nuevos tuvimos este mes?",
      "Muéstrame los destinos más populares",
      "¿Cuál es mi tasa de conversión?",
      "Genera un reporte de ventas del último trimestre",
      "¿Qué clientes tienen viajes próximos?",
      "Analiza el rendimiento de los agentes",
      "¿Cuáles son las tendencias de reservas?",
      "Sugiere acciones para mejorar las ventas",
    ];

    const response: ApiResponse = {
      success: true,
      data: suggestions,
    };

    res.json(response);
  });
}

export const aiController = new AiController();
