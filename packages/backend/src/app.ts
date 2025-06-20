import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { errorMiddleware } from "./middlewares/error.middleware";
import { loggerMiddleware } from "./middlewares/logger.middleware";

// Import all routes
import aiRoutes from "./routes/ai.routes";
import contactRoutes from "./routes/contact.routes";
import tripRoutes from "./routes/trip.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import calendarRoutes from "./routes/calendar.routes";
import automationRoutes from "./routes/automation.routes";
import campaignRoutes from "./routes/campaign.routes";
import emailRoutes from "./routes/email.routes";

const app: Application = express();

// Security middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration - PERMITIR TODOS LOS ORÍGENES PARA DESARROLLO
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como archivos locales)
      if (!origin) return callback(null, true);

      // Lista de orígenes permitidos
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "file://", // Para archivos locales
        ...config.cors.origin,
      ];

      // En desarrollo, permitir cualquier localhost
      if (
        config.isDevelopment &&
        (origin.startsWith("http://localhost") ||
          origin.startsWith("http://127.0.0.1") ||
          origin.startsWith("file://"))
      ) {
        return callback(null, true);
      }

      // Verificar si el origin está en la lista permitida
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`⚠️ CORS: Origin not allowed: ${origin}`);
        callback(null, true); // En desarrollo, permitir todo
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

// Middleware adicional para manejar preflight requests
app.use((req, res, next) => {
  // Agregar headers CORS manualmente para asegurar compatibilidad
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );

  // Manejar preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting - Solo para producción
if (config.isProduction) {
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", limiter);
} else {
  console.log("⚠️ Rate limiting disabled in development mode");
}

// Request logging
app.use(loggerMiddleware);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Bukialo CRM API",
    version: "1.0.0",
    description: "API for travel agency CRM with AI integration",
    status: "active",
    timestamp: new Date().toISOString(),
    environment: config.env,
    cors: "enabled for development",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    cors: "working",
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "Bukialo CRM API",
    version: "1.0.0",
    description: "API for travel agency CRM with AI integration",
    endpoints: {
      dashboard: "/api/dashboard",
      contacts: "/api/contacts",
      trips: "/api/trips",
      campaigns: "/api/campaigns",
      ai: "/api/ai",
      emails: "/api/emails",
      calendar: "/api/calendar",
      automations: "/api/automations",
    },
    timestamp: new Date().toISOString(),
    cors: {
      enabled: true,
      allowedOrigins: config.isDevelopment
        ? "all localhost origins"
        : config.cors.origin,
      allowCredentials: true,
    },
  });
});

// Mount API routes with explicit logging
console.log("🔗 Mounting API routes...");

// Montar rutas AI
app.use(
  "/api/ai",
  (req, res, next) => {
    console.log(
      `🤖 AI Route: ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || "no-origin"}`
    );
    next();
  },
  aiRoutes
);

// Montar rutas de contactos
app.use(
  "/api/contacts",
  (req, res, next) => {
    console.log(
      `👥 Contacts Route: ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || "no-origin"}`
    );
    next();
  },
  contactRoutes
);

// Montar rutas de dashboard
app.use(
  "/api/dashboard",
  (req, res, next) => {
    console.log(`📊 Dashboard Route: ${req.method} ${req.originalUrl}`);
    next();
  },
  dashboardRoutes
);

app.use(
  "/api/trips",
  (req, res, next) => {
    console.log(`✈️ Trips Route: ${req.method} ${req.originalUrl}`);
    next();
  },
  tripRoutes
);

app.use(
  "/api/emails",
  (req, res, next) => {
    console.log(`📧 Email Route: ${req.method} ${req.originalUrl}`);
    next();
  },
  emailRoutes
);

app.use(
  "/api/calendar",
  (req, res, next) => {
    console.log(`📅 Calendar Route: ${req.method} ${req.originalUrl}`);
    next();
  },
  calendarRoutes
);

app.use(
  "/api/automations",
  (req, res, next) => {
    console.log(`🤖 Automation Route: ${req.method} ${req.originalUrl}`);
    next();
  },
  automationRoutes
);

app.use(
  "/api/campaigns",
  (req, res, next) => {
    console.log(`📣 Campaign Route: ${req.method} ${req.originalUrl}`);
    next();
  },
  campaignRoutes
);

console.log("✅ All routes mounted successfully");

// 404 handler
app.use((req, res) => {
  console.log(
    `❌ 404 - Route not found: ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || "no-origin"}`
  );
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      "GET /api",
      "GET /api/ai",
      "POST /api/ai/query",
      "GET /api/ai/chat-history",
      "GET /api/contacts",
      "GET /api/trips",
      "GET /api/dashboard",
      "GET /api/calendar",
      "GET /api/emails",
      "GET /api/automations",
      "GET /api/campaigns",
    ],
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
