// src/hooks/useAutomations.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { automationService } from "../services/automation.service";
import type {
  AutomationFilters,
  CreateAutomationDto
} from "../services/automation.service";
import toast from "react-hot-toast";

// ✅ AGREGADO: Hook para trigger templates
export const useTriggerTemplates = () => {
  return useQuery({
    queryKey: ["automation-trigger-templates"],
    queryFn: async () => {
      // Mock data para trigger templates
      return [
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
        {
          type: "PAYMENT_OVERDUE",
          name: "Pago vencido",
          description: "Se ejecuta cuando un pago está vencido",
          icon: "💳",
          conditions: [
            {
              field: "daysOverdue",
              label: "Días de vencimiento",
              type: "number",
              required: true,
              default: 1,
            },
          ],
        },
        {
          type: "NO_ACTIVITY_30_DAYS",
          name: "Sin actividad por 30 días",
          description: "Se ejecuta cuando no hay actividad por 30 días",
          icon: "📅",
          conditions: [
            {
              field: "days",
              label: "Días sin actividad",
              type: "number",
              required: true,
              default: 30,
            },
            {
              field: "excludeTags",
              label: "Excluir etiquetas",
              type: "array",
              required: false,
            },
          ],
        },
        {
          type: "BIRTHDAY",
          name: "Cumpleaños",
          description: "Se ejecuta en el cumpleaños del contacto",
          icon: "🎂",
          conditions: [
            {
              field: "daysBefore",
              label: "Días antes",
              type: "number",
              required: false,
              default: 0,
            },
          ],
        },
      ];
    },
  });
};

// ✅ AGREGADO: Hook para action templates
export const useActionTemplates = () => {
  return useQuery({
    queryKey: ["automation-action-templates"],
    queryFn: async () => {
      // Mock data para action templates
      return [
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
            {
              name: "priority",
              label: "Prioridad",
              type: "select",
              required: true,
              options: ["LOW", "MEDIUM", "HIGH", "URGENT"],
            },
          ],
        },
      ];
    },
  });
};

// Hook principal para automations
export const useAutomations = (filters?: AutomationFilters) => {
  const queryClient = useQueryClient();

  const {
    data: automations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["automations", filters],
    queryFn: () => automationService.getAutomations(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAutomationDto) =>
      automationService.createAutomation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Automatización creada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al crear automatización");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateAutomationDto>;
    }) => automationService.updateAutomation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Automatización actualizada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al actualizar automatización");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => automationService.deleteAutomation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Automatización eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al eliminar automatización");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      automationService.toggleAutomation(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Estado de automatización actualizado");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al cambiar estado");
    },
  });

  // ✅ AGREGADO: Execution history hook
  const {
    data: executionHistory = [],
    isLoading: executionLoading,
    refetch: refreshExecutionHistory,
  } = useQuery({
    queryKey: ["automation-executions"],
    queryFn: () => automationService.getExecutionHistory(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    automations,
    isLoading,
    error,
    refetch,

    // CRUD operations
    createAutomation: createMutation.mutate,
    updateAutomation: updateMutation.mutate,
    deleteAutomation: deleteMutation.mutate,
    toggleAutomation: toggleMutation.mutate,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending,

    // ✅ AGREGADO: Execution history
    executionHistory,
    executionLoading,
    refreshExecutionHistory,
  };
};
