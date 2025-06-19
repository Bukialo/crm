import api from "../lib/axios";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category:
    | "welcome"
    | "quote"
    | "follow_up"
    | "seasonal"
    | "post_trip"
    | "custom";
  htmlContent: string;
  textContent?: string;
  variables: EmailVariable[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailVariable {
  name: string;
  type: "text" | "number" | "date" | "boolean";
  required?: boolean;
  defaultValue?: any;
  description?: string;
}

export interface SendEmailRequest {
  to: string[];
  templateId?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables?: Record<string, any>;
  scheduledAt?: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

export interface EmailHistory {
  id: string;
  to: string;
  subject: string;
  templateId?: string;
  templateName?: string;
  status: "sent" | "failed" | "scheduled" | "draft";
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  error?: string;
  createdAt: string;
}

export interface EmailStats {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
}

class EmailService {
  // Templates
  async getTemplates(category?: string): Promise<EmailTemplate[]> {
    const params = category ? `?category=${category}` : "";
    const response = await api.get(`/emails/templates${params}`);
    return response.data.data;
  }

  async getTemplate(id: string): Promise<EmailTemplate> {
    const response = await api.get(`/emails/templates/${id}`);
    return response.data.data;
  }

  async createTemplate(
    template: Omit<
      EmailTemplate,
      "id" | "createdAt" | "updatedAt" | "usageCount"
    >
  ): Promise<EmailTemplate> {
    const response = await api.post("/emails/templates", template);
    return response.data.data;
  }

  async updateTemplate(
    id: string,
    template: Partial<EmailTemplate>
  ): Promise<EmailTemplate> {
    const response = await api.put(`/emails/templates/${id}`, template);
    return response.data.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/emails/templates/${id}`);
  }

  // Send emails
  async sendEmail(
    request: SendEmailRequest
  ): Promise<{ success: boolean; messageId: string }> {
    const response = await api.post("/emails/send", request);
    return response.data.data;
  }

  async sendTestEmail(
    request: SendEmailRequest
  ): Promise<{ success: boolean }> {
    const response = await api.post("/emails/send-test", request);
    return response.data.data;
  }

  // Email history
  async getEmailHistory(filters?: {
    contactId?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: EmailHistory[]; total: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get(`/emails/history?${params.toString()}`);
    return response.data.data;
  }

  async getEmailStats(
    period?: "day" | "week" | "month" | "year"
  ): Promise<EmailStats> {
    const params = period ? `?period=${period}` : "";
    const response = await api.get(`/emails/stats${params}`);
    return response.data.data;
  }

  // Preview
  async previewTemplate(
    templateId: string,
    variables: Record<string, any>
  ): Promise<{ html: string; text: string }> {
    const response = await api.post(`/emails/preview/${templateId}`, {
      variables,
    });
    return response.data.data;
  }

  // Template categories
  getTemplateCategories() {
    return [
      { value: "welcome", label: "Bienvenida", icon: "👋" },
      { value: "quote", label: "Cotización", icon: "💰" },
      { value: "follow_up", label: "Seguimiento", icon: "📞" },
      { value: "seasonal", label: "Temporada", icon: "🌴" },
      { value: "post_trip", label: "Post-viaje", icon: "✈️" },
      { value: "custom", label: "Personalizado", icon: "✏️" },
    ];
  }

  // Default templates
  getDefaultTemplates(): Partial<EmailTemplate>[] {
    return [
      {
        name: "Bienvenida",
        category: "welcome",
        subject: "Bienvenido a Bukialo - {{firstName}}",
        htmlContent: `
          <h1>¡Hola {{firstName}}!</h1>
          <p>Bienvenido a Bukialo, tu agencia de viajes de confianza.</p>
          <p>Estamos emocionados de ayudarte a planificar tu próxima aventura.</p>
          <p>Tu agente asignado es {{agentName}}, quien estará en contacto contigo pronto.</p>
        `,
        variables: [
          { name: "firstName", type: "text", required: true },
          { name: "agentName", type: "text", required: true },
        ],
      },
      {
        name: "Cotización de Viaje",
        category: "quote",
        subject: "Tu cotización para {{destination}} está lista",
        htmlContent: `
          <h1>Hola {{firstName}},</h1>
          <p>Tu cotización para viajar a {{destination}} está lista.</p>
          <p>Fecha de salida: {{departureDate}}</p>
          <p>Precio total: ${{ totalPrice }}</p>
          <p>Esta cotización es válida por 7 días.</p>
        `,
        variables: [
          { name: "firstName", type: "text", required: true },
          { name: "destination", type: "text", required: true },
          { name: "departureDate", type: "date", required: true },
          { name: "totalPrice", type: "number", required: true },
        ],
      },
    ];
  }
}

export const emailService = new EmailService();
