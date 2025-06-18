import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";

// Tipos
interface AiQueryRequest {
  query: string;
  context?: {
    currentPage?: string;
    selectedContactId?: string;
    dateRange?: { from: Date; to: Date };
  };
}

interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    type?: "text" | "chart" | "table" | "suggestion";
    data?: any;
  };
}

export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
  }

  async processQuery(request: AiQueryRequest, userId: string): Promise<any> {
    try {
      // Obtener contexto del CRM
      const context = await this.getCrmContext(request.context);

      // Construir prompt
      const prompt = this.buildPrompt(request.query, context);

      // Generar respuesta con Gemini
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parsear respuesta
      const parsedResponse = this.parseAiResponse(text);

      // Guardar en historial
      await this.saveToHistory(userId, request.query, parsedResponse);

      return {
        message: {
          id: this.generateId(),
          role: "assistant",
          content: parsedResponse.content,
          timestamp: new Date().toISOString(),
          metadata: parsedResponse.metadata,
        },
        suggestions: parsedResponse.suggestions,
        actions: parsedResponse.actions,
      };
    } catch (error) {
      logger.error("Error processing AI query:", error);
      throw error;
    }
  }

  async getCrmContext(contextParams?: any) {
    const context: any = {
      timestamp: new Date().toISOString(),
    };

    try {
      // Obtener estadísticas generales
      const [totalContacts, activeTrips, recentRevenue] = await Promise.all([
        prisma.contact.count(),
        prisma.trip.count({
          where: { status: { in: ["BOOKED", "CONFIRMED"] } },
        }),
        prisma.trip.aggregate({
          where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
          _sum: { finalPrice: true },
        }),
      ]);

      context.stats = {
        totalContacts,
        activeTrips,
        monthlyRevenue: recentRevenue._sum.finalPrice || 0,
      };

      // Si hay un contacto seleccionado, obtener su información
      if (contextParams?.selectedContactId) {
        const contact = await prisma.contact.findUnique({
          where: { id: contextParams.selectedContactId },
          include: {
            trips: {
              orderBy: { createdAt: "desc" },
              take: 5,
            },
            notes: {
              orderBy: { createdAt: "desc" },
              take: 3,
            },
          },
        });
        if (contact) {
          context.selectedContact = contact;
        }
      }

      // Obtener datos según la página actual
      if (contextParams?.currentPage) {
        if (contextParams.currentPage.includes("contacts")) {
          const recentContacts = await prisma.contact.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              id: true,
              firstName: true,
              lastName: true,
              status: true,
              createdAt: true,
            },
          });
          context.recentContacts = recentContacts;
        }
      }

      return context;
    } catch (error) {
      logger.error("Error getting CRM context:", error);
      return context;
    }
  }

  buildPrompt(query: string, context: any): string {
    return `
Eres un asistente IA especializado en el CRM de Bukialo, una agencia de viajes. 
Tu objetivo es ayudar a los agentes a gestionar contactos, analizar datos y mejorar las ventas.

CONTEXTO DEL SISTEMA:
${JSON.stringify(context, null, 2)}

CONSULTA DEL USUARIO:
${query}

INSTRUCCIONES:
1. Responde de forma clara, concisa y profesional
2. Si la consulta requiere datos específicos, proporciona números exactos
3. Si identificas oportunidades de mejora, sugiere acciones concretas
4. Si la consulta requiere una visualización, indica el tipo de gráfico más apropiado
5. Mantén un tono amigable pero profesional

FORMATO DE RESPUESTA:
Debes responder en formato JSON con la siguiente estructura:
{
  "content": "Tu respuesta en texto",
  "metadata": {
    "type": "text|chart|table|suggestion",
    "data": {} // Datos adicionales si aplica
  },
  "suggestions": ["Sugerencia 1", "Sugerencia 2"], // Próximas preguntas sugeridas
  "actions": [
    {
      "type": "navigate|filter|create|export",
      "label": "Texto del botón",
      "params": {} // Parámetros de la acción
    }
  ]
}
`;
  }

  parseAiResponse(text: string): any {
    try {
      // Intentar parsear como JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Si no es JSON, devolver como texto simple
      return {
        content: text,
        metadata: { type: "text" },
        suggestions: [],
        actions: [],
      };
    } catch (error) {
      logger.error("Error parsing AI response:", error);
      return {
        content: text,
        metadata: { type: "text" },
        suggestions: [],
        actions: [],
      };
    }
  }

  async saveToHistory(
    userId: string,
    query: string,
    response: any
  ): Promise<void> {
    try {
      // Aquí podrías guardar el historial en una tabla de chat_history
      // Por ahora solo lo logueamos
      logger.info("AI Chat History:", {
        userId,
        query,
        response: response.content.substring(0, 100) + "...",
      });
    } catch (error) {
      logger.error("Error saving chat history:", error);
    }
  }

  async getInsights(): Promise<any[]> {
    try {
      // Obtener datos para generar insights
      const [lowActivityContacts, upcomingTrips, recentTrends] =
        await Promise.all([
          // Contactos sin actividad reciente
          prisma.contact.findMany({
            where: {
              lastContact: {
                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Más de 30 días
              },
              status: { not: "CLIENTE" },
            },
            take: 5,
          }),

          // Viajes próximos
          prisma.trip.findMany({
            where: {
              departureDate: {
                gte: new Date(),
                lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            },
            include: { contact: true },
          }),

          // Tendencias recientes
          prisma.trip.groupBy({
            by: ["destination"],
            _count: true,
            orderBy: { _count: { destination: "desc" } },
            take: 3,
          }),
        ]);

      const insights = [];

      // Insight sobre contactos inactivos
      if (lowActivityContacts.length > 0) {
        insights.push({
          id: "1",
          title: "Contactos sin actividad reciente",
          description: `Tienes ${lowActivityContacts.length} contactos que no han sido contactados en más de 30 días`,
          priority: "high",
          category: "opportunity",
          actions: [
            {
              label: "Ver contactos",
              action: "/contacts?filter=inactive",
            },
          ],
        });
      }

      // Insight sobre viajes próximos
      if (upcomingTrips.length > 0) {
        insights.push({
          id: "2",
          title: "Viajes próximos esta semana",
          description: `Hay ${upcomingTrips.length} viajes programados para los próximos 7 días`,
          priority: "medium",
          category: "trend",
          actions: [
            {
              label: "Ver calendario",
              action: "/calendar",
            },
          ],
        });
      }

      // Insight sobre destinos populares
      if (recentTrends.length > 0) {
        const topDestination = recentTrends[0];
        insights.push({
          id: "3",
          title: "Destino en tendencia",
          description: `${topDestination.destination} es el destino más popular con ${topDestination._count} reservas recientes`,
          priority: "low",
          category: "trend",
          data: recentTrends,
        });
      }

      return insights;
    } catch (error) {
      logger.error("Error generating insights:", error);
      return [];
    }
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
