import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const querySchema = z.object({
  body: z.object({
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
  }),
});

// Sugerencias contextuales endpoint público
router.get("/suggestions", (req, res) => {
  const contextualSuggestions = [
    "¿Cuántos contactos nuevos tuvimos este mes?",
    "Muéstrame los destinos más populares",
    "¿Cuál es mi tasa de conversión de contactos?",
    "¿Qué viajes tengo programados para esta semana?",
    "Analiza el rendimiento de ventas del último trimestre",
    "¿Cuáles son las tendencias de reservas actuales?",
    "Sugiere acciones para mejorar las ventas",
    "¿Qué contactos necesitan seguimiento urgente?",
    "Muestra las estadísticas del dashboard",
    "¿Cómo van los ingresos comparado con el mes anterior?",
  ];

  // Seleccionar 5 sugerencias aleatorias
  const randomSuggestions = contextualSuggestions
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  res.json({
    success: true,
    data: randomSuggestions,
    message: "Contextual suggestions generated",
    authenticated: false,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint para obtener el estado del servicio AI
router.get("/status", (req, res) => {
  res.json({
    success: true,
    data: {
      service: "Bukialo AI Assistant",
      status: "operational",
      version: "1.0.0",
      features: {
        naturalLanguageQueries: true,
        dataAnalysis: true,
        insights: true,
        contextualSuggestions: true,
        chatHistory: true,
        reportGeneration: false, // Requiere autenticación
      },
      endpoints: {
        public: [
          "GET /api/ai",
          "GET /api/ai/test",
          "GET /api/ai/status",
          "GET /api/ai/insights",
          "GET /api/ai/suggestions",
          "GET /api/ai/chat-history",
          "POST /api/ai/query",
        ],
        protected: [
          "POST /api/ai/secure/query",
          "GET /api/ai/secure/insights",
          "GET /api/ai/secure/chat-history",
          "POST /api/ai/secure/suggestions",
          "POST /api/ai/secure/generate-report",
        ],
      },
      authentication: {
        required: false,
        note: "Public endpoints available for testing. Protected endpoints require Firebase authentication.",
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// ENDPOINTS PÚBLICOS (SIN AUTENTICACIÓN)
// ========================================

// Test endpoint público
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "AI service is working",
    timestamp: new Date().toISOString(),
    auth: "not required for this endpoint",
    server: "bukialo-crm",
  });
});

// Info del servicio AI (público)
router.get("/", (req, res) => {
  res.json({
    service: "Bukialo AI Assistant",
    version: "1.0.0",
    status: "active",
    capabilities: [
      "Natural language queries",
      "Data analysis",
      "Travel insights",
      "Contact management assistance",
    ],
    endpoints: {
      test: "GET /api/ai/test (public)",
      query: "POST /api/ai/query (public for testing)",
      chatHistory: "GET /api/ai/chat-history (requires auth)",
      insights: "GET /api/ai/insights (requires auth)",
    },
    timestamp: new Date().toISOString(),
  });
});

// Query endpoint PÚBLICO para testing
router.post("/query", (req, res) => {
  try {
    const { query, context } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Query is required",
      });
    }

    // Simulamos respuesta de IA sin requerir autenticación
    const mockResponses = {
      contactos:
        "Actualmente tienes contactos registrados en el sistema. Para ver detalles específicos, necesitarías autenticarte.",
      viajes:
        "El sistema gestiona viajes en diferentes estados: cotizaciones, reservados, confirmados y completados.",
      ventas:
        "Las métricas de ventas incluyen ingresos mensuales, tasa de conversión y rendimiento por agente.",
      estadísticas:
        "El dashboard muestra estadísticas en tiempo real de contactos, viajes y ingresos.",
      ayuda:
        "Soy tu asistente de IA para Bukialo CRM. Puedo ayudarte con consultas sobre contactos, viajes, ventas y análisis de datos.",
    };

    const lowerQuery = query.toLowerCase();
    let content = "Hola! Soy tu asistente de IA para Bukialo CRM. ";

    // Buscar palabras clave
    for (const [key, response] of Object.entries(mockResponses)) {
      if (lowerQuery.includes(key)) {
        content += response;
        break;
      }
    }

    if (content === "Hola! Soy tu asistente de IA para Bukialo CRM. ") {
      content += `Recibí tu consulta: "${query}". El sistema está funcionando correctamente. Para obtener datos específicos de tu CRM, necesitarás autenticarte.`;
    }

    const response = {
      success: true,
      data: {
        message: {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          role: "assistant",
          content,
          timestamp: new Date().toISOString(),
          metadata: {
            type: "text",
            authenticated: false,
            testMode: true,
          },
        },
        suggestions: [
          "¿Cómo funciona el sistema?",
          "¿Qué puedes hacer?",
          "Ayuda con contactos",
          "Información sobre viajes",
          "Estadísticas del CRM",
        ],
        actions: [
          {
            type: "navigate",
            label: "Ver Dashboard",
            params: { url: "/dashboard" },
          },
          {
            type: "navigate",
            label: "Ver Contactos",
            params: { url: "/contacts" },
          },
        ],
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Error in public AI query:", error);
    res.status(500).json({
      success: false,
      error: "Error procesando la consulta",
      message: error.message,
    });
  }
});

// Chat history público (vacío)
router.get("/chat-history", (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;

  res.json({
    success: true,
    data: [],
    limit,
    message: "Chat history (requires authentication for real data)",
    authenticated: false,
  });
});

// Insights endpoint público (datos de ejemplo)
router.get("/insights", (req, res) => {
  // Datos de ejemplo para insights
  const mockInsights = [
    {
      id: "1",
      title: "Contactos sin actividad reciente",
      description:
        "Tienes varios contactos que no han sido contactados en más de 30 días",
      priority: "high",
      category: "opportunity",
      icon: "UserX",
      value: "15 contactos",
      trend: "+3 desde la semana pasada",
      actions: [
        {
          label: "Ver contactos inactivos",
          action: "/contacts?filter=inactive",
          type: "navigate",
        },
        {
          label: "Crear campaña de seguimiento",
          action: "/campaigns/create?target=inactive",
          type: "navigate",
        },
      ],
    },
    {
      id: "2",
      title: "Viajes próximos esta semana",
      description: "Hay varios viajes programados para los próximos 7 días",
      priority: "medium",
      category: "upcoming",
      icon: "Calendar",
      value: "8 viajes",
      trend: "2 salidas mañana",
      actions: [
        {
          label: "Ver calendario",
          action: "/calendar",
          type: "navigate",
        },
        {
          label: "Revisar preparativos",
          action: "/trips?status=confirmed&departing=week",
          type: "navigate",
        },
      ],
    },
    {
      id: "3",
      title: "Destino en tendencia",
      description:
        "París es el destino más popular este mes con múltiples reservas",
      priority: "low",
      category: "trend",
      icon: "TrendingUp",
      value: "París",
      trend: "12 reservas este mes",
      actions: [
        {
          label: "Ver estadísticas de destinos",
          action: "/dashboard?view=destinations",
          type: "navigate",
        },
      ],
    },
    {
      id: "4",
      title: "Oportunidad de ventas",
      description: "Varios contactos en estado PASAJERO necesitan seguimiento",
      priority: "high",
      category: "sales",
      icon: "DollarSign",
      value: "6 pasajeros",
      trend: "Potencial: $15,000",
      actions: [
        {
          label: "Ver pasajeros pendientes",
          action: "/contacts?status=PASAJERO",
          type: "navigate",
        },
        {
          label: "Crear recordatorios",
          action: "/tasks/create?type=follow-up",
          type: "navigate",
        },
      ],
    },
    {
      id: "5",
      title: "Rendimiento del mes",
      description:
        "Las ventas van bien pero pueden mejorar con más seguimiento",
      priority: "medium",
      category: "performance",
      icon: "BarChart3",
      value: "$45,200",
      trend: "+12% vs mes anterior",
      actions: [
        {
          label: "Ver reporte completo",
          action: "/dashboard?view=performance",
          type: "navigate",
        },
      ],
    },
  ];

  res.json({
    success: true,
    data: mockInsights,
    message: "AI insights generated (demo data)",
    authenticated: false,
    timestamp: new Date().toISOString(),
    generatedAt: new Date().toISOString(),
    refreshIn: "1 hour",
  });
});

// ========================================
// ENDPOINTS PROTEGIDOS (CON AUTENTICACIÓN)
// ========================================

// Endpoints que requieren autenticación
router.use("/secure/*", authenticate);

// Query autenticado (con datos reales)
router.post(
  "/secure/query",
  validateBody(querySchema.shape.body),
  aiController.query
);

// Insights (requiere autenticación)
router.get("/secure/insights", authenticate, aiController.getInsights);

// Chat history autenticado
router.get("/secure/chat-history", authenticate, aiController.getChatHistory);

// Sugerencias contextuales
router.post("/secure/suggestions", authenticate, aiController.getSuggestions);

// Generar reportes
router.post(
  "/secure/generate-report",
  authenticate,
  aiController.generateReport
);

export default router;
