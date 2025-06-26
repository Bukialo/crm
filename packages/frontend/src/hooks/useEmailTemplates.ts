// src/hooks/useEmailTemplates.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emailService, EmailTemplate } from "../services/email.service";
import toast from "react-hot-toast";

interface UseEmailTemplatesReturn {
  data: EmailTemplate[] | undefined;
  isLoading: boolean;
  error: Error | null;
  createTemplate: (data: Partial<EmailTemplate>) => Promise<EmailTemplate>;
  updateTemplate: (
    id: string,
    data: Partial<EmailTemplate>
  ) => Promise<EmailTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  refetch: () => void;
}

export const useEmailTemplates = (): UseEmailTemplatesReturn => {
  const queryClient = useQueryClient();

  // Query para obtener templates
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["email-templates"],
    queryFn: () => emailService.getTemplates(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para crear template
  const createMutation = useMutation({
    mutationFn: (data: Partial<EmailTemplate>) =>
      emailService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Plantilla creada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al crear plantilla");
    },
  });

  // Mutation para actualizar template
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmailTemplate> }) =>
      emailService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Plantilla actualizada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al actualizar plantilla");
    },
  });

  // Mutation para eliminar template
  const deleteMutation = useMutation({
    mutationFn: (id: string) => emailService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Plantilla eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al eliminar plantilla");
    },
  });

  return {
    data,
    isLoading,
    error,
    createTemplate: createMutation.mutateAsync,
    updateTemplate: (id: string, data: Partial<EmailTemplate>) =>
      updateMutation.mutateAsync({ id, data }),
    deleteTemplate: deleteMutation.mutateAsync,
    refetch,
  };
};
