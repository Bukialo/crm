import { Request, Response } from "express";
import { AiService } from "../services/ai.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { z } from "zod";

// Schemas de validación
const querySchema = z.object({
  query: z.string().min(1, "La consulta no puede estar vacía"),
  context: z
    .object({
      currentPage: z.string().optional(),
      selectedContactId: z.string().optional(),
      dateRange: z
        .object({
          from: z.coerce.date(),
          to: z.coerce.date(),
        })
        .optional(),
    })
    .optional(),
});

const reportSchema = z.object({
  type: z.string(),
  params: z.any(),
});

export class AiController {
  private aiService: AiService;

  constructor() {
    this.aiService = new AiService();
  }

  // Procesar consulta de IA
  query = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = querySchema.parse(req.body);

    const result = await this.aiService.processQuery(
      validatedData,
      req.user!.id
    );

    res.json({
      success: true,
      data: result,
    });
  });

  // Obtener historial de chat
  getChatHistory = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;

    // Por ahora devolvemos un array vacío
    // En producción, esto vendría de una tabla de base de datos
    const messages = [];

    res.json({
      success: true,
      data: messages,
    });
  });

  // Obtener insights automáticos
  getInsights = asyncHandler(async (req: Request, res: Response) => {
    const insights = await this.aiService.getInsights();

    res.json({
      success: true,
      data: insights,
    });
  });

  // Generar reporte
  generateReport = asyncHandler(async (req: Request, res: Response) => {
    const { type, params } = reportSchema.parse(req.body);

    // Aquí se implementaría la generación de reportes
    // Por ahora devolvemos un placeholder
    const reportUrl = `/reports/${type}_${Date.now()}.pdf`;

    res.json({
      success: true,
      data: reportUrl,
    });
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

    res.json({
      success: true,
      data: suggestions,
    });
  });
}

export const aiController = new AiController();
