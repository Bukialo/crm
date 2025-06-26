import { z } from "zod";

// Environment variables schema con valores por defecto más permisivos
const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("5000"),

  // Database
  DATABASE_URL: z
    .string()
    .default(
      "postgresql://bukialo_user:bukialo_pass@localhost:5432/bukialo_crm"
    ),

  // Redis
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().default("6379"),
  REDIS_PASSWORD: z.string().optional(),

  // Firebase - Hacer opcional en desarrollo
  FIREBASE_PROJECT_ID: z.string().default("bukialo-crm-dev"),
  FIREBASE_PRIVATE_KEY: z
    .string()
    .default(
      "-----BEGIN PRIVATE KEY-----\nDEV_KEY\n-----END PRIVATE KEY-----\n"
    ),
  FIREBASE_CLIENT_EMAIL: z
    .string()
    .default("firebase-adminsdk@bukialo-crm-dev.iam.gserviceaccount.com"),

  // JWT
  JWT_SECRET: z.string().default("dev_jwt_secret_change_in_production"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // Google Gemini - Hacer opcional
  GEMINI_API_KEY: z.string().default("dev_gemini_key"),
  GEMINI_MODEL: z.string().default("gemini-pro"),

  // Email - Hacer opcional en desarrollo
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.string().default("587"),
  SMTP_SECURE: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  SMTP_USER: z.string().default("dev@bukialo.com"),
  SMTP_PASS: z.string().default("dev_password"),
  EMAIL_FROM: z.string().default("Bukialo CRM <noreply@bukialo.com>"),

  // API Rate Limiting
  API_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"),
  API_RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default("1000"), // Aumentado para desarrollo

  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default("10485760"),
  UPLOAD_DIR: z.string().default("./uploads"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("debug"), // Debug por defecto en desarrollo
  LOG_FILE_PATH: z.string().default("./logs"),

  // CORS - Más permisivo
  FRONTEND_URL: z
    .string()
    .default(
      "http://localhost:3000,http://localhost:5173,http://localhost:8080"
    ),

  // Sentry
  SENTRY_DSN: z.string().optional(),
});

// Parse and validate environment variables con manejo de errores mejorado
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.warn("⚠️ Some environment variables are missing, using defaults:");
  console.warn(JSON.stringify(parsedEnv.error.format(), null, 2));

  // En desarrollo, continuar con valores por defecto
  if (process.env.NODE_ENV !== "production") {
    console.log("🔄 Continuing with default values for development...");
  } else {
    console.error("❌ Invalid environment variables in production:");
    console.error(parsedEnv.error.format());
    process.exit(1);
  }
}

const env = parsedEnv.success ? parsedEnv.data : envSchema.parse({});

// Exported configuration object
export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),

  database: {
    url: env.DATABASE_URL,
  },

  redis: {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT, 10),
    password: env.REDIS_PASSWORD,
  },

  firebase: {
    projectId: env.FIREBASE_PROJECT_ID,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },

  gemini: {
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL,
  },

  email: {
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT, 10),
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    from: env.EMAIL_FROM,
  },

  rateLimit: {
    windowMs: env.API_RATE_LIMIT_WINDOW_MS,
    maxRequests: env.API_RATE_LIMIT_MAX_REQUESTS,
  },

  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    uploadDir: env.UPLOAD_DIR,
  },

  logging: {
    level: env.LOG_LEVEL,
    filePath: env.LOG_FILE_PATH,
  },

  cors: {
    origin: env.FRONTEND_URL.split(",").map((url) => url.trim()),
  },

  sentry: {
    dsn: env.SENTRY_DSN,
  },

  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",

  // Configuraciones adicionales para desarrollo
  features: {
    enableCors: true,
    enableRateLimit: env.NODE_ENV === "production",
    enableAuth: true,
    enableLogging: true,
    enableBypassAuth: env.NODE_ENV === "development", // Solo en desarrollo
  },

  // URLs y endpoints
  urls: {
    frontend: env.FRONTEND_URL.split(",")[0], // Primera URL como principal
    api: `http://localhost:${parseInt(env.PORT, 10)}`,
  },
} as const;

export type Config = typeof config;

// Log configuration on startup
if (config.isDevelopment) {
  console.log("🔧 Configuration loaded:");
  console.log(`   Environment: ${config.env}`);
  console.log(`   Port: ${config.port}`);
  console.log(
    `   Database: ${config.database.url ? "✅ Configured" : "❌ Missing"}`
  );
  console.log(
    `   Firebase: ${config.firebase.projectId ? "✅ Configured" : "❌ Missing"}`
  );
  console.log(
    `   Gemini AI: ${config.gemini.apiKey && config.gemini.apiKey !== "dev_gemini_key" ? "✅ Configured" : "⚠️ Using default"}`
  );
  console.log(`   CORS Origins: ${config.cors.origin.join(", ")}`);
  console.log(
    `   Rate Limiting: ${config.features.enableRateLimit ? "✅ Enabled" : "⚠️ Disabled"}`
  );
}
