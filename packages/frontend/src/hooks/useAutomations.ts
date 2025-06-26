// src/hooks/useAutomations.ts - VERSIÓN CORREGIDA
import { useState, useEffect } from "react";
import {
  AutomationTriggerType,
  Automation,
  AutomationStats,
  AutomationFilters,
  CreateAutomationDto,
  ExecuteAutomationDto,
  AutomationExecution,
} from "../services/automation.service";
import toast from "react-hot-toast";

// ✅ CORREGIDO: Interface para el hook con tipos correctos
interface UseAutomationsReturn {
  // Data
  automations: Automation[];
  stats: AutomationStats | null;

  // Loading states
  loading: boolean;
  statsLoading: boolean;

  // Actions
  executeAutomation: (params: ExecuteAutomationDto) => Promise<void>;
  toggleAutomation: (id: string, isActive: boolean) => Promise<void>;
  deleteAutomation: (id: string) => Promise<void>;
  createAutomation: (data: CreateAutomationDto) => Promise<void>;

  // Filters
  filters: AutomationFilters;
  setFilters: (filters: Partial<AutomationFilters>) => void;

  // Execution history
  executionHistory: AutomationExecution[];
  refreshExecutionHistory: () => Promise<void>;
}

// Hook de trigger templates
export const useTriggerTemplates = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data para trigger templates
    const mockTemplates = [
      {
        type: "CONTACT_CREATED",
        name: "Nuevo contacto registrado",
        description: "Se ejecuta cuando se registra un nuevo contacto",
        icon: "👤",
        conditions: [
          {
            field: "status",
            label: "Estado del contacto",
            type: "select",
            required: false,
            options: ["INTERESADO", "PASAJERO", "CLIENTE"],
          },
          {
            field: "source",
            label: "Fuente",
            type: "select",
            required: false,
            options: ["WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "ADVERTISING"],
          },
        ],
      },
      {
        type: "TRIP_QUOTE_REQUESTED",
        name: "Cotización solicitada",
        description: "Se ejecuta cuando se solicita una cotización",
        icon: "✈️",
        conditions: [
          {
            field: "destination",
            label: "Destino",
            type: "text",
            required: false,
          },
          {
            field: "budgetRange",
            label: "Rango de presupuesto",
            type: "select",
            required: false,
            options: ["LOW", "MEDIUM", "HIGH", "LUXURY"],
          },
        ],
      },
    ];

    setData(mockTemplates);
    setIsLoading(false);
  }, []);

  return { data, isLoading };
};

// Hook de action templates
export const useActionTemplates = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data para action templates
    const mockTemplates = [
      {
        type: "SEND_EMAIL",
        name: "Enviar Email",
        description: "Envía un email al contacto",
        icon: "📧",
        fields: [
          {
            name: "templateId",
            label: "Plantilla de Email",
            type: "select",
            required: true,
          },
          {
            name: "subject",
            label: "Asunto personalizado",
            type: "text",
            required: false,
          },
        ],
      },
      {
        type: "CREATE_TASK",
        name: "Crear Tarea",
        description: "Crea una tarea para el agente",
        icon: "📋",
        fields: [
          {
            name: "title",
            label: "Título de la tarea",
            type: "text",
            required: true,
          },
          {
            name: "description",
            label: "Descripción",
            type: "textarea",
            required: false,
          },
        ],
      },
    ];

    setData(mockTemplates);
    setIsLoading(false);
  }, []);

  return { data, isLoading };
};

// ✅ HOOK PRINCIPAL CORREGIDO
export const useAutomations = (
  initialFilters?: AutomationFilters
): UseAutomationsReturn => {
  // Estados principales
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<
    AutomationExecution[]
  >([]);

  // Filtros
  const [filters, setFiltersState] = useState<AutomationFilters>(
    initialFilters || {
      isActive: undefined,
      triggerType: undefined,
      search: "",
      page: 1,
      pageSize: 20,
    }
  );

  // ✅ DATOS MOCK MEJORADOS
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
          parameters: { templateId: "welcome-template" },
          delayMinutes: 5,
          order: 0,
        },
      ],
      executions: [
        {
          id: "exec_1",
          automationId: "1",
          triggeredAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          status: "COMPLETED",
          triggerData: { contactId: "contact_123" },
          executionLog: ["Email sent successfully"],
        },
      ],
      createdAt: new Date("2025-06-01").toISOString(),
      updatedAt: new Date("2025-06-20").toISOString(),
      lastExecuted: new Date("2025-06-24").toISOString(),
      executionCount: 45,
      successCount: 43,
      failureCount: 2,
    },
    {
      id: "2",
      name: "Seguimiento post-cotización",
      description: "Envía seguimiento 3 días después de enviar una cotización",
      isActive: false,
      triggerType: "STATUS_CHANGED",
      triggerConditions: { newStatus: "PASAJERO" },
      trigger: {
        type: "STATUS_CHANGED",
        conditions: { newStatus: "PASAJERO" },
      },
      actions: [
        {
          id: "action_2",
          type: "SEND_EMAIL",
          parameters: { templateId: "follow-up-template" },
          delayMinutes: 4320,
          order: 0,
        },
      ],
      executions: [],
      createdAt: new Date("2025-06-05").toISOString(),
      updatedAt: new Date("2025-06-15").toISOString(),
      lastExecuted: new Date("2025-06-23").toISOString(),
      executionCount: 23,
      successCount: 22,
      failureCount: 1,
    },
  ];

  const mockStats: AutomationStats = {
    totalAutomations: 2,
    activeAutomations: 1,
    totalExecutions: 68,
    successRate: 95.6,
    executionsToday: 5,
    executionsThisWeek: 12,
    executionsThisMonth: 68,
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadAutomations();
    loadStats();
  }, [filters]);

  const loadAutomations = async () => {
    setLoading(true);
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Aplicar filtros
      let filtered = [...mockAutomations];

      if (filters.isActive !== undefined) {
        filtered = filtered.filter((a) => a.isActive === filters.isActive);
      }

      if (filters.triggerType) {
        filtered = filtered.filter(
          (a) => a.triggerType === filters.triggerType
        );
      }

      if (filters.search) {
        filtered = filtered.filter(
          (a) =>
            a.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
            a.description?.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      setAutomations(filtered);
    } catch (error) {
      console.error("Error loading automations:", error);
      toast.error("Error al cargar automatizaciones");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setStats(mockStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // ✅ ACCIONES CORREGIDAS
  const executeAutomation = async (params: ExecuteAutomationDto) => {
    try {
      console.log("Executing automation:", params);
      toast.success("Automatización ejecutada exitosamente");
    } catch (error) {
      console.error("Error executing automation:", error);
      toast.error("Error al ejecutar automatización");
    }
  };

  const toggleAutomation = async (id: string, isActive: boolean) => {
    try {
      setAutomations((prev) =>
        prev.map((automation) =>
          automation.id === id ? { ...automation, isActive } : automation
        )
      );

      toast.success(`Automatización ${isActive ? "activada" : "desactivada"}`);
    } catch (error) {
      console.error("Error toggling automation:", error);
      toast.error("Error al cambiar estado");
    }
  };

  const deleteAutomation = async (id: string) => {
    try {
      setAutomations((prev) => prev.filter((a) => a.id !== id));
      toast.success("Automatización eliminada");
    } catch (error) {
      console.error("Error deleting automation:", error);
      toast.error("Error al eliminar automatización");
    }
  };

  const createAutomation = async (data: CreateAutomationDto) => {
    try {
      const newAutomation: Automation = {
        id: `auto_${Date.now()}`,
        name: data.name,
        description: data.description,
        isActive: data.isActive || true,
        triggerType: data.trigger.type,
        triggerConditions: data.trigger.conditions,
        trigger: data.trigger,
        actions: data.actions.map((action, index) => ({
          ...action,
          id: `action_${Date.now()}_${index}`,
          order: index,
        })),
        executions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
      };

      setAutomations((prev) => [newAutomation, ...prev]);
      toast.success("Automatización creada exitosamente");
    } catch (error) {
      console.error("Error creating automation:", error);
      toast.error("Error al crear automatización");
    }
  };

  const setFilters = (newFilters: Partial<AutomationFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const refreshExecutionHistory = async () => {
    try {
      // Mock execution history
      const mockHistory: AutomationExecution[] = [
        {
          id: "exec_1",
          automationId: "1",
          triggeredAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          status: "COMPLETED",
          triggerData: { contactId: "contact_123" },
          executionLog: ["Automation started", "Email sent successfully"],
        },
      ];

      setExecutionHistory(mockHistory);
    } catch (error) {
      console.error("Error loading execution history:", error);
    }
  };

  return {
    // Data
    automations,
    stats,

    // Loading states
    loading,
    statsLoading,

    // Actions
    executeAutomation,
    toggleAutomation,
    deleteAutomation,
    createAutomation,

    // Filters
    filters,
    setFilters,

    // Execution history
    executionHistory,
    refreshExecutionHistory,
  };
};
