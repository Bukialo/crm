import { Request, Response } from "express";
import { AutomationService } from "../services/automation.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { ApiResponse } from "@bukialo/shared";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        firebaseUid: string;
      };
    }
  }
}

const automationService = new AutomationService();

export class AutomationController {
  // Crear automatización
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Usuario no autenticado",
      });
      return;
    }

    const automation = await automationService.create(req.body, req.user.id);

    const response: ApiResponse = {
      success: true,
      data: automation,
      message: "Automation created successfully",
    };

    res.status(201).json(response);
  });

  // Obtener todas las automatizaciones
  findAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Usuario no autenticado",
      });
      return;
    }

    const { isActive, triggerType } = req.query;

    const filters = {
      isActive:
        isActive === "true" ? true : isActive === "false" ? false : undefined,
      triggerType: triggerType as any,
      createdById: req.user.role === "ADMIN" ? undefined : req.user.id,
    };

    const automations = await automationService.findAll(filters);

    const response: ApiResponse = {
      success: true,
      data: automations,
    };

    res.json(response);
  });

  // Obtener automatización por ID
  findById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const automation = await automationService.findById(req.params.id);

      const response: ApiResponse = {
        success: true,
        data: automation,
      };

      res.json(response);
    }
  );

  // Actualizar automatización
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const automation = await automationService.update(req.params.id, req.body);

    const response: ApiResponse = {
      success: true,
      data: automation,
      message: "Automation updated successfully",
    };

    res.json(response);
  });

  // Eliminar automatización
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await automationService.delete(req.params.id);

    const response: ApiResponse = {
      success: true,
      message: "Automation deleted successfully",
    };

    res.json(response);
  });

  // Activar/desactivar automatización
  toggleActive = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const automation = await automationService.toggleActive(req.params.id);

      const response: ApiResponse = {
        success: true,
        data: automation,
        message: `Automation ${automation.isActive ? "activated" : "deactivated"} successfully`,
      };

      res.json(response);
    }
  );

  // Ejecutar automatización manualmente (para testing)
  execute = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { triggerData } = req.body;

    const result = await automationService.executeAutomation(
      req.params.id,
      triggerData
    );

    const response: ApiResponse = {
      success: result.success,
      data: result,
      message: result.success
        ? "Automation executed successfully"
        : "Automation execution failed",
    };

    res.json(response);
  });

  // Obtener estadísticas de automatizaciones
  getStats = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      const userId = req.user.role === "ADMIN" ? undefined : req.user.id;
      const stats = await automationService.getStats(userId);

      const response: ApiResponse = {
        success: true,
        data: stats,
      };

      res.json(response);
    }
  );

  // Obtener templates de triggers disponibles
  getTriggerTemplates = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const templates = [
        {
          type: "CONTACT_CREATED",
          name: "Contacto Creado",
          description: "Se ejecuta cuando se crea un nuevo contacto",
          icon: "UserPlus",
          conditions: [
            {
              field: "status",
              label: "Estado del contacto",
              type: "select",
              options: ["INTERESADO", "PASAJERO", "CLIENTE"],
            },
            {
              field: "source",
              label: "Fuente del contacto",
              type: "select",
              options: ["WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "ADVERTISING"],
            },
            {
              field: "budgetRange",
              label: "Rango de presupuesto",
              type: "select",
              options: ["LOW", "MEDIUM", "HIGH", "LUXURY"],
            },
          ],
        },
        {
          type: "TRIP_QUOTE_REQUESTED",
          name: "Cotización Solicitada",
          description: "Se ejecuta cuando se solicita una cotización de viaje",
          icon: "FileText",
          conditions: [
            {
              field: "destination",
              label: "Destino",
              type: "text",
            },
            {
              field: "budgetMin",
              label: "Presupuesto mínimo",
              type: "number",
            },
            {
              field: "budgetMax",
              label: "Presupuesto máximo",
              type: "number",
            },
          ],
        },
        {
          type: "NO_ACTIVITY_30_DAYS",
          name: "Sin Actividad",
          description:
            "Se ejecuta cuando un contacto no tiene actividad por X días",
          icon: "Clock",
          conditions: [
            {
              field: "days",
              label: "Días sin actividad",
              type: "number",
              default: 30,
            },
            {
              field: "status",
              label: "Estado del contacto",
              type: "select",
              options: ["INTERESADO", "PASAJERO", "CLIENTE"],
            },
          ],
        },
        {
          type: "PAYMENT_OVERDUE",
          name: "Pago Vencido",
          description: "Se ejecuta cuando un pago está vencido",
          icon: "AlertTriangle",
          conditions: [
            {
              field: "daysOverdue",
              label: "Días de vencimiento",
              type: "number",
              default: 1,
            },
            {
              field: "amount",
              label: "Monto mínimo",
              type: "number",
            },
          ],
        },
        {
          type: "TRIP_COMPLETED",
          name: "Viaje Completado",
          description: "Se ejecuta cuando un viaje es completado",
          icon: "CheckCircle",
          conditions: [
            {
              field: "destination",
              label: "Destino",
              type: "text",
            },
            {
              field: "rating",
              label: "Calificación mínima",
              type: "number",
            },
          ],
        },
        {
          type: "BIRTHDAY",
          name: "Cumpleaños",
          description: "Se ejecuta en el cumpleaños del contacto",
          icon: "Gift",
          conditions: [
            {
              field: "daysBefore",
              label: "Días antes del cumpleaños",
              type: "number",
              default: 0,
            },
            {
              field: "status",
              label: "Estado del contacto",
              type: "select",
              options: ["INTERESADO", "PASAJERO", "CLIENTE"],
            },
          ],
        },
      ];

      const response: ApiResponse = {
        success: true,
        data: templates,
      };

      res.json(response);
    }
  );

  // Obtener templates de acciones disponibles
  getActionTemplates = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const templates = [
        {
          type: "SEND_EMAIL",
          name: "Enviar Email",
          description: "Envía un email usando una plantilla",
          icon: "Mail",
          parameters: [
            {
              field: "templateId",
              label: "Plantilla de email",
              type: "select",
              required: true,
            },
            {
              field: "variables",
              label: "Variables personalizadas",
              type: "object",
            },
          ],
        },
        {
          type: "CREATE_TASK",
          name: "Crear Tarea",
          description: "Crea una tarea para un agente",
          icon: "CheckSquare",
          parameters: [
            {
              field: "title",
              label: "Título de la tarea",
              type: "text",
              required: true,
            },
            {
              field: "description",
              label: "Descripción",
              type: "textarea",
            },
            {
              field: "priority",
              label: "Prioridad",
              type: "select",
              options: ["LOW", "MEDIUM", "HIGH", "URGENT"],
              default: "MEDIUM",
            },
            {
              field: "assignedToId",
              label: "Asignar a",
              type: "select",
              required: true,
            },
            {
              field: "dueDate",
              label: "Fecha de vencimiento",
              type: "date",
            },
          ],
        },
        {
          type: "ADD_TAG",
          name: "Agregar Etiqueta",
          description: "Agrega etiquetas al contacto",
          icon: "Tag",
          parameters: [
            {
              field: "tags",
              label: "Etiquetas",
              type: "array",
              required: true,
            },
          ],
        },
        {
          type: "UPDATE_STATUS",
          name: "Cambiar Estado",
          description: "Cambia el estado del contacto",
          icon: "ArrowRight",
          parameters: [
            {
              field: "status",
              label: "Nuevo estado",
              type: "select",
              options: ["INTERESADO", "PASAJERO", "CLIENTE"],
              required: true,
            },
          ],
        },
        {
          type: "ASSIGN_AGENT",
          name: "Asignar Agente",
          description: "Asigna el contacto a un agente",
          icon: "UserCheck",
          parameters: [
            {
              field: "agentId",
              label: "Agente",
              type: "select",
              required: true,
            },
          ],
        },
        {
          type: "SCHEDULE_CALL",
          name: "Programar Llamada",
          description: "Programa una llamada de seguimiento",
          icon: "Phone",
          parameters: [
            {
              field: "title",
              label: "Título de la llamada",
              type: "text",
              required: true,
            },
            {
              field: "scheduledDate",
              label: "Fecha programada",
              type: "datetime",
              required: true,
            },
            {
              field: "duration",
              label: "Duración (minutos)",
              type: "number",
              default: 30,
            },
          ],
        },
      ];

      const response: ApiResponse = {
        success: true,
        data: templates,
      };

      res.json(response);
    }
  );
}

export const automationController = new AutomationController();
