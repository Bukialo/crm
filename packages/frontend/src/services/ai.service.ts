import api from  "../lib/axios";

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    type?: "text" | "chart" | "table" | "suggestion";
    data?: any;
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
  };
}

export interface AiQueryResponse {
  message: AiMessage;
  suggestions?: string[];
  actions?: Array<{
    type: "navigate" | "filter" | "create" | "export";
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
}

class AiService {
  async sendQuery(request: AiQueryRequest): Promise<AiQueryResponse> {
    const response = await api.post("/ai/query", request);
    return response.data.data;
  }

  async getChatHistory(limit = 50): Promise<AiMessage[]> {
    const response = await api.get(`/ai/chat-history?limit=${limit}`);
    return response.data.data;
  }

  async getInsights(): Promise<AiInsight[]> {
    const response = await api.get("/ai/insights");
    return response.data.data;
  }

  async generateReport(type: string, params: any): Promise<string> {
    const response = await api.post("/ai/generate-report", { type, params });
    return response.data.data;
  }

  async getSuggestions(context: any): Promise<string[]> {
    const response = await api.post("/ai/suggestions", { context });
    return response.data.data;
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
    ];
  }
}

export const aiService = new AiService();
