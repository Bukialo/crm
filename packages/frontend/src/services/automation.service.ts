// src/services/automation.service.ts

export type AutomationTriggerType =
  | "CONTACT_CREATED"
  | "TRIP_BOOKED"
  | "PAYMENT_RECEIVED"
  | "EMAIL_OPENED"
  | "FORM_SUBMITTED"
  | "DATE_REACHED"
  | "STATUS_CHANGED";

export type AutomationActionType =
  | "SEND_EMAIL"
  | "SEND_SMS"
  | "SEND_WHATSAPP"
  | "UPDATE_CONTACT"
  | "CREATE_TASK"
  | "ADD_TAG"
  | "REMOVE_TAG"
  | "ASSIGN_AGENT"
  | "CHANGE_STATUS";

export interface AutomationTrigger {
  type: AutomationTriggerType;
  conditions: Record<string, any>;
  delay?: number; // en minutos
}

export interface AutomationAction {
  type: AutomationActionType;
  parameters: Record<string, any>;
  delay?: number; // en minutos
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
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

  // Mock data para desarrollo
  private getMockAutomations(filters?: AutomationFilters): Automation[] {
    const mockAutomations: Automation[] = [
      {
        id: "1",
        name: "Bienvenida para nuevos contactos",
        description:
          "Envía un email de bienvenida cuando se registra un nuevo contacto",
        isActive: true,
        trigger: {
          type: "CONTACT_CREATED",
          conditions: { status: "INTERESADO" },
        },
        actions: [
          {
            type: "SEND_EMAIL",
            parameters: {
              templateId: "welcome-template",
              delay: 5, // 5 minutos después
            },
          },
          {
            type: "ADD_TAG",
            parameters: {
              tags: ["Nuevo"],
            },
            delay: 10,
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
        trigger: {
          type: "STATUS_CHANGED",
          conditions: { newStatus: "PASAJERO" },
        },
        actions: [
          {
            type: "SEND_EMAIL",
            parameters: {
              templateId: "follow-up-template",
            },
            delay: 4320, // 3 días en minutos
          },
        ],
        createdAt: "2025-06-05",
        updatedAt: "2025-06-15",
        lastExecuted: "2025-06-23",
        executionCount: 23,
        successCount: 22,
        failureCount: 1,
      },
      {
        id: "3",
        name: "Recordatorio de pago",
        description: "Envía recordatorio cuando se acerca la fecha de pago",
        isActive: false,
        trigger: {
          type: "DATE_REACHED",
          conditions: { daysBeforeDue: 3 },
        },
        actions: [
          {
            type: "SEND_SMS",
            parameters: {
              message: "Recordatorio: Tu pago vence en 3 días",
            },
          },
          {
            type: "CREATE_TASK",
            parameters: {
              title: "Seguimiento de pago",
              assignedTo: "agent",
            },
          },
        ],
        createdAt: "2025-06-10",
        updatedAt: "2025-06-10",
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
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
        automation.trigger.type !== filters.triggerType
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
