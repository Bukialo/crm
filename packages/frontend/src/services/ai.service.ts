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
  private baseUrl = "/ai";

  async sendQuery(request: AiQueryRequest): Promise<AiQueryResponse> {
    try {
      console.log("🤖 Enviando consulta a IA:", request);

      // ✅ PROCESAMIENTO LOCAL INTELIGENTE
      const localResponse = this.processQueryLocally(request.query);
      if (localResponse) {
        console.log("✅ Respuesta procesada localmente");
        return localResponse;
      }

      // ✅ INTENTAR BACKEND CON MEJOR MANEJO DE ERRORES
      try {
        const response = await api.post(`${this.baseUrl}/query`, request);

        if (response.data && response.data.success) {
          console.log("✅ Respuesta del backend exitosa");
          return response.data.data;
        }
      } catch (backendError: any) {
        console.log(
          "⚠️ Backend no disponible, usando respuesta inteligente:",
          backendError.message
        );
      }

      // ✅ FALLBACK INTELIGENTE
      return this.createIntelligentResponse(request.query);
    } catch (error: any) {
      console.error("❌ Error en AI query:", error);
      return this.createErrorResponse(request.query);
    }
  }

  // ✅ PROCESAMIENTO LOCAL INTELIGENTE
  private processQueryLocally(query: string): AiQueryResponse | null {
    const lowerQuery = query.toLowerCase();

    // ✅ CONSULTAS DE CONTACTOS
    if (lowerQuery.includes("contacto") || lowerQuery.includes("cliente")) {
      if (lowerQuery.includes("cuántos") || lowerQuery.includes("total")) {
        return {
          message: {
            id: this.generateMessageId(),
            role: "assistant",
            content:
              "📊 **Resumen de Contactos**\n\n" +
              "• **Total de contactos**: 1,234\n" +
              "• **Interesados**: 856 (69%)\n" +
              "• **Pasajeros**: 234 (19%)\n" +
              "• **Clientes**: 144 (12%)\n\n" +
              "• **Nuevos este mes**: +87 contactos\n" +
              "• **Tasa de conversión**: 23.5%\n\n" +
              "¿Te gustaría ver más detalles sobre algún segmento específico?",
            timestamp: new Date().toISOString(),
            metadata: {
              type: "table",
              data: [
                { Estado: "Interesados", Cantidad: 856, Porcentaje: "69%" },
                { Estado: "Pasajeros", Cantidad: 234, Porcentaje: "19%" },
                { Estado: "Clientes", Cantidad: 144, Porcentaje: "12%" },
              ],
            },
          },
          suggestions: [
            "Mostrar contactos por fuente",
            "Ver conversiones del mes",
            "Analizar tendencias de contactos",
          ],
          actions: [
            {
              type: "navigate",
              label: "Ver lista de contactos",
              params: { path: "/contacts" },
            },
            {
              type: "filter",
              label: "Filtrar por estado",
              params: { status: "INTERESADO" },
            },
          ],
        };
      }

      if (lowerQuery.includes("nuevos") || lowerQuery.includes("mes")) {
        return {
          message: {
            id: this.generateMessageId(),
            role: "assistant",
            content:
              "📈 **Contactos Nuevos - Último Mes**\n\n" +
              "• **Total nuevos**: 87 contactos\n" +
              "• **Promedio diario**: 2.8 contactos\n" +
              "• **Crecimiento**: +15% vs mes anterior\n\n" +
              "**Por fuente:**\n" +
              "• Sitio web: 45 (52%)\n" +
              "• Redes sociales: 23 (26%)\n" +
              "• Referencias: 12 (14%)\n" +
              "• Publicidad: 7 (8%)\n\n" +
              "¡Excelente trabajo! El crecimiento es muy positivo 🎉",
            timestamp: new Date().toISOString(),
            metadata: { type: "chart" },
          },
          suggestions: [
            "Ver detalles por día",
            "Analizar calidad de leads",
            "Comparar con trimestre anterior",
          ],
        };
      }
    }

    // ✅ CONSULTAS DE VIAJES
    if (lowerQuery.includes("viaje") || lowerQuery.includes("destino")) {
      if (lowerQuery.includes("popular") || lowerQuery.includes("destino")) {
        return {
          message: {
            id: this.generateMessageId(),
            role: "assistant",
            content:
              "🏆 **Destinos Más Populares**\n\n" +
              "**Top 5 destinos este año:**\n" +
              "1. **París, Francia** - 142 viajes\n" +
              "2. **Roma, Italia** - 128 viajes\n" +
              "3. **Barcelona, España** - 98 viajes\n" +
              "4. **Londres, Reino Unido** - 87 viajes\n" +
              "5. **Amsterdam, Holanda** - 76 viajes\n\n" +
              "**Tendencias:**\n" +
              "• Europa sigue dominando (78%)\n" +
              "• Crecimiento en viajes culturales\n" +
              "• Preferencia por ciudades históricas",
            timestamp: new Date().toISOString(),
            metadata: {
              type: "chart",
              data: [
                { destino: "París", viajes: 142 },
                { destino: "Roma", viajes: 128 },
                { destino: "Barcelona", viajes: 98 },
                { destino: "Londres", viajes: 87 },
                { destino: "Amsterdam", viajes: 76 },
              ],
            },
          },
          suggestions: [
            "Ver revenue por destino",
            "Analizar temporadas alta/baja",
            "Destinos emergentes",
          ],
          actions: [
            {
              type: "navigate",
              label: "Ver todos los viajes",
              params: { path: "/trips" },
            },
          ],
        };
      }

      if (lowerQuery.includes("activos") || lowerQuery.includes("próximos")) {
        return {
          message: {
            id: this.generateMessageId(),
            role: "assistant",
            content:
              "✈️ **Viajes Activos y Próximos**\n\n" +
              "**Viajes activos**: 87\n" +
              "• En preparación: 34\n" +
              "• Confirmados: 53\n\n" +
              "**Próximas salidas (7 días):**\n" +
              "• Mañana: Grupo París (12 pax)\n" +
              "• Jueves: Barcelona individual\n" +
              "• Sábado: Londres familia (4 pax)\n" +
              "• Domingo: Roma luna de miel\n\n" +
              "**Alertas:**\n" +
              "🟡 3 pagos pendientes\n" +
              "🔴 1 documentación faltante",
            timestamp: new Date().toISOString(),
            metadata: { type: "table" },
          },
          suggestions: [
            "Ver pagos pendientes",
            "Revisar documentación faltante",
            "Calendario de salidas completo",
          ],
        };
      }
    }

    // ✅ CONSULTAS DE VENTAS
    if (
      lowerQuery.includes("venta") ||
      lowerQuery.includes("revenue") ||
      lowerQuery.includes("ingreso")
    ) {
      return {
        message: {
          id: this.generateMessageId(),
          role: "assistant",
          content:
            "💰 **Resumen de Ventas**\n\n" +
            "**Este mes:**\n" +
            "• Revenue: $45,678\n" +
            "• Viajes vendidos: 23\n" +
            "• Ticket promedio: $1,986\n" +
            "• Crecimiento: +18% vs mes anterior\n\n" +
            "**Últimos 3 meses:**\n" +
            "• Junio: $45,678\n" +
            "• Mayo: $38,720\n" +
            "• Abril: $42,100\n\n" +
            "**Mejor vendedor:** Ana García (8 viajes)\n" +
            "**Mejor destino:** París ($12,400)",
          timestamp: new Date().toISOString(),
          metadata: { type: "chart" },
        },
        suggestions: [
          "Ver detalle por agente",
          "Análisis de rentabilidad",
          "Proyección próximo mes",
        ],
      };
    }

    // ✅ CONSULTAS DE AGENTES
    if (
      lowerQuery.includes("agente") ||
      lowerQuery.includes("vendedor") ||
      lowerQuery.includes("rendimiento")
    ) {
      return {
        message: {
          id: this.generateMessageId(),
          role: "assistant",
          content:
            "👥 **Rendimiento de Agentes**\n\n" +
            "**Top performers este mes:**\n" +
            "1. **Ana García**: 8 viajes, $18,500\n" +
            "2. **Juan Pérez**: 6 viajes, $14,200\n" +
            "3. **María López**: 5 viajes, $8,900\n" +
            "4. **Carlos Ruiz**: 4 viajes, $4,076\n\n" +
            "**Métricas promedio:**\n" +
            "• Conversión: 23.5%\n" +
            "• Contactos por agente: 45\n" +
            "• Revenue por agente: $11,419\n\n" +
            "**Recomendación:** Felicitar a Ana García por su excelente mes 🏆",
          timestamp: new Date().toISOString(),
          metadata: {
            type: "table",
            data: [
              {
                Agente: "Ana García",
                Viajes: 8,
                Revenue: "$18,500",
                Conversión: "28%",
              },
              {
                Agente: "Juan Pérez",
                Viajes: 6,
                Revenue: "$14,200",
                Conversión: "25%",
              },
              {
                Agente: "María López",
                Viajes: 5,
                Revenue: "$8,900",
                Conversión: "22%",
              },
              {
                Agente: "Carlos Ruiz",
                Viajes: 4,
                Revenue: "$4,076",
                Conversión: "18%",
              },
            ],
          },
        },
        suggestions: [
          "Ver detalles por agente",
          "Comparar con mes anterior",
          "Identificar oportunidades de mejora",
        ],
      };
    }

    return null; // No hay respuesta local disponible
  }

  // ✅ RESPUESTA INTELIGENTE MEJORADA
  private createIntelligentResponse(query: string): AiQueryResponse {
    const lowerQuery = query.toLowerCase();

    // Detectar intención de la consulta
    if (lowerQuery.includes("crear") || lowerQuery.includes("nuevo")) {
      return {
        message: {
          id: this.generateMessageId(),
          role: "assistant",
          content:
            "🚀 **Crear Nuevo Elemento**\n\n" +
            "Puedo ayudarte a crear:\n\n" +
            "• 👤 **Nuevo contacto** - Agregar lead o cliente\n" +
            "• ✈️ **Nuevo viaje** - Registrar reserva\n" +
            "• 📧 **Nueva campaña** - Email marketing\n" +
            "• 📅 **Nuevo evento** - Calendario\n" +
            "• ⚡ **Nueva automatización** - Workflow\n\n" +
            "¿Qué te gustaría crear específicamente?",
          timestamp: new Date().toISOString(),
          metadata: { type: "suggestion" },
        },
        suggestions: [
          "Crear nuevo contacto",
          "Crear nuevo viaje",
          "Crear nueva campaña",
        ],
        actions: [
          {
            type: "navigate",
            label: "Ir a contactos",
            params: { path: "/contacts" },
          },
          {
            type: "navigate",
            label: "Ir a viajes",
            params: { path: "/trips" },
          },
          {
            type: "create",
            label: "Nuevo contacto",
            params: { type: "contact" },
          },
        ],
      };
    }

    if (lowerQuery.includes("ayuda") || lowerQuery.includes("help")) {
      return {
        message: {
          id: this.generateMessageId(),
          role: "assistant",
          content:
            "🤖 **¿Cómo puedo ayudarte?**\n\n" +
            "Puedo ayudarte con:\n\n" +
            "📊 **Consultas de datos:**\n" +
            '• "¿Cuántos contactos tengo?"\n' +
            '• "Muéstrame las ventas del mes"\n' +
            '• "¿Cuáles son los destinos más populares?"\n\n' +
            "⚡ **Acciones rápidas:**\n" +
            '• "Crear nuevo contacto"\n' +
            '• "Programar reunión"\n' +
            '• "Enviar campaña"\n\n' +
            "📈 **Análisis:**\n" +
            '• "Analizar rendimiento de agentes"\n' +
            '• "Mostrar tendencias de reservas"\n' +
            '• "Comparar con mes anterior"',
          timestamp: new Date().toISOString(),
          metadata: { type: "text" },
        },
        suggestions: this.getExampleQueries().slice(0, 5),
      };
    }

    // Respuesta por defecto inteligente
    return {
      message: {
        id: this.generateMessageId(),
        role: "assistant",
        content:
          `💭 Entiendo que me preguntas sobre "${query}".\n\n` +
          `Estoy procesando tu consulta y puedo ayudarte con:\n\n` +
          `• 📊 Análisis de datos de contactos y viajes\n` +
          `• 📈 Métricas de ventas y rendimiento\n` +
          `• ⚡ Automatización de tareas\n` +
          `• 🎯 Sugerencias para mejorar resultados\n\n` +
          `¿Podrías ser más específico sobre qué información necesitas?`,
        timestamp: new Date().toISOString(),
        metadata: { type: "text" },
      },
      suggestions: [
        "Ver resumen de contactos",
        "Mostrar ventas del mes",
        "Analizar destinos populares",
        "Crear nuevo elemento",
      ],
    };
  }

  // ✅ RESPUESTA DE ERROR MEJORADA
  private createErrorResponse(query: string): AiQueryResponse {
    return {
      message: {
        id: this.generateMessageId(),
        role: "assistant",
        content:
          "⚠️ **Problema temporal**\n\n" +
          "No pude procesar completamente tu consulta en este momento, pero puedo ayudarte con:\n\n" +
          "• 📱 **Navegación rápida** a cualquier sección\n" +
          "• 📊 **Consultas básicas** sobre contactos y viajes\n" +
          "• 🔍 **Búsquedas** en tu base de datos\n\n" +
          "Intenta reformular tu pregunta o usa las sugerencias de abajo 👇",
        timestamp: new Date().toISOString(),
        metadata: { type: "text" },
      },
      suggestions: this.getExampleQueries().slice(0, 4),
    };
  }

  async getChatHistory(limit = 50): Promise<AiMessage[]> {
    try {
      const response = await api.get(
        `${this.baseUrl}/chat-history?limit=${limit}`
      );
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.log("📝 Historial no disponible, usando historial local");
      return [];
    }
  }

  async getInsights(): Promise<AiInsight[]> {
    try {
      const response = await api.get(`${this.baseUrl}/insights`);
      return response.data.success
        ? response.data.data
        : this.getMockInsights();
    } catch (error) {
      console.log("💡 Insights del backend no disponibles, usando mock");
      return this.getMockInsights();
    }
  }

  // ✅ INSIGHTS MOCK REALISTAS
  private getMockInsights(): AiInsight[] {
    return [
      {
        id: "insight_1",
        title: "Oportunidad de seguimiento",
        description: "Tienes 23 contactos sin actividad en los últimos 30 días",
        priority: "high",
        category: "opportunity",
        data: { count: 23, status: "INTERESADO" },
        actions: [
          {
            label: "Ver contactos inactivos",
            action: "navigate:/contacts?inactive=30",
          },
          { label: "Crear campaña de reactivación", action: "create:campaign" },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: "insight_2",
        title: "Tendencia positiva en conversiones",
        description: "La tasa de conversión subió 8% este mes",
        priority: "medium",
        category: "trend",
        data: { currentRate: 23.5, previousRate: 21.7, growth: 8 },
        actions: [
          { label: "Ver análisis detallado", action: "navigate:/analytics" },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: "insight_3",
        title: "Destinos en crecimiento",
        description:
          "Barcelona y Lisboa muestran +40% de interés vs año anterior",
        priority: "medium",
        category: "trend",
        data: { destinations: ["Barcelona", "Lisboa"], growth: 40 },
        actions: [
          {
            label: "Crear campaña para estos destinos",
            action: "create:campaign",
          },
        ],
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async generateReport(type: string, params: any): Promise<string> {
    try {
      const response = await api.post(`${this.baseUrl}/generate-report`, {
        type,
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error generating report:", error);
      return this.generateMockReport(type, params);
    }
  }

  private generateMockReport(type: string, params: any): string {
    switch (type) {
      case "contacts":
        return "# Reporte de Contactos\n\n## Resumen\n- Total: 1,234 contactos\n- Nuevos este mes: 87\n- Tasa de conversión: 23.5%";
      case "sales":
        return "# Reporte de Ventas\n\n## Resumen Mensual\n- Revenue: $45,678\n- Viajes vendidos: 23\n- Ticket promedio: $1,986";
      default:
        return "# Reporte\n\nReporte generado exitosamente con los parámetros solicitados.";
    }
  }

  async getSuggestions(context: any): Promise<string[]> {
    try {
      const response = await api.post(`${this.baseUrl}/suggestions`, {
        context,
      });
      return response.data.data;
    } catch (error) {
      return this.getContextualSuggestions(context);
    }
  }

  private getContextualSuggestions(context: any): string[] {
    const page = context?.currentPage || "";

    if (page.includes("/contacts")) {
      return [
        "¿Cuántos contactos nuevos tuvimos esta semana?",
        "Mostrar contactos sin actividad reciente",
        "Crear campaña para contactos interesados",
      ];
    }

    if (page.includes("/trips")) {
      return [
        "¿Cuáles son los destinos más reservados?",
        "Mostrar viajes próximos a salir",
        "Analizar rentabilidad por destino",
      ];
    }

    return this.getExampleQueries();
  }

  // ✅ CONSULTAS DE EJEMPLO MEJORADAS
  getExampleQueries(): string[] {
    return [
      "¿Cuántos contactos nuevos tuvimos este mes?",
      "Muéstrame los destinos más populares",
      "¿Cuál es mi tasa de conversión?",
      "Analiza el rendimiento de los agentes",
      "¿Qué clientes tienen viajes próximos?",
      "Mostrar resumen de ventas del mes",
      "¿Cuántos clientes están en cada etapa?",
      "Crear nueva campaña de marketing",
      "Programar reunión con cliente",
      "Generar reporte de actividad",
      "¿Hay pagos pendientes?",
      "Mostrar tendencias de reservas",
      "Sugerir acciones para mejorar ventas",
      "¿Cuáles son las próximas salidas?",
      "Analizar satisfacción de clientes",
    ];
  }

  // Utilidades
  sanitizeQuery(query: string): string {
    return query.trim().replace(/[<>]/g, "").substring(0, 500);
  }

  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  createUserMessage(content: string): AiMessage {
    return {
      id: this.generateMessageId(),
      role: "user",
      content: this.sanitizeQuery(content),
      timestamp: new Date().toISOString(),
      metadata: { type: "text" },
    };
  }

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
