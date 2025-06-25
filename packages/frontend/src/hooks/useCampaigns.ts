// src/hooks/useCampaigns.ts
import { useState, useEffect } from "react";

export interface Campaign {
  id: string;
  name: string;
  type: "EMAIL" | "SMS" | "WHATSAPP";
  status: "DRAFT" | "SCHEDULED" | "SENT" | "SENDING";
  subject?: string;
  recipients: number;
  sentDate?: string;
  scheduledDate?: string;
  openRate?: number;
  clickRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignData {
  name: string;
  type: Campaign["type"];
  recipients: number;
  subject?: string;
  scheduledDate?: string;
}

export interface UseCampaignsReturn {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  createCampaign: (data: CreateCampaignData) => Promise<Campaign>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;
  sendCampaign: (id: string) => Promise<void>;
  refreshCampaigns: () => Promise<void>;
}

export const useCampaigns = (): UseCampaignsReturn => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data para desarrollo
  const mockCampaigns: Campaign[] = [
    {
      id: "1",
      name: "Promoción Verano 2025",
      type: "EMAIL",
      status: "SENT",
      subject: "¡Ofertas especiales de verano!",
      recipients: 250,
      sentDate: "2025-06-20",
      openRate: 68,
      clickRate: 15,
      createdAt: "2025-06-15",
      updatedAt: "2025-06-20",
    },
    {
      id: "2",
      name: "Seguimiento Post-Viaje",
      type: "EMAIL",
      status: "DRAFT",
      subject: "¿Cómo estuvo tu viaje?",
      recipients: 45,
      createdAt: "2025-06-22",
      updatedAt: "2025-06-22",
    },
    {
      id: "3",
      name: "Recordatorio WhatsApp",
      type: "WHATSAPP",
      status: "SCHEDULED",
      recipients: 120,
      scheduledDate: "2025-06-25",
      createdAt: "2025-06-18",
      updatedAt: "2025-06-18",
    },
    {
      id: "4",
      name: "SMS Ofertas Flash",
      type: "SMS",
      status: "SENT",
      recipients: 300,
      sentDate: "2025-06-19",
      openRate: 95,
      clickRate: 8,
      createdAt: "2025-06-19",
      updatedAt: "2025-06-19",
    },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCampaigns(mockCampaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  const createCampaign = async (
    data: CreateCampaignData
  ): Promise<Campaign> => {
    setError(null);

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newCampaign: Campaign = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        type: data.type,
        status: "DRAFT",
        subject: data.subject,
        recipients: data.recipients,
        scheduledDate: data.scheduledDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

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
    data: Partial<Campaign>
  ): Promise<Campaign> => {
    setError(null);

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === id
            ? { ...campaign, ...data, updatedAt: new Date().toISOString() }
            : campaign
        )
      );

      const updatedCampaign = campaigns.find((c) => c.id === id);
      if (!updatedCampaign) {
        throw new Error("Campaign not found");
      }

      return { ...updatedCampaign, ...data };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating campaign";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteCampaign = async (id: string): Promise<void> => {
    setError(null);

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error deleting campaign";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sendCampaign = async (id: string): Promise<void> => {
    setError(null);

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === id
            ? {
                ...campaign,
                status: "SENT" as const,
                sentDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : campaign
        )
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error sending campaign";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshCampaigns = async (): Promise<void> => {
    await loadCampaigns();
  };

  return {
    campaigns,
    isLoading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    refreshCampaigns,
  };
};
