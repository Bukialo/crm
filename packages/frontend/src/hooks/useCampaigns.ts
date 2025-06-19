import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCampaignsStore } from "../store/campaigns.store";
import {
  campaignService,
  Campaign,
  CreateCampaignDto,
  CampaignFilters,
} from "../services/campaign.service";
import toast from "react-hot-toast";

export const useCampaigns = () => {
  const queryClient = useQueryClient();
  const {
    filters,
    setCampaigns,
    setLoading,
    setCreating,
    setUpdating,
    setDeleting,
    setSending,
    addCampaign,
    updateCampaign,
    removeCampaign,
  } = useCampaignsStore();

  // Fetch campaigns
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["campaigns", filters],
    queryFn: () => campaignService.getCampaigns(filters),
    onSuccess: (data) => {
      setCampaigns(data.items, data.total, data.totalPages);
    },
    onError: () => {
      toast.error("Error al cargar campañas");
    },
  });

  // Create campaign
  const createMutation = useMutation({
    mutationFn: (data: CreateCampaignDto) =>
      campaignService.createCampaign(data),
    onMutate: () => setCreating(true),
    onSuccess: (newCampaign) => {
      queryClient.invalidateQueries(["campaigns"]);
      toast.success("Campaña creada exitosamente");
      return newCampaign;
    },
    onError: () => {
      toast.error("Error al crear campaña");
    },
    onSettled: () => setCreating(false),
  });

  // Update campaign
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCampaignDto>;
    }) => campaignService.updateCampaign(id, data),
    onMutate: () => setUpdating(true),
    onSuccess: (updatedCampaign) => {
      updateCampaign(updatedCampaign.id, updatedCampaign);
      queryClient.invalidateQueries(["campaigns"]);
      queryClient.invalidateQueries(["campaign", updatedCampaign.id]);
      toast.success("Campaña actualizada");
    },
    onError: () => {
      toast.error("Error al actualizar campaña");
    },
    onSettled: () => setUpdating(false),
  });

  // Delete campaign
  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignService.deleteCampaign(id),
    onMutate: () => setDeleting(true),
    onSuccess: (_, id) => {
      removeCampaign(id);
      queryClient.invalidateQueries(["campaigns"]);
      toast.success("Campaña eliminada");
    },
    onError: () => {
      toast.error("Error al eliminar campaña");
    },
    onSettled: () => setDeleting(false),
  });

  // Send campaign
  const sendMutation = useMutation({
    mutationFn: (id: string) => campaignService.sendCampaign(id),
    onMutate: () => setSending(true),
    onSuccess: (result, id) => {
      queryClient.invalidateQueries(["campaigns"]);
      queryClient.invalidateQueries(["campaign", id]);
      toast.success(`Campaña enviada a ${result.sentCount} destinatarios`);
    },
    onError: () => {
      toast.error("Error al enviar campaña");
    },
    onSettled: () => setSending(false),
  });

  // Duplicate campaign
  const duplicateMutation = useMutation({
    mutationFn: (id: string) => campaignService.duplicateCampaign(id),
    onSuccess: (newCampaign) => {
      queryClient.invalidateQueries(["campaigns"]);
      toast.success("Campaña duplicada exitosamente");
    },
    onError: () => {
      toast.error("Error al duplicar campaña");
    },
  });

  // Schedule campaign
  const scheduleMutation = useMutation({
    mutationFn: ({
      id,
      scheduledDate,
      timezone,
    }: {
      id: string;
      scheduledDate: Date;
      timezone?: string;
    }) => campaignService.scheduleCampaign(id, scheduledDate, timezone),
    onSuccess: (updatedCampaign) => {
      updateCampaign(updatedCampaign.id, updatedCampaign);
      queryClient.invalidateQueries(["campaigns"]);
      queryClient.invalidateQueries(["campaign", updatedCampaign.id]);
      toast.success("Campaña programada exitosamente");
    },
    onError: () => {
      toast.error("Error al programar campaña");
    },
  });

  // Update status
  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: Campaign["status"];
      reason?: string;
    }) => campaignService.updateCampaignStatus(id, status, reason),
    onSuccess: (updatedCampaign) => {
      updateCampaign(updatedCampaign.id, updatedCampaign);
      queryClient.invalidateQueries(["campaigns"]);
      queryClient.invalidateQueries(["campaign", updatedCampaign.id]);
      toast.success("Estado actualizado");
    },
    onError: () => {
      toast.error("Error al actualizar estado");
    },
  });

  // Test send
  const testSendMutation = useMutation({
    mutationFn: ({ id, emails }: { id: string; emails: string[] }) =>
      campaignService.testSendCampaign(id, emails),
    onSuccess: (result) => {
      toast.success(
        `Email de prueba enviado a ${result.sentTo.length} destinatarios`
      );
    },
    onError: () => {
      toast.error("Error al enviar email de prueba");
    },
  });

  return {
    // Data
    campaigns: data?.items || [],
    totalCampaigns: data?.total || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.page || 1,

    // Loading states
    isLoading: isLoading || false,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isSending: sendMutation.isLoading,

    // Error
    error,

    // Actions
    createCampaign: createMutation.mutateAsync,
    updateCampaign: updateMutation.mutateAsync,
    deleteCampaign: deleteMutation.mutateAsync,
    sendCampaign: sendMutation.mutateAsync,
    duplicateCampaign: duplicateMutation.mutateAsync,
    scheduleCampaign: scheduleMutation.mutateAsync,
    updateCampaignStatus: updateStatusMutation.mutateAsync,
    testSendCampaign: testSendMutation.mutateAsync,
    refetch,
  };
};

// Hook para una campaña individual
export const useCampaign = (id: string) => {
  const { setSelectedCampaign } = useCampaignsStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => campaignService.getCampaign(id),
    enabled: !!id,
    onSuccess: (data) => {
      setSelectedCampaign(data);
    },
    onError: () => {
      toast.error("Error al cargar campaña");
    },
  });

  return {
    campaign: data,
    isLoading,
    error,
  };
};

// Hook para estadísticas de campaña
export const useCampaignStats = (id: string) => {
  return useQuery({
    queryKey: ["campaign-stats", id],
    queryFn: () => campaignService.getCampaignStats(id),
    enabled: !!id,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });
};

// Hook para analytics de campaña
export const useCampaignAnalytics = (id: string) => {
  return useQuery({
    queryKey: ["campaign-analytics", id],
    queryFn: () => campaignService.getCampaignAnalytics(id),
    enabled: !!id,
    refetchInterval: 60000, // Actualizar cada minuto
  });
};

// Hook para destinatarios de campaña
export const useCampaignRecipients = (
  id: string,
  filters: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ["campaign-recipients", id, filters],
    queryFn: () => campaignService.getCampaignRecipients(id, filters),
    enabled: !!id,
  });
};

// Hook para preview de campaña
export const useCampaignPreview = () => {
  return useMutation({
    mutationFn: ({ id, recipients }: { id: string; recipients?: string[] }) =>
      campaignService.previewCampaign(id, recipients),
  });
};
