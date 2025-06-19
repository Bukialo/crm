// Ruta: packages/frontend/src/services/campaigns.service.ts
import api from "../lib/axios";

export interface Campaign {
  id: string;
  name: string;
  type: "EMAIL" | "SMS" | "WHATSAPP";
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "CANCELLED";
  subject?: string;
  content: string;
  templateId?: string;
  targetCriteria: {
    status?: string[];
    destinations?: string[];
    budgetRange?: string[];
    lastTripDays?: number;
    tags?: string[];
    source?: string[];
    assignedAgentId?: string;
  };
  useAiPersonalization: boolean;
  scheduledDate?: string;
  sentDate?: string;
  timezone: string;
  recipientCount: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  conversionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignDto {
  name: string;
  type: "EMAIL" | "SMS" | "WHATSAPP";
  subject?: string;
  content: string;
  templateId?: string;
  targetCriteria: Campaign["targetCriteria"];
  useAiPersonalization?: boolean;
  scheduledDate?: string;
  timezone?: string;
}

export interface CampaignFilters {
  page?: number;
  pageSize?: number;
  status?: string[];
  type?: string[];
  createdById?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CampaignStats {
  totalRecipients: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  timeline: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  locationStats: Array<{
    country: string;
    opens: number;
    clicks: number;
  }>;
}

export interface CampaignsResponse {
  items: Campaign[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class CampaignsService {
  async getCampaigns(
    filters: CampaignFilters = {}
  ): Promise<CampaignsResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await api.get(`/campaigns?${params.toString()}`);
    return response.data.data;
  }

  async getCampaign(id: string): Promise<Campaign> {
    const response = await api.get(`/campaigns/${id}`);
    return response.data.data;
  }

  async createCampaign(data: CreateCampaignDto): Promise<Campaign> {
    const response = await api.post("/campaigns", data);
    return response.data.data;
  }

  async updateCampaign(
    id: string,
    data: Partial<CreateCampaignDto>
  ): Promise<Campaign> {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data.data;
  }

  async deleteCampaign(id: string): Promise<void> {
    await api.delete(`/campaigns/${id}`);
  }

  async sendCampaign(
    id: string
  ): Promise<{ success: boolean; sentCount: number }> {
    const response = await api.post(`/campaigns/${id}/send`);
    return response.data.data;
  }

  async duplicateCampaign(id: string): Promise<Campaign> {
    const response = await api.post(`/campaigns/${id}/duplicate`);
    return response.data.data;
  }

  async scheduleCampaign(
    id: string,
    scheduledDate: string,
    timezone = "UTC"
  ): Promise<Campaign> {
    const response = await api.post(`/campaigns/${id}/schedule`, {
      scheduledDate,
      timezone,
    });
    return response.data.data;
  }

  async updateCampaignStatus(
    id: string,
    status: Campaign["status"],
    reason?: string
  ): Promise<Campaign> {
    const response = await api.patch(`/campaigns/${id}/status`, {
      status,
      reason,
    });
    return response.data.data;
  }

  async getCampaignStats(id: string): Promise<CampaignStats> {
    const response = await api.get(`/campaigns/${id}/stats`);
    return response.data.data;
  }

  async getCampaignAnalytics(id: string): Promise<CampaignStats> {
    const response = await api.get(`/campaigns/${id}/analytics`);
    return response.data.data;
  }

  async previewCampaign(
    id: string,
    recipients?: string[]
  ): Promise<{
    subject: string;
    htmlContent: string;
    textContent: string;
    variables: Record<string, any>;
  }> {
    const response = await api.post(`/campaigns/${id}/preview`, { recipients });
    return response.data.data;
  }

  async testSendCampaign(
    id: string,
    emails: string[]
  ): Promise<{ success: boolean; sentTo: string[] }> {
    const response = await api.post(`/campaigns/${id}/test-send`, { emails });
    return response.data.data;
  }

  async getRecipients(
    id: string,
    filters: {
      page?: number;
      pageSize?: number;
      status?: string;
      search?: string;
    } = {}
  ): Promise<{
    items: Array<{
      id: string;
      contact: {
        firstName: string;
        lastName: string;
        email: string;
      };
      sent: boolean;
      sentAt?: string;
      opened: boolean;
      openedAt?: string;
      clicked: boolean;
      clickedAt?: string;
      converted: boolean;
      convertedAt?: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await api.get(
      `/campaigns/${id}/recipients?${params.toString()}`
    );
    return response.data.data;
  }

  // Helper para calcular audiencia objetivo
  async calculateTargetAudience(
    criteria: Campaign["targetCriteria"]
  ): Promise<{
    count: number;
    preview: Array<{ firstName: string; lastName: string; email: string }>;
  }> {
    const response = await api.post("/campaigns/calculate-audience", {
      criteria,
    });
    return response.data.data;
  }

  // Obtener tipos de campaña disponibles
  getCampaignTypes() {
    return [
      {
        value: "EMAIL",
        label: "Email",
        icon: "Mail",
        description: "Campañas por correo electrónico",
      },
      {
        value: "SMS",
        label: "SMS",
        icon: "MessageSquare",
        description: "Mensajes de texto",
      },
      {
        value: "WHATSAPP",
        label: "WhatsApp",
        icon: "MessageCircle",
        description: "Mensajes por WhatsApp",
      },
    ];
  }

  // Obtener estados de campaña
  getCampaignStatuses() {
    return [
      {
        value: "DRAFT",
        label: "Borrador",
        color: "gray",
        description: "Campaña en preparación",
      },
      {
        value: "SCHEDULED",
        label: "Programada",
        color: "blue",
        description: "Programada para envío futuro",
      },
      {
        value: "SENDING",
        label: "Enviando",
        color: "yellow",
        description: "En proceso de envío",
      },
      {
        value: "SENT",
        label: "Enviada",
        color: "green",
        description: "Enviada exitosamente",
      },
      {
        value: "CANCELLED",
        label: "Cancelada",
        color: "red",
        description: "Campaña cancelada",
      },
    ];
  }
}

export const campaignsService = new CampaignsService();
