import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middlewares/error.middleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Schema de validación para configuraciones
const settingSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
  description: z.string().optional(),
});

// GET /api/settings - Obtener todas las configuraciones
router.get(
  "/",
  // CORREGIDO: Agregar underscore para parámetro no usado
  asyncHandler(async (_req, res): Promise<void> => {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    res.json({
      success: true,
      data: settings.reduce((acc, setting) => {
        acc[setting.key] = {
          value: setting.value,
          description: setting.description,
          updatedAt: setting.updatedAt,
        };
        return acc;
      }, {} as any),
    });
  })
);

// GET /api/settings/:key - Obtener configuración específica
router.get(
  "/:key",
  // CORREGIDO: Arreglar tipos de retorno y parámetros
  asyncHandler(async (req, res): Promise<void> => {
    const { key } = req.params;

    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      res.status(404).json({
        success: false,
        error: "Setting not found",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
        updatedAt: setting.updatedAt,
      },
    });
  })
);

// PUT /api/settings/:key - Actualizar configuración
router.put(
  "/:key",
  authorize("ADMIN", "MANAGER"),
  validateBody(
    z.object({
      value: z.any(),
      description: z.string().optional(),
    })
  ),
  asyncHandler(async (req, res): Promise<void> => {
    const { key } = req.params;
    const { value, description } = req.body;

    // CORREGIDO: Validar que key existe
    if (!key) {
      res.status(400).json({
        success: false,
        error: "Key parameter is required",
      });
      return;
    }

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        // CORREGIDO: Casting explícito para value
        value: value as any,
        description,
        updatedById: req.user!.id,
      },
      create: {
        key,
        // CORREGIDO: Casting explícito para value
        value: value as any,
        description,
        updatedById: req.user!.id,
      },
    });

    res.json({
      success: true,
      data: setting,
      message: "Setting updated successfully",
    });
  })
);

// POST /api/settings - Crear nueva configuración
router.post(
  "/",
  authorize("ADMIN"),
  validateBody(settingSchema),
  // CORREGIDO: Arreglar tipos de retorno
  asyncHandler(async (req, res): Promise<void> => {
    const { key, value, description } = req.body;

    const setting = await prisma.systemSetting.create({
      data: {
        key,
        // CORREGIDO: Casting explícito para value
        value: value as any,
        description,
        updatedById: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: setting,
      message: "Setting created successfully",
    });
  })
);

// DELETE /api/settings/:key - Eliminar configuración
router.delete(
  "/:key",
  authorize("ADMIN"),
  // CORREGIDO: Agregar underscore para parámetro no usado y arreglar tipos
  asyncHandler(async (req, res): Promise<void> => {
    const { key } = req.params;

    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      res.status(404).json({
        success: false,
        error: "Setting not found",
      });
      return;
    }

    await prisma.systemSetting.delete({
      where: { key },
    });

    res.json({
      success: true,
      message: "Setting deleted successfully",
    });
  })
);

// GET /api/settings/categories/all - Obtener configuraciones por categorías
router.get(
  "/categories/all",
  // CORREGIDO: Agregar underscore para parámetro no usado
  asyncHandler(async (_req, res): Promise<void> => {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    // Agrupar configuraciones por categoría (basado en prefijo de la key)
    const categories = {
      general: [],
      email: [],
      ai: [],
      notifications: [],
      security: [],
      integrations: [],
    } as any;

    settings.forEach((setting) => {
      const key = setting.key;
      if (key.startsWith("email_")) {
        categories.email.push(setting);
      } else if (key.startsWith("ai_")) {
        categories.ai.push(setting);
      } else if (key.startsWith("notification_")) {
        categories.notifications.push(setting);
      } else if (key.startsWith("security_")) {
        categories.security.push(setting);
      } else if (key.startsWith("integration_")) {
        categories.integrations.push(setting);
      } else {
        categories.general.push(setting);
      }
    });

    res.json({
      success: true,
      data: categories,
    });
  })
);

// GET /api/settings/defaults - Obtener configuraciones por defecto
router.get(
  "/defaults/all",
  // CORREGIDO: Agregar underscore para parámetro no usado
  asyncHandler(async (_req, res): Promise<void> => {
    const defaultSettings = {
      // Configuraciones generales
      general: {
        company_name: {
          value: "Bukialo CRM",
          description: "Nombre de la empresa",
          type: "text",
        },
        default_timezone: {
          value: "America/Argentina/Buenos_Aires",
          description: "Zona horaria por defecto",
          type: "select",
          options: [
            "America/Argentina/Buenos_Aires",
            "America/New_York",
            "Europe/Madrid",
            "UTC",
          ],
        },
        currency: {
          value: "USD",
          description: "Moneda por defecto",
          type: "select",
          options: ["USD", "EUR", "ARS"],
        },
        language: {
          value: "es",
          description: "Idioma por defecto",
          type: "select",
          options: [
            { value: "es", label: "Español" },
            { value: "en", label: "English" },
          ],
        },
      },

      // Configuraciones de email
      email: {
        email_signature: {
          value: "Saludos cordiales,\nEquipo Bukialo CRM",
          description: "Firma de email por defecto",
          type: "textarea",
        },
        auto_send_welcome: {
          value: true,
          description: "Enviar email de bienvenida automáticamente",
          type: "boolean",
        },
        max_daily_emails: {
          value: 1000,
          description: "Máximo de emails por día",
          type: "number",
        },
      },

      // Configuraciones de IA
      ai: {
        ai_enabled: {
          value: true,
          description: "Habilitar funciones de IA",
          type: "boolean",
        },
        ai_auto_suggestions: {
          value: true,
          description: "Sugerencias automáticas de IA",
          type: "boolean",
        },
        ai_personalization: {
          value: false,
          description: "Personalización automática con IA",
          type: "boolean",
        },
      },

      // Configuraciones de notificaciones
      notifications: {
        notification_email: {
          value: true,
          description: "Notificaciones por email",
          type: "boolean",
        },
        notification_browser: {
          value: true,
          description: "Notificaciones del navegador",
          type: "boolean",
        },
        daily_summary: {
          value: true,
          description: "Resumen diario",
          type: "boolean",
        },
      },

      // Configuraciones de seguridad
      security: {
        session_timeout: {
          value: 480,
          description: "Tiempo de sesión (minutos)",
          type: "number",
        },
        password_policy: {
          value: "medium",
          description: "Política de contraseñas",
          type: "select",
          options: ["basic", "medium", "strict"],
        },
        two_factor_auth: {
          value: false,
          description: "Autenticación de dos factores",
          type: "boolean",
        },
      },

      // Integraciones
      integrations: {
        integration_whatsapp: {
          value: false,
          description: "Integración con WhatsApp",
          type: "boolean",
        },
        integration_google_calendar: {
          value: false,
          description: "Integración con Google Calendar",
          type: "boolean",
        },
        integration_stripe: {
          value: false,
          description: "Integración con Stripe",
          type: "boolean",
        },
      },
    };

    res.json({
      success: true,
      data: defaultSettings,
    });
  })
);

// POST /api/settings/bulk - Actualización masiva de configuraciones
router.post(
  "/bulk",
  authorize("ADMIN", "MANAGER"),
  validateBody(
    z.object({
      settings: z.record(z.any()),
    })
  ),
  asyncHandler(async (req, res): Promise<void> => {
    const { settings } = req.body;
    const results = [];

    for (const [key, value] of Object.entries(settings)) {
      try {
        const setting = await prisma.systemSetting.upsert({
          where: { key },
          update: {
            // CORREGIDO: Casting explícito para value
            value: value as any,
            updatedById: req.user!.id,
          },
          create: {
            key,
            // CORREGIDO: Casting explícito para value
            value: value as any,
            updatedById: req.user!.id,
          },
        });

        results.push({ key, success: true, setting });
      } catch (error: any) {
        results.push({ key, success: false, error: error.message });
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    res.json({
      success: true,
      data: results,
      message: `Bulk update completed: ${successful} successful, ${failed} failed`,
    });
  })
);

export default router;
