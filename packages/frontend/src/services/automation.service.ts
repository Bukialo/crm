import api from "../lib/axios";

export interface Automation {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  triggerType: AutomationTriggerType;
  triggerConditions: Record<string, any>;
  actions: AutomationAction[];
  executionCount?: number;
  successRate?: number;
  createdAt: string;
  updatedAt: string;
  executions: AutomationExecution[];
}

export interface AutomationAction {
  id: string;
  type: AutomationActionType;
  parameters: Record<string, any>;
  delayMinutes: number;
  order: number;
}

export interface AutomationExecution {
  id: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export type AutomationTriggerType =
  | "CONTACT_CREATED"
  | "TRIP_QUOTE_REQUESTED"
  | "PAYMENT_OVERDUE"
  | "TRIP_COMPLETED"
  | "NO_ACTIVITY_30_DAYS"
  | "SEASONAL_OPPORTUNITY"
  | "BIRTHDAY"
  | "CUSTOM";

export type AutomationActionType =
  | "SEND_EMAIL"
  | "CREATE_TASK"
  | "SCHEDULE_CALL"
  | "ADD_TAG"
  | "UPDATE_STATUS"
  | "GENERATE_QUOTE"
  | "ASSIGN_AGENT"
  | "SEND_WHATSAPP";

export interface CreateAutomationDto {
  name: string;
  description?: string;
  triggerType: AutomationTriggerType;
  triggerConditions: Record<string, any>;
  actions: Array<{
    type: AutomationActionType;
    parameters: Record<string, any>;
    delayMinutes?: number;
    order: number;
  }>;
}

export interface AutomationFilters {
  isActive?: boolean;
  triggerType?: AutomationTriggerType;
  page?: number;
  pageSize?: number;
}

export interface AutomationStats {
  totalAutomations: number;
  activeAutomations: number;
  totalExecutions: number;
  recentExecutions: number;
  successRate: number;
  recentActivity: Array<{
    id: string;
    automationName: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    error?: string;
  }>;
}

export interface TriggerTemplate {
  type: AutomationTriggerType;
  name: string;
  description: string;
  icon: string;
  conditions: Array<{
    field: string;
    label: string;
    type:
      | "text"
      | "number"
      | "select"
      | "date"
      | "datetime"
      | "array"
      | "object";
    options?: string[];
    default?: any;
    required?: boolean;
  }>;
}

export interface ActionTemplate {
  type: AutomationActionType;
  name: string;
  description: string;
  icon: string;
  parameters: Array<{
    field: string;
    label: string;
    type:
      | "text"
      | "number"
      | "select"
      | "date"
      | "datetime"
      | "textarea"
      | "array"
      | "object";
    options?: string[];
    default?: any;
    required?: boolean;
  }>;
}

export interface ExecutionResult {
  automationId: string;
  success: boolean;
  actionsExecuted: number;
  error?: string;
  duration: number;
}

class AutomationService {
  async getAutomations(filters: AutomationFilters = {}): Promise<Automation[]> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`/automations?${params.toString()}`);
    return response.data.data;
  }

  async getAutomation(id: string): Promise<Automation> {
    const response = await api.get(`/automations/${id}`);
    return response.data.data;
  }

  async createAutomation(data: CreateAutomationDto): Promise<Automation> {
    const response = await api.post("/automations", data);
    return response.data.data;
  }

  async updateAutomation(
    id: string,
    data: Partial<CreateAutomationDto>
  ): Promise<Automation> {
    const response = await api.put(`/automations/${id}`, data);
    return response.data.data;
  }

  async deleteAutomation(id: string): Promise<void> {
    await api.delete(`/automations/${id}`);
  }

  async toggleAutomation(id: string): Promise<Automation> {
    const response = await api.patch(`/automations/${id}/toggle`);
    return response.data.data;
  }

  async executeAutomation(
    id: string,
    triggerData: Record<string, any>
  ): Promise<ExecutionResult> {
    const response = await api.post(`/automations/${id}/execute`, {
      triggerData,
    });
    return response.data.data;
  }

  async getStats(): Promise<AutomationStats> {
    const response = await api.get("/automations/stats");
    return response.data.data;
  }

  async getTriggerTemplates(): Promise<TriggerTemplate[]> {
    const response = await api.get("/automations/trigger-templates");
    return response.data.data;
  }

  async getActionTemplates(): Promise<ActionTemplate[]> {
    const response = await api.get("/automations/action-templates");
    return response.data.data;
  }

  // Helper methods para UI
  getTriggerTypeConfig() {
    return {
      CONTACT_CREATED: {
        label: "Contacto Creado",
        color: "bg-blue-500",
        lightColor: "bg-blue-500/20",
        textColor: "text-blue-300",
        icon: "UserPlus",
      },
      TRIP_QUOTE_REQUESTED: {
        label: "Cotización Solicitada",
        color: "bg-purple-500",
        lightColor: "bg-purple-500/20",
        textColor: "text-purple-300",
        icon: "FileText",
      },
      PAYMENT_OVERDUE: {
        label: "Pago Vencido",
        color: "bg-red-500",
        lightColor: "bg-red-500/20",
        textColor: "text-red-300",
        icon: "AlertTriangle",
      },
      TRIP_COMPLETED: {
        label: "Viaje Completado",
        color: "bg-green-500",
        lightColor: "bg-green-500/20",
        textColor: "text-green-300",
        icon: "CheckCircle",
      },
      NO_ACTIVITY_30_DAYS: {
        label: "Sin Actividad",
        color: "bg-orange-500",
        lightColor: "bg-orange-500/20",
        textColor: "text-orange-300",
        icon: "Clock",
      },
      SEASONAL_OPPORTUNITY: {
        label: "Oportunidad Estacional",
        color: "bg-amber-500",
        lightColor: "bg-amber-500/20",
        textColor: "text-amber-300",
        icon: "Calendar",
      },
      BIRTHDAY: {
        label: "Cumpleaños",
        color: "bg-pink-500",
        lightColor: "bg-pink-500/20",
        textColor: "text-pink-300",
        icon: "Gift",
      },
      CUSTOM: {
        label: "Personalizado",
        color: "bg-gray-500",
        lightColor: "bg-gray-500/20",
        textColor: "text-gray-300",
        icon: "Settings",
      },
    };
  }

  getActionTypeConfig() {
    return {
      SEND_EMAIL: {
        label: "Enviar Email",
        color: "bg-blue-500",
        lightColor: "bg-blue-500/20",
        textColor: "text-blue-300",
        icon: "Mail",
      },
      CREATE_TASK: {
        label: "Crear Tarea",
        color: "bg-green-500",
        lightColor: "bg-green-500/20",
        textColor: "text-green-300",
        icon: "CheckSquare",
      },
      SCHEDULE_CALL: {
        label: "Programar Llamada",
        color: "bg-purple-500",
        lightColor: "bg-purple-500/20",
        textColor: "text-purple-300",
        icon: "Phone",
      },
      ADD_TAG: {
        label: "Agregar Etiqueta",
        color: "bg-orange-500",
        lightColor: "bg-orange-500/20",
        textColor: "text-orange-300",
        icon: "Tag",
      },
      UPDATE_STATUS: {
        label: "Cambiar Estado",
        color: "bg-amber-500",
        lightColor: "bg-amber-500/20",
        textColor: "text-amber-300",
        icon: "ArrowRight",
      },
      GENERATE_QUOTE: {
        label: "Generar Cotización",
        color: "bg-cyan-500",
        lightColor: "bg-cyan-500/20",
        textColor: "text-cyan-300",
        icon: "FileText",
      },
      ASSIGN_AGENT: {
        label: "Asignar Agente",
        color: "bg-indigo-500",
        lightColor: "bg-indigo-500/20",
        textColor: "text-indigo-300",
        icon: "UserCheck",
      },
      SEND_WHATSAPP: {
        label: "Enviar WhatsApp",
        color: "bg-green-600",
        lightColor: "bg-green-600/20",
        textColor: "text-green-300",
        icon: "MessageCircle",
      },
    };
  }

  getExecutionStatusConfig() {
    return {
      running: {
        label: "Ejecutando",
        color: "bg-blue-500",
        textColor: "text-blue-300",
        icon: "PlayCircle",
      },
      completed: {
        label: "Completado",
        color: "bg-green-500",
        textColor: "text-green-300",
        icon: "CheckCircle",
      },
      failed: {
        label: "Fallido",
        color: "bg-red-500",
        textColor: "text-red-300",
        icon: "XCircle",
      },
    };
  }

  // Validar estructura de automatización
  validateAutomation(automation: Partial<CreateAutomationDto>): string[] {
    const errors: string[] = [];

    if (!automation.name?.trim()) {
      errors.push("El nombre es requerido");
    }

    if (!automation.triggerType) {
      errors.push("El tipo de trigger es requerido");
    }

    if (!automation.actions || automation.actions.length === 0) {
      errors.push("Al menos una acción es requerida");
    }

    if (automation.actions) {
      automation.actions.forEach((action, index) => {
        if (!action.type) {
          errors.push(`Acción ${index + 1}: Tipo de acción requerido`);
        }
        if (action.order < 1) {
          errors.push(`Acción ${index + 1}: Orden debe ser mayor a 0`);
        }
      });
    }

    return errors;
  }

  // Generar ejemplo de automatización
  getExampleAutomations(): Partial<CreateAutomationDto>[] {
    return [
      {
        name: "Bienvenida a nuevos contactos",
        description:
          "Envía email de bienvenida cuando se crea un contacto interesado",
        triggerType: "CONTACT_CREATED",
        triggerConditions: {
          status: "INTERESADO",
        },
        actions: [
          {
            type: "SEND_EMAIL",
            parameters: {
              templateId: "welcome-template",
            },
            order: 1,
          },
          {
            type: "CREATE_TASK",
            parameters: {
              title: "Llamar a nuevo contacto",
              priority: "HIGH",
              assignedToId: "current-user",
            },
            delayMinutes: 1440, // 24 horas después
            order: 2,
          },
        ],
      },
      {
        name: "Seguimiento sin actividad",
        description: "Contacta clientes sin actividad por 30 días",
        triggerType: "NO_ACTIVITY_30_DAYS",
        triggerConditions: {
          days: 30,
          status: "INTERESADO",
        },
        actions: [
          {
            type: "ADD_TAG",
            parameters: {
              tags: ["Sin actividad"],
            },
            order: 1,
          },
          {
            type: "SEND_EMAIL",
            parameters: {
              templateId: "reactivation-template",
            },
            order: 2,
          },
        ],
      },
      {
        name: "Post-viaje feedback",
        description: "Solicita feedback después de completar un viaje",
        triggerType: "TRIP_COMPLETED",
        triggerConditions: {
          daysAfterReturn: 3,
        },
        actions: [
          {
            type: "SEND_EMAIL",
            parameters: {
              templateId: "feedback-template",
            },
            order: 1,
          },
          {
            type: "SCHEDULE_CALL",
            parameters: {
              title: "Seguimiento post-viaje",
              duration: 15,
            },
            delayMinutes: 10080, // 7 días después
            order: 2,
          },
        ],
      },
    ];
  }
}

export const automationService = new AutomationService();
