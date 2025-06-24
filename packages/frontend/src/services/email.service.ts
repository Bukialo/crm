// src/services/email.service.ts
import { Contact } from "../types/contact.types";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  category: "WELCOME" | "QUOTE" | "FOLLOW_UP" | "SEASONAL" | "POST_TRIP";
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  templateId: string;
  recipients: string[];
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
  scheduledDate?: Date;
  sentDate?: Date;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailStats {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

class EmailService {
  private baseUrl = "/api/emails";

  // Templates
  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`);
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    } catch (error) {
      console.error("Error fetching templates:", error);
      return [];
    }
  }

  async createTemplate(
    template: Partial<EmailTemplate>
  ): Promise<EmailTemplate> {
    const response = await fetch(`${this.baseUrl}/templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(template),
    });

    if (!response.ok) throw new Error("Failed to create template");
    return response.json();
  }

  async updateTemplate(
    id: string,
    template: Partial<EmailTemplate>
  ): Promise<EmailTemplate> {
    const response = await fetch(`${this.baseUrl}/templates/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(template),
    });

    if (!response.ok) throw new Error("Failed to update template");
    return response.json();
  }

  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/templates/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete template");
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const response = await fetch(`${this.baseUrl}/campaigns`);
      if (!response.ok) throw new Error("Failed to fetch campaigns");
      return response.json();
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    const response = await fetch(`${this.baseUrl}/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(campaign),
    });

    if (!response.ok) throw new Error("Failed to create campaign");
    return response.json();
  }

  async updateCampaign(
    id: string,
    campaign: Partial<Campaign>
  ): Promise<Campaign> {
    const response = await fetch(`${this.baseUrl}/campaigns/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(campaign),
    });

    if (!response.ok) throw new Error("Failed to update campaign");
    return response.json();
  }

  async sendCampaign(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/campaigns/${id}/send`, {
      method: "POST",
    });

    if (!response.ok) throw new Error("Failed to send campaign");
  }

  async deleteCampaign(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/campaigns/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete campaign");
  }

  // Email sending
  async sendSingleEmail(
    to: string,
    subject: string,
    htmlContent: string,
    templateId?: string
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        htmlContent,
        templateId,
      }),
    });

    if (!response.ok) throw new Error("Failed to send email");
  }

  async sendTestEmail(templateId: string, testEmail: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId,
        testEmail,
      }),
    });

    if (!response.ok) throw new Error("Failed to send test email");
  }

  // Statistics
  async getEmailStats(): Promise<EmailStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      if (!response.ok) throw new Error("Failed to fetch email stats");
      return response.json();
    } catch (error) {
      console.error("Error fetching email stats:", error);
      return {
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
      };
    }
  }

  async getCampaignStats(campaignId: string): Promise<Campaign["stats"]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/campaigns/${campaignId}/stats`
      );
      if (!response.ok) throw new Error("Failed to fetch campaign stats");
      return response.json();
    } catch (error) {
      console.error("Error fetching campaign stats:", error);
      return {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      };
    }
  }

  // Template processing and personalization
  processTemplate(
    template: string,
    contact: Contact,
    customData?: Record<string, any>
  ): string {
    let result = template;

    // Variables básicas del contacto
    const variables = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      fullName: `${contact.firstName} ${contact.lastName}`,
      email: contact.email,
      phone: contact.phone || "",
      status: contact.status,
      ...customData, // Variables adicionales
    };

    // Reemplazar variables en formato {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      result = result.replace(regex, String(value || ""));
    });

    return result;
  }

  // Templates predefinidos para agencias de viajes
  getDefaultTemplates(): Partial<EmailTemplate>[] {
    return [
      {
        name: "Bienvenida - Nuevo Lead",
        subject: "¡Bienvenido {{firstName}}! Tu próximo viaje te espera",
        category: "WELCOME",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">¡Hola {{firstName}}!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Bienvenido a nuestra agencia de viajes</p>
            </div>
            
            <div style="padding: 30px 20px; background: white;">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Nos emociona saber que estás interesado en viajar. En nuestra agencia, nos especializamos en crear experiencias únicas y memorables.
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Nuestro equipo de expertos está listo para ayudarte a planificar el viaje de tus sueños, desde destinos exóticos hasta escapadas de fin de semana.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Explorar Destinos
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; text-align: center;">
                ¿Tienes alguna pregunta? Responde a este email o llámanos al (123) 456-7890
              </p>
            </div>
          </div>
        `,
        variables: ["firstName", "lastName", "email"],
      },
      {
        name: "Cotización de Viaje",
        subject: "Tu cotización personalizada está lista, {{firstName}}",
        category: "QUOTE",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Tu Cotización Está Lista</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">{{firstName}}, hemos preparado una propuesta especial para ti</p>
            </div>
            
            <div style="padding: 30px 20px; background: white;">
              <h2 style="color: #333; margin-bottom: 20px;">Detalles de tu viaje:</h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Destino:</strong> {{destination}}</p>
                <p style="margin: 5px 0;"><strong>Fechas:</strong> {{departureDate}} - {{returnDate}}</p>
                <p style="margin: 5px 0;"><strong>Viajeros:</strong> {{travelers}} personas</p>
                <!-- Corregido: Sintaxis correcta sin espacios extra -->
                <p style="margin: 5px 0;"><strong>Precio total:</strong> ${{ totalPrice }}</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Hemos incluido vuelos, alojamiento y las mejores experiencias en tu destino. Esta cotización es válida por 7 días.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
                  Confirmar Reserva
                </a>
                <a href="#" style="background: transparent; color: #f5576c; padding: 15px 30px; text-decoration: none; border-radius: 5px; border: 2px solid #f5576c; font-weight: bold;">
                  Ver Detalles
                </a>
              </div>
            </div>
          </div>
        `,
        variables: [
          "firstName",
          "destination",
          "departureDate",
          "returnDate",
          "travelers",
          "totalPrice",
        ],
      },
      {
        name: "Seguimiento Post-Viaje",
        subject: "¿Cómo estuvo tu viaje a {{destination}}, {{firstName}}?",
        category: "POST_TRIP",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">¡Esperamos que hayas disfrutado!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">{{firstName}}, queremos saber de tu experiencia</p>
            </div>
            
            <div style="padding: 30px 20px; background: white;">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Esperamos que tu viaje a {{destination}} haya sido increíble. Tu opinión es muy importante para nosotros y nos ayuda a mejorar nuestros servicios.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Dejar Reseña
                </a>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Como agradecimiento por tu confianza, tenemos una sorpresa especial: <strong>15% de descuento</strong> en tu próxima reserva.
              </p>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="font-size: 18px; font-weight: bold; color: #1976d2; margin: 0;">Código: VIAJERO15</p>
                <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">Válido hasta {{expirationDate}}</p>
              </div>
            </div>
          </div>
        `,
        variables: ["firstName", "destination", "expirationDate"],
      },
      {
        name: "Oferta Estacional",
        subject: "🌴 Ofertas de {{season}} - Hasta {{discount}}% OFF",
        category: "SEASONAL",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px;">🌴 Ofertas de {{season}}</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Hasta {{discount}}% de descuento en destinos seleccionados</p>
            </div>
            
            <div style="padding: 30px 20px; background: white;">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                ¡Hola {{firstName}}! No pierdas esta oportunidad única de viajar a precios increíbles.
              </p>
              
              <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #e65100; margin-top: 0;">Destinos en Oferta:</h3>
                <ul style="color: #333; line-height: 1.8;">
                  <li>{{destination1}} - {{discount1}}% OFF</li>
                  <li>{{destination2}} - {{discount2}}% OFF</li>
                  <li>{{destination3}} - {{discount3}}% OFF</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Estas ofertas son por tiempo limitado y sujetas a disponibilidad. ¡Reserva ahora!
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Ver Todas las Ofertas
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; text-align: center;">
                Oferta válida hasta {{validUntil}} o hasta agotar stock
              </p>
            </div>
          </div>
        `,
        variables: [
          "firstName",
          "season",
          "discount",
          "destination1",
          "discount1",
          "destination2",
          "discount2",
          "destination3",
          "discount3",
          "validUntil",
        ],
      },
    ];
  }
}

export const emailService = new EmailService();
