import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  emailService,
  EmailTemplate,
  SendEmailRequest,
} from "../services/email.service";
import toast from "react-hot-toast";

export const useEmailTemplates = (category?: string) => {
  return useQuery({
    queryKey: ["email-templates", category],
    queryFn: () => emailService.getTemplates(category),
  });
};

export const useEmailTemplate = (id: string) => {
  return useQuery({
    queryKey: ["email-template", id],
    queryFn: () => emailService.getTemplate(id),
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      template: Omit<
        EmailTemplate,
        "id" | "createdAt" | "updatedAt" | "usageCount"
      >
    ) => emailService.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries(["email-templates"]);
      toast.success("Plantilla creada exitosamente");
    },
    onError: () => {
      toast.error("Error al crear la plantilla");
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      template,
    }: {
      id: string;
      template: Partial<EmailTemplate>;
    }) => emailService.updateTemplate(id, template),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["email-templates"]);
      queryClient.invalidateQueries(["email-template", variables.id]);
      toast.success("Plantilla actualizada");
    },
    onError: () => {
      toast.error("Error al actualizar la plantilla");
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emailService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["email-templates"]);
      toast.success("Plantilla eliminada");
    },
    onError: () => {
      toast.error("Error al eliminar la plantilla");
    },
  });
};

export const useSendEmail = () => {
  return useMutation({
    mutationFn: (request: SendEmailRequest) => emailService.sendEmail(request),
    onSuccess: () => {
      toast.success("Email enviado exitosamente");
    },
    onError: () => {
      toast.error("Error al enviar el email");
    },
  });
};

export const useSendTestEmail = () => {
  return useMutation({
    mutationFn: (request: SendEmailRequest) =>
      emailService.sendTestEmail(request),
    onSuccess: () => {
      toast.success("Email de prueba enviado");
    },
    onError: () => {
      toast.error("Error al enviar el email de prueba");
    },
  });
};

export const useEmailHistory = (filters?: any) => {
  return useQuery({
    queryKey: ["email-history", filters],
    queryFn: () => emailService.getEmailHistory(filters),
  });
};

export const useEmailStats = (period?: "day" | "week" | "month" | "year") => {
  return useQuery({
    queryKey: ["email-stats", period],
    queryFn: () => emailService.getEmailStats(period),
    refetchInterval: 60000, // Refrescar cada minuto
  });
};

export const usePreviewTemplate = () => {
  return useMutation({
    mutationFn: ({
      templateId,
      variables,
    }: {
      templateId: string;
      variables: Record<string, any>;
    }) => emailService.previewTemplate(templateId, variables),
  });
};
