// src/hooks/useEmails.ts
import { useState, useEffect } from "react";
import {
  emailService,
  EmailTemplate,
  Campaign,
  EmailStats,
} from "../services/email.service";

interface UseEmailsReturn {
  // State
  campaigns: Campaign[];
  templates: EmailTemplate[];
  emailStats: EmailStats;
  loading: boolean;
  error: string | null;

  // Actions
  createCampaign: (campaignData: Partial<Campaign>) => Promise<Campaign>;
  updateCampaign: (
    id: string,
    campaignData: Partial<Campaign>
  ) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;
  sendCampaign: (id: string) => Promise<void>;

  createTemplate: (
    templateData: Partial<EmailTemplate>
  ) => Promise<EmailTemplate>;
  updateTemplate: (
    id: string,
    templateData: Partial<EmailTemplate>
  ) => Promise<EmailTemplate>;
  deleteTemplate: (id: string) => Promise<void>;

  sendTestEmail: (templateId: string, testEmail: string) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useEmails = (): UseEmailsReturn => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [campaignsData, templatesData, statsData] = await Promise.all([
        emailService.getCampaigns(),
        emailService.getTemplates(),
        emailService.getEmailStats(),
      ]);

      setCampaigns(campaignsData);
      setTemplates(templatesData);
      setEmailStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading email data");
      console.error("Error loading email data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Campaign actions
  const createCampaign = async (
    campaignData: Partial<Campaign>
  ): Promise<Campaign> => {
    try {
      setError(null);
      const newCampaign = await emailService.createCampaign(campaignData);
      setCampaigns((prev) => [newCampaign, ...prev]);
      return newCampaign;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error creating campaign";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateCampaign = async (
    id: string,
    campaignData: Partial<Campaign>
  ): Promise<Campaign> => {
    try {
      setError(null);
      const updatedCampaign = await emailService.updateCampaign(
        id,
        campaignData
      );
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === id ? updatedCampaign : campaign
        )
      );
      return updatedCampaign;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating campaign";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteCampaign = async (id: string): Promise<void> => {
    try {
      setError(null);
      await emailService.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error deleting campaign";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sendCampaign = async (id: string): Promise<void> => {
    try {
      setError(null);
      await emailService.sendCampaign(id);

      // Actualizar el estado de la campaña a 'SENT'
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === id
            ? { ...campaign, status: "SENT", sentDate: new Date() }
            : campaign
        )
      );

      // Refrescar estadísticas
      await refreshStats();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error sending campaign";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Template actions
  const createTemplate = async (
    templateData: Partial<EmailTemplate>
  ): Promise<EmailTemplate> => {
    try {
      setError(null);
      const newTemplate = await emailService.createTemplate(templateData);
      setTemplates((prev) => [newTemplate, ...prev]);
      return newTemplate;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error creating template";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTemplate = async (
    id: string,
    templateData: Partial<EmailTemplate>
  ): Promise<EmailTemplate> => {
    try {
      setError(null);
      const updatedTemplate = await emailService.updateTemplate(
        id,
        templateData
      );
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === id ? updatedTemplate : template
        )
      );
      return updatedTemplate;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating template";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    try {
      setError(null);
      await emailService.deleteTemplate(id);
      setTemplates((prev) => prev.filter((template) => template.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error deleting template";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Email actions
  const sendTestEmail = async (
    templateId: string,
    testEmail: string
  ): Promise<void> => {
    try {
      setError(null);
      await emailService.sendTestEmail(templateId, testEmail);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error sending test email";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshStats = async (): Promise<void> => {
    try {
      const statsData = await emailService.getEmailStats();
      setEmailStats(statsData);
    } catch (err) {
      console.error("Error refreshing email stats:", err);
    }
  };

  return {
    // State
    campaigns,
    templates,
    emailStats,
    loading,
    error,

    // Actions
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,

    createTemplate,
    updateTemplate,
    deleteTemplate,

    sendTestEmail,
    refreshStats,
  };
};
