import api from "../lib/axios";

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    type?: "text" | "chart" | "table" | "suggestion";
    data?: any;
    suggestions?: string[];
  };
}

export interface AiChatSession {
  id: string;
  userId: string;
  messages: AiMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AiQueryRequest {
  query: string;
  context?: {
    currentPage?: string;
    selectedContactId?: string;
    dateRange?: { from: Date; to: Date };
    userLocation?: string;
  };
}

export interface AiQueryResponse {
  message: AiMessage;
  suggestions?: string[];
  actions?: Array<{
    type: "navigate" | "filter" | "create" | "export" | "update";
    label: string;
    params: any;
  }>;
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "opportunity" | "warning" | "trend" | "suggestion";
  data?: any;
  actions?: Array<{
    label: string;
    action: string;
  }>;
  createdAt: string;
}

class AiService {
  async sendQuery(request: AiQueryRequest): Promise<AiQueryResponse> {
    try {
      console.log("Sending AI query:", request); // Debug

      const response = await api.post("/ai/query", request);

      console.log("AI Response:", response.data); // Debug

      // ✅ Manejar respuesta del backend corregido
      if (response.data.success) {
        return response.data.data;
      }

      // Fallback si no hay data
      return this.createFallbackResponse(request.query);
    } catch (error: any) {
      console.error("AI query error:", error);

      // ✅ Fallback mejorado en caso de error
      return this.createFallbackResponse(request.query);
    }
  }

  private createFallbackResponse(query: string): AiQueryResponse {
    return {
      message: {
        id: Date.now().toString(),
        role: "assistant",
        content: `Entiendo tu consulta sobre "${query}". En este momento estoy procesando la información. ¿Podrías reformular tu pregunta o probar con algo más específico?`,
        timestamp: new Date().toISOString(),
        metadata: { type: "text" },
      },
      suggestions: this.getExampleQueries(),
    };
  }

  async getChatHistory(limit = 50): Promise<AiMessage[]> {
    try {
      const response = await api.get(`/ai/chat-history?limit=${limit}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error("Error getting chat history:", error);
      return [];
    }
  }

  async getInsights(): Promise<AiInsight[]> {
    try {
      const response = await api.get("/ai/insights");
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error("Error getting insights:", error);
      return [];
    }
  }

  async generateReport(type: string, params: any): Promise<string> {
    try {
      const response = await api.post("/ai/generate-report", { type, params });
      return response.data.data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  }

  async getSuggestions(context: any): Promise<string[]> {
    try {
      const response = await api.post("/ai/suggestions", { context });
      return response.data.data;
    } catch (error) {
      console.error("Error getting suggestions:", error);
      return this.getExampleQueries();
    }
  }

  // Ejemplos de consultas predefinidas
  getExampleQueries(): string[] {
    return [
      "¿Cuántos contactos nuevos tuvimos este mes?",
      "Muéstrame los destinos más populares",
      "¿Cuál es mi tasa de conversión?",
      "Genera un reporte de ventas del último trimestre",
      "¿Qué clientes tienen viajes próximos?",
      "Analiza el rendimiento de los agentes",
      "¿Cuáles son las tendencias de reservas?",
      "Sugiere acciones para mejorar las ventas",
      "¿Cuántos clientes están en cada etapa del pipeline?",
      "Muéstrame el resumen de actividad de hoy",
    ];
  }

  // Validar y limpiar query antes de enviar
  sanitizeQuery(query: string): string {
    return query
      .trim()
      .replace(/[<>]/g, "") // Remover caracteres peligrosos
      .substring(0, 500); // Limitar longitud
  }

  // Generar ID único para mensajes
  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Crear mensaje del usuario
  createUserMessage(content: string): AiMessage {
    return {
      id: this.generateMessageId(),
      role: "user",
      content: this.sanitizeQuery(content),
      timestamp: new Date().toISOString(),
      metadata: { type: "text" },
    };
  }

  // Procesar contexto de la aplicación
  getApplicationContext(): Record<string, any> {
    return {
      currentPage: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      language: navigator.language || "es",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}

export const aiService = new AiService();
