import express, { Application, Request, Response, NextFunction } from "express";
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
import authRoutes from "./routes/auth.routes";

const app: Application = express();

// Security middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Deshabilitado para desarrollo
  })
);

// CONFIGURACIÓN CORS SIMPLIFICADA Y PERMISIVA PARA DESARROLLO
app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, origin?: boolean) => void
    ) {
      // PERMITIR TODOS LOS ORÍGENES EN DESARROLLO
      if (config.isDevelopment) {
        return callback(null, true);
      }

      // En producción, usar lista específica
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        ...config.cors.origin,
      ];

      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`❌ CORS: Origin not allowed: ${origin}`);
        callback(new Error("Not allowed by CORS"));
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
      "Cache-Control",
      "Pragma",
    ],
    exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

// Middleware adicional para manejar preflight requests manualmente
app.options("*", (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma"
  );
  res.status(200).end();
});

// Compression
app.use(compression());

// Body parsing con límites aumentados
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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

// Root endpoint - CORREGIDO: Agregado underscore para req no usado
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "Bukialo CRM API",
    version: "1.0.0",
    description: "API for travel agency CRM with AI integration",
    status: "active",
    timestamp: new Date().toISOString(),
    environment: config.env,
    cors: "enabled for development",
    endpoints: {
      auth: "/api/auth",
      dashboard: "/api/dashboard",
      contacts: "/api/contacts",
      trips: "/api/trips",
      campaigns: "/api/campaigns",
      ai: "/api/ai",
      emails: "/api/emails",
      calendar: "/api/calendar",
      automations: "/api/automations",
    },
  });
});

// Health check endpoint - CORREGIDO: Agregado underscore para req no usado
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    cors: "working",
    memory: process.memoryUsage(),
  });
});

// API info endpoint - CORREGIDO: Agregado underscore para req no usado
app.get("/api", (_req: Request, res: Response) => {
  res.json({
    name: "Bukialo CRM API",
    version: "1.0.0",
    description: "API for travel agency CRM with AI integration",
    endpoints: {
      auth: "/api/auth",
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

// Middleware de logging con tipado correcto - CORREGIDO: Agregado underscore para res no usado
const routeLogger =
  (routeName: string) => (req: Request, _res: Response, next: NextFunction) => {
    console.log(
      `${routeName}: ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || "no-origin"}`
    );
    next();
  };

// Montar rutas de autenticación PRIMERO
app.use("/api/auth", routeLogger("🔐 Auth Route"), authRoutes);

// Montar rutas AI (SIN autenticación para endpoints públicos)
app.use("/api/ai", routeLogger("🤖 AI Route"), aiRoutes);

// Montar rutas de contactos
app.use("/api/contacts", routeLogger("👥 Contacts Route"), contactRoutes);

// Montar rutas de dashboard
app.use("/api/dashboard", routeLogger("📊 Dashboard Route"), dashboardRoutes);

app.use("/api/trips", routeLogger("✈️ Trips Route"), tripRoutes);

app.use("/api/emails", routeLogger("📧 Email Route"), emailRoutes);

app.use("/api/calendar", routeLogger("📅 Calendar Route"), calendarRoutes);

app.use(
  "/api/automations",
  routeLogger("🤖 Automation Route"),
  automationRoutes
);

app.use("/api/campaigns", routeLogger("📣 Campaign Route"), campaignRoutes);

console.log("✅ All routes mounted successfully");

// 404 handler
app.use((req: Request, res: Response) => {
  console.log(
    `❌ 404 - Route not found: ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || "no-origin"}`
  );
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      "GET /api",
      "GET /api/auth",
      "POST /api/auth/register",
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
