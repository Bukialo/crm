export type AutomationTriggerType =
  | "CONTACT_CREATED"
  | "TRIP_BOOKED"
  | "PAYMENT_RECEIVED"
  | "EMAIL_OPENED"
  | "FORM_SUBMITTED"
  | "DATE_REACHED"
  | "STATUS_CHANGED"
  | "TRIP_QUOTE_REQUESTED"
  | "PAYMENT_OVERDUE"
  | "TRIP_COMPLETED"
  | "NO_ACTIVITY_30_DAYS"
  | "SEASONAL_OPPORTUNITY"
  | "BIRTHDAY"
  | "CUSTOM";

export type AutomationActionType =
  | "SEND_EMAIL"
  | "SEND_SMS"
  | "SEND_WHATSAPP"
  | "UPDATE_CONTACT"
  | "CREATE_TASK"
  | "ADD_TAG"
  | "REMOVE_TAG"
  | "ASSIGN_AGENT"
  | "CHANGE_STATUS"
  | "SCHEDULE_CALL"
  | "UPDATE_STATUS"
  | "GENERATE_QUOTE";

export interface AutomationTrigger {
  type: AutomationTriggerType;
  conditions: Record<string, any>;
  delay?: number; // en minutos
}

export interface AutomationAction {
  id: string;
  type: AutomationActionType;
  parameters: Record<string, any>;
  delayMinutes?: number; // en minutos
  order: number;
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;

  // Campos planos para compatibilidad
  triggerType: AutomationTriggerType;
  triggerConditions: Record<string, any>;

  // También mantenemos el objeto trigger para mayor flexibilidad
  trigger: AutomationTrigger;
  actions: AutomationAction[];

  // Ejecuciones
  executions?: AutomationExecution[];

  createdAt: Date | string;
  updatedAt: Date | string;
  lastExecuted?: Date | string;
  executionCount: number;
  successCount: number;
  failureCount: number;
}

export interface AutomationExecution {
  id: string;
  automationId: string;
  triggeredAt: Date | string;
  completedAt?: Date | string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  triggerData: Record<string, any>;
  executionLog: string[];
  error?: string;
}

export interface AutomationStats {
  totalAutomations: number;
  activeAutomations: number;
  totalExecutions: number;
  successRate: number;
  executionsToday: number;
  executionsThisWeek: number;
  executionsThisMonth: number;
}

export interface AutomationFilters {
  isActive?: boolean;
  triggerType?: AutomationTriggerType;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateAutomationDto {
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  isActive?: boolean;
}

export interface UpdateAutomationDto extends Partial<CreateAutomationDto> {}

export interface ExecuteAutomationDto {
  id: string;
  triggerData: Record<string, any>;
}

// Interfaces para templates
export interface TriggerTemplate {
  type: AutomationTriggerType;
  name: string;
  description: string;
  icon: string;
  conditions: Array<{
    field: string;
    label: string;
    type: "text" | "number" | "select" | "date" | "array";
    required: boolean;
    options?: string[];
    default?: any;
  }>;
}

export interface ActionTemplate {
  type: AutomationActionType;
  name: string;
  description: string;
  icon: string;
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "textarea" | "number" | "select" | "boolean";
    required: boolean;
    options?: string[];
  }>;
}

class AutomationService {
  private baseUrl = "/api/automations";

  // Obtener todas las automatizaciones
  async getAutomations(filters?: AutomationFilters): Promise<Automation[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.isActive !== undefined) {
        queryParams.append("isActive", filters.isActive.toString());
      }
      if (filters?.triggerType) {
        queryParams.append("triggerType", filters.triggerType);
      }
      if (filters?.search) {
        queryParams.append("search", filters.search);
      }

      const response = await fetch(`${this.baseUrl}?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch automations");
      return response.json();
    } catch (error) {
      console.error("Error fetching automations:", error);
      return this.getMockAutomations(filters);
    }
  }

  // Crear nueva automatización
  async createAutomation(data: CreateAutomationDto): Promise<Automation> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create automation");
      return response.json();
    } catch (error) {
      console.error("Error creating automation:", error);
      throw error;
    }
  }

  // Actualizar automatización
  async updateAutomation(
    id: string,
    data: UpdateAutomationDto
  ): Promise<Automation> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update automation");
      return response.json();
    } catch (error) {
      console.error("Error updating automation:", error);
      throw error;
    }
  }

  // Eliminar automatización
  async deleteAutomation(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete automation");
    } catch (error) {
      console.error("Error deleting automation:", error);
      throw error;
    }
  }

  // Ejecutar automatización manualmente
  async executeAutomation(
    params: ExecuteAutomationDto
  ): Promise<AutomationExecution> {
    try {
      const response = await fetch(`${this.baseUrl}/${params.id}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ triggerData: params.triggerData }),
      });

      if (!response.ok) throw new Error("Failed to execute automation");
      return response.json();
    } catch (error) {
      console.error("Error executing automation:", error);
      throw error;
    }
  }

  // Obtener estadísticas
  async getAutomationStats(): Promise<AutomationStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      if (!response.ok) throw new Error("Failed to fetch automation stats");
      return response.json();
    } catch (error) {
      console.error("Error fetching automation stats:", error);
      return this.getMockStats();
    }
  }

  // Obtener historial de ejecuciones
  async getExecutionHistory(
    automationId?: string
  ): Promise<AutomationExecution[]> {
    try {
      const url = automationId
        ? `${this.baseUrl}/${automationId}/executions`
        : `${this.baseUrl}/executions`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch execution history");
      return response.json();
    } catch (error) {
      console.error("Error fetching execution history:", error);
      return [];
    }
  }

  // Activar/desactivar automatización
  async toggleAutomation(id: string, isActive: boolean): Promise<Automation> {
    return this.updateAutomation(id, { isActive });
  }

  // Obtener configuración de tipos de trigger
  getTriggerTypeConfig(): Record<
    AutomationTriggerType,
    { label: string; lightColor: string; textColor: string }
  > {
    return {
      CONTACT_CREATED: {
        label: "Contacto Creado",
        lightColor: "bg-blue-500/20",
        textColor: "text-blue-400",
      },
      TRIP_BOOKED: {
        label: "Viaje Reservado",
        lightColor: "bg-green-500/20",
        textColor: "text-green-400",
      },
      PAYMENT_RECEIVED: {
        label: "Pago Recibido",
        lightColor: "bg-green-500/20",
        textColor: "text-green-400",
      },
      EMAIL_OPENED: {
        label: "Email Abierto",
        lightColor: "bg-purple-500/20",
        textColor: "text-purple-400",
      },
      FORM_SUBMITTED: {
        label: "Formulario Enviado",
        lightColor: "bg-orange-500/20",
        textColor: "text-orange-400",
      },
      DATE_REACHED: {
        label: "Fecha Alcanzada",
        lightColor: "bg-red-500/20",
        textColor: "text-red-400",
      },
      STATUS_CHANGED: {
        label: "Estado Cambiado",
        lightColor: "bg-amber-500/20",
        textColor: "text-amber-400",
      },
      TRIP_QUOTE_REQUESTED: {
        label: "Cotización Solicitada",
        lightColor: "bg-indigo-500/20",
        textColor: "text-indigo-400",
      },
      PAYMENT_OVERDUE: {
        label: "Pago Vencido",
        lightColor: "bg-red-500/20",
        textColor: "text-red-400",
      },
      TRIP_COMPLETED: {
        label: "Viaje Completado",
        lightColor: "bg-green-500/20",
        textColor: "text-green-400",
      },
      NO_ACTIVITY_30_DAYS: {
        label: "Sin Actividad 30 Días",
        lightColor: "bg-gray-500/20",
        textColor: "text-gray-400",
      },
      SEASONAL_OPPORTUNITY: {
        label: "Oportunidad Estacional",
        lightColor: "bg-pink-500/20",
        textColor: "text-pink-400",
      },
      BIRTHDAY: {
        label: "Cumpleaños",
        lightColor: "bg-yellow-500/20",
        textColor: "text-yellow-400",
      },
      CUSTOM: {
        label: "Personalizado",
        lightColor: "bg-gray-500/20",
        textColor: "text-gray-400",
      },
    };
  }

  // Obtener configuración de estados de ejecución
  getExecutionStatusConfig(): Record<string, { label: string }> {
    return {
      PENDING: { label: "Pendiente" },
      RUNNING: { label: "Ejecutando" },
      COMPLETED: { label: "Completado" },
      FAILED: { label: "Fallido" },
    };
  }

  // Mock data para desarrollo
  private getMockAutomations(filters?: AutomationFilters): Automation[] {
    const mockAutomations: Automation[] = [
      {
        id: "1",
        name: "Bienvenida para nuevos contactos",
        description:
          "Envía un email de bienvenida cuando se registra un nuevo contacto",
        isActive: true,
        triggerType: "CONTACT_CREATED",
        triggerConditions: { status: "INTERESADO" },
        trigger: {
          type: "CONTACT_CREATED",
          conditions: { status: "INTERESADO" },
        },
        actions: [
          {
            id: "action_1",
            type: "SEND_EMAIL",
            parameters: {
              templateId: "welcome-template",
            },
            delayMinutes: 5,
            order: 0,
          },
          {
            id: "action_2",
            type: "ADD_TAG",
            parameters: {
              tags: ["Nuevo"],
            },
            delayMinutes: 10,
            order: 1,
          },
        ],
        executions: [
          {
            id: "exec_1",
            automationId: "1",
            triggeredAt: "2025-06-24T10:00:00Z",
            completedAt: "2025-06-24T10:01:00Z",
            status: "COMPLETED",
            triggerData: { contactId: "contact_123" },
            executionLog: ["Email sent successfully"],
          },
        ],
        createdAt: "2025-06-01",
        updatedAt: "2025-06-20",
        lastExecuted: "2025-06-24",
        executionCount: 45,
        successCount: 43,
        failureCount: 2,
      },
      {
        id: "2",
        name: "Seguimiento post-cotización",
        description:
          "Envía seguimiento 3 días después de enviar una cotización",
        isActive: true,
        triggerType: "STATUS_CHANGED",
        triggerConditions: { newStatus: "PASAJERO" },
        trigger: {
          type: "STATUS_CHANGED",
          conditions: { newStatus: "PASAJERO" },
        },
        actions: [
          {
            id: "action_3",
            type: "SEND_EMAIL",
            parameters: {
              templateId: "follow-up-template",
            },
            delayMinutes: 4320, // 3 días
            order: 0,
          },
        ],
        executions: [],
        createdAt: "2025-06-05",
        updatedAt: "2025-06-15",
        lastExecuted: "2025-06-23",
        executionCount: 23,
        successCount: 22,
        failureCount: 1,
      },
    ];

    if (!filters) return mockAutomations;

    return mockAutomations.filter((automation) => {
      if (
        filters.isActive !== undefined &&
        automation.isActive !== filters.isActive
      ) {
        return false;
      }
      if (
        filters.triggerType &&
        automation.triggerType !== filters.triggerType
      ) {
        return false;
      }
      if (
        filters.search &&
        !automation.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }

  private getMockStats(): AutomationStats {
    return {
      totalAutomations: 3,
      activeAutomations: 2,
      totalExecutions: 68,
      successRate: 95.6,
      executionsToday: 5,
      executionsThisWeek: 12,
      executionsThisMonth: 68,
    };
  }
}

export const automationService = new AutomationService();
