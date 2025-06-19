import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  automationService,
  Automation,
  CreateAutomationDto,
  AutomationFilters,
  ExecutionResult,
} from "../services/automation.service";
import { useAutomationStore } from "../store/automation.store";
import toast from "react-hot-toast";

export const useAutomations = (filters: AutomationFilters = {}) => {
  const queryClient = useQueryClient();
  const {
    setAutomations,
    setLoading,
    setCreating,
    setUpdating,
    setDeleting,
    addAutomation,
    updateAutomation,
    removeAutomation,
  } = useAutomationStore();

  // Fetch automations
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["automations", filters],
    queryFn: () => automationService.getAutomations(filters),
    onSuccess: (data) => {
      setAutomations(data);
    },
    onError: () => {
      toast.error("Error al cargar automatizaciones");
    },
  });

  // Create automation
  const createMutation = useMutation({
    mutationFn: (data: CreateAutomationDto) =>
      automationService.createAutomation(data),
    onMutate: () => setCreating(true),
    onSuccess: (newAutomation) => {
      addAutomation(newAutomation);
      queryClient.invalidateQueries(["automations"]);
      queryClient.invalidateQueries(["automation-stats"]);
      toast.success("Automatización creada exitosamente");
      return newAutomation;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al crear automatización");
    },
    onSettled: () => setCreating(false),
  });

  // Update automation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateAutomationDto>;
    }) => automationService.updateAutomation(id, data),
    onMutate: () => setUpdating(true),
    onSuccess: (updatedAutomation) => {
      updateAutomation(updatedAutomation.id, updatedAutomation);
      queryClient.invalidateQueries(["automations"]);
      queryClient.invalidateQueries(["automation", updatedAutomation.id]);
      toast.success("Automatización actualizada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al actualizar automatización");
    },
    onSettled: () => setUpdating(false),
  });

  // Delete automation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => automationService.deleteAutomation(id),
    onMutate: () => setDeleting(true),
    onSuccess: (_, id) => {
      removeAutomation(id);
      queryClient.invalidateQueries(["automations"]);
      queryClient.invalidateQueries(["automation-stats"]);
      toast.success("Automatización eliminada");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al eliminar automatización");
    },
    onSettled: () => setDeleting(false),
  });

  // Toggle automation
  const toggleMutation = useMutation({
    mutationFn: (id: string) => automationService.toggleAutomation(id),
    onSuccess: (updatedAutomation) => {
      updateAutomation(updatedAutomation.id, updatedAutomation);
      queryClient.invalidateQueries(["automations"]);
      queryClient.invalidateQueries(["automation", updatedAutomation.id]);
      toast.success(
        `Automatización ${updatedAutomation.isActive ? "activada" : "desactivada"}`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al cambiar estado");
    },
  });

  // Execute automation (for testing)
  const executeMutation = useMutation({
    mutationFn: ({
      id,
      triggerData,
    }: {
      id: string;
      triggerData: Record<string, any>;
    }) => automationService.executeAutomation(id, triggerData),
    onSuccess: (result: ExecutionResult) => {
      if (result.success) {
        toast.success(`Automatización ejecutada: ${result.actionsExecuted} acciones completadas`);
      } else {
        toast.error(`Error en ejecución: ${result.error}`);
      }
      queryClient.invalidateQueries(["automation", result.automationId]);
      queryClient.invalidateQueries(["automation-stats"]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Error al ejecutar automatización");
    },
  });

  return {
    // Data
    automations: data || [],
    
    // Loading states
    isLoading: isLoading || false,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isToggling: toggleMutation.isLoading,
    isExecuting: executeMutation.isLoading,

    // Error
    error,

    // Actions
    createAutomation: createMutation.mutateAsync,
    updateAutomation: updateMutation.mutateAsync,
    deleteAutomation: deleteMutation.mutateAsync,
    toggleAutomation: toggleMutation.mutateAsync,
    executeAutomation: executeMutation.mutateAsync,
    refetch,
  };
};

// Hook para una automatización individual
export const useAutomation = (id: string) => {
  const { setSelectedAutomation } = useAutomationStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["automation", id],
    queryFn: () => automationService.getAutomation(id),
    enabled: !!id,
    onSuccess: (data) => {
      setSelectedAutomation(data);
    },
    onError: () => {
      toast.error("Error al cargar automatización");
    },
  });

  return {
    automation: data,
    isLoading,
    error,
  };
};

// Hook para estadísticas de automatizaciones
export const useAutomationStats = () => {
  return useQuery({
    queryKey: ["automation-stats"],
    queryFn: () => automationService.getStats(),
    refetchInterval: 60000, // Refrescar cada minuto
    onError: () => {
      toast.error("Error al cargar estadísticas");
    },
  });
};

// Hook para templates de triggers
export const useTriggerTemplates = () => {
  return useQuery({
    queryKey: ["trigger-templates"],
    queryFn: () => automationService.getTriggerTemplates(),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    onError: () => {
      toast.error("Error al cargar templates de triggers");
    },
  });
};

// Hook para templates de acciones
export const useActionTemplates = () => {
  return useQuery({
    queryKey: ["action-templates"],
    queryFn: () => automationService.getActionTemplates(),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    onError: () => {
      toast.error("Error al cargar templates de acciones");
    },
  });
};