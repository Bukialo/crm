import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { NotFoundError, AppError } from "../utils/errors";
import nodemailer from "nodemailer";
import { config } from "../config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";

interface SendEmailRequest {
  to: string[];
  templateId?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables?: Record<string, any>;
  scheduledAt?: Date;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

interface EmailHistoryFilter {
  contactId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}

interface CampaignRequest {
  name: string;
  templateId: string;
  targetCriteria: {
    status?: string[];
    tags?: string[];
    destinations?: string[];
    budgetRange?: string[];
    lastTripDays?: number;
  };
  scheduledDate?: Date;
  useAiPersonalization?: boolean;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private genAI: GoogleGenerativeAI;

  constructor() {
    // Configurar transporter de nodemailer
    this.transporter = nodemailer.createTransporter({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.auth,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });

    // Configurar Gemini AI para personalización
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }

  // Gestión de Templates
  async getTemplates(category?: string) {
    const where = category ? { category, isActive: true } : { isActive: true };

    return await prisma.emailTemplate.findMany({
      where,
      orderBy: { usageCount: "desc" },
      select: {
        id: true,
        name: true,
        category: true,
        subject: true,
        variables: true,
        isActive: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getTemplate(id: string) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundError("Template");
    }

    return template;
  }

  async createTemplate(data: any, createdById: string) {
    return await prisma.emailTemplate.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  async updateTemplate(id: string, data: any) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundError("Template");
    }

    return await prisma.emailTemplate.update({
      where: { id },
      data,
    });
  }

  async deleteTemplate(id: string) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundError("Template");
    }

    await prisma.emailTemplate.delete({
      where: { id },
    });
  }

  async duplicateTemplate(id: string, createdById: string) {
    const originalTemplate = await this.getTemplate(id);

    const { id: _, createdAt, updatedAt, usageCount, ...templateData } = originalTemplate;

    return await this.createTemplate(
      {
        ...templateData,
        name: `${originalTemplate.name} (Copia)`,
      },
      createdById
    );
  }

  // Envío de Emails
  async sendEmail(request: SendEmailRequest, userId: string) {
    try {
      let htmlContent = request.htmlContent;
      let textContent = request.textContent;
      let subject = request.subject;

      // Si usa template, obtener y procesar
      if (request.templateId) {
        const template = await this.getTemplate(request.templateId);
        htmlContent = this.processTemplate(template.htmlContent, request.variables || {});
        textContent = template.textContent
          ? this.processTemplate(template.textContent, request.variables || {})
          : undefined;
        subject = this.processTemplate(template.subject, request.variables || {});

        // Incrementar contador de uso
        await prisma.emailTemplate.update({
          where: { id: request.templateId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Generar tracking IDs si está habilitado
      const trackingIds: string[] = [];
      if (request.trackOpens || request.trackClicks) {
        for (let i = 0; i < request.to.length; i++) {
          trackingIds.push(uuidv4());
        }
      }

      // Procesar tracking en el contenido
      if (request.trackOpens || request.trackClicks) {
        htmlContent = this.addTracking(htmlContent, trackingIds[0], request.trackOpens, request.trackClicks);
      }

      // Enviar emails
      const results = [];
      for (let i = 0; i < request.to.length; i++) {
        const email = request.to[i];
        const trackingId = trackingIds[i];

        try {
          let personalizedHtml = htmlContent;
          let personalizedSubject = subject;

          // Personalización por destinatario si hay variables específicas
          if (request.variables && request.variables[email]) {
            personalizedHtml = this.processTemplate(htmlContent, request.variables[email]);
            personalizedSubject = this.processTemplate(subject, request.variables[email]);
          }

          // Reemplazar tracking ID específico
          if (trackingId) {
            personalizedHtml = personalizedHtml.replace(/{{TRACKING_ID}}/g, trackingId);
          }

          const info = await this.transporter.sendMail({
            from: config.email.from,
            to: email,
            subject: personalizedSubject,
            html: personalizedHtml,
            text: textContent,
          });

          // Crear registro en historial
          await this.createEmailHistory({
            to: email,
            subject: personalizedSubject,
            templateId: request.templateId,
            status: "sent",
            messageId: info.messageId,
            trackingId,
            sentById: userId,
          });

          results.push({
            email,
            success: true,
            messageId: info.messageId,
          });

          logger.info(`Email sent successfully to ${email}`, { messageId: info.messageId });
        } catch (error) {
          logger.error(`Failed to send email to ${email}:`, error);

          // Crear registro de error
          await this.createEmailHistory({
            to: email,
            subject: subject,
            templateId: request.templateId,
            status: "failed",
            error: (error as Error).message,
            sentById: userId,
          });

          results.push({
            email,
            success: false,
            error: (error as Error).message,
          });
        }
      }

      return {
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
        results,
      };
    } catch (error) {
      logger.error("Email sending failed:", error);
      throw new AppError("Error al enviar email");
    }
  }

  async sendTestEmail(request: SendEmailRequest, userId: string) {
    return await this.sendEmail(
      {
        ...request,
        subject: `[TEST] ${request.subject}`,
      },
      userId
    );
  }

  // Campañas
  async sendCampaign(request: CampaignRequest, userId: string) {
    // Crear campaña
    const campaign = await prisma.campaign.create({
      data: {
        name: request.name,
        type: "EMAIL",
        status: request.scheduledDate ? "SCHEDULED" : "SENDING",
        targetCriteria: request.targetCriteria,
        templateId: request.templateId,
        useAiPersonalization: request.useAiPersonalization || false,
        scheduledDate: request.scheduledDate,
        createdById: userId,
      },
    });

    // Obtener contactos según criterios
    const contacts = await this.getTargetContacts(request.targetCriteria);

    // Crear registros de destinatarios
    await prisma.campaignRecipient.createMany({
      data: contacts.map(contact => ({
        campaignId: campaign.id,
        contactId: contact.id,
      })),
    });

    // Actualizar contador de destinatarios
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { recipientCount: contacts.length },
    });

    // Si no está programada, enviar inmediatamente
    if (!request.scheduledDate) {
      await this.processCampaign(campaign.id);
    }

    return campaign;
  }

  async processCampaign(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        template: true,
        recipients: {
          where: { sent: false },
          include: { contact: true },
        },
      },
    });

    if (!campaign || !campaign.template) {
      throw new NotFoundError("Campaign or template");
    }

    // Marcar como enviando
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "SENDING" },
    });

    let sentCount = 0;

    for (const recipient of campaign.recipients) {
      try {
        // Preparar variables para personalización
        const variables = {
          firstName: recipient.contact.firstName,
          lastName: recipient.contact.lastName,
          email: recipient.contact.email,
          status: recipient.contact.status,
        };

        // Personalización con IA si está habilitada
        let personalizedContent = campaign.template.htmlContent;
        if (campaign.useAiPersonalization) {
          personalizedContent = await this.personalizeWithAI(
            campaign.template.htmlContent,
            recipient.contact
          );
        }

        // Enviar email
        const result = await this.sendEmail(
          {
            to: [recipient.contact.email],
            templateId: campaign.templateId!,
            subject: campaign.template.subject,
            htmlContent: personalizedContent,
            variables,
            trackOpens: true,
            trackClicks: true,
          },
          campaign.createdById
        );

        if (result.results[0].success) {
          // Marcar como enviado
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              sent: true,
              sentAt: new Date(),
              personalizedContent,
            },
          });

          sentCount++;
        }
      } catch (error) {
        logger.error(`Failed to send campaign email to ${recipient.contact.email}:`, error);
      }
    }

    // Actualizar estadísticas de campaña
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "SENT",
        sentDate: new Date(),
        sentCount,
      },
    });

    return { sentCount };
  }

  // Personalización con IA
  private async personalizeWithAI(content: string, contact: any): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: config.gemini.model });

      const prompt = `
        Personaliza este email para el cliente basándote en su información:
        
        Cliente: ${contact.firstName} ${contact.lastName}
        Estado: ${contact.status}
        Destinos preferidos: ${contact.preferredDestinations?.join(", ") || "No especificado"}
        Presupuesto: ${contact.budgetRange || "No especificado"}
        
        Email original:
        ${content}
        
        Instrucciones:
        1. Mantén la estructura HTML original
        2. Personaliza el saludo y contenido según el perfil del cliente
        3. Adapta las recomendaciones según sus preferencias
        4. Mantén un tono profesional pero cálido
        5. NO agregues información que no esté en el perfil del cliente
        
        Devuelve solo el HTML personalizado:
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || content;
    } catch (error) {
      logger.error("AI personalization failed:", error);
      return content; // Fallback al contenido original
    }
  }

  // Obtener contactos según criterios
  private async getTargetContacts(criteria: any) {
    const where: any = {};

    if (criteria.status && criteria.status.length > 0) {
      where.status = { in: criteria.status };
    }

    if (criteria.tags && criteria.tags.length > 0) {
      where.tags = { hasSome: criteria.tags };
    }

    if (criteria.budgetRange && criteria.budgetRange.length > 0) {
      where.budgetRange = { in: criteria.budgetRange };
    }

    if (criteria.destinations && criteria.destinations.length > 0) {
      where.preferredDestinations = { hasSome: criteria.destinations };
    }

    if (criteria.lastTripDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - criteria.lastTripDays);
      
      where.trips = {
        some: {
          createdAt: { gte: cutoffDate },
        },
      };
    }

    return await prisma.contact.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        preferredDestinations: true,
        budgetRange: true,
      },
    });
  }

  // Procesar template con variables
  private processTemplate(content: string, variables: Record<string, any>): string {
    let processed = content;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      processed = processed.replace(regex, String(value || ""));
    });

    return processed;
  }

  // Agregar tracking al contenido
  private addTracking(html: string, trackingId: string, trackOpens = true, trackClicks = true): string {
    let trackedHtml = html.replace(/{{TRACKING_ID}}/g, trackingId);

    // Agregar pixel de tracking para apertura
    if (trackOpens) {
      const trackingPixel = `<img src="${config.cors.origin[0]}/api/emails/track/open/${trackingId}" width="1" height="1" style="display:none;" />`;
      trackedHtml += trackingPixel;
    }

    // Agregar tracking a enlaces si está habilitado
    if (trackClicks) {
      trackedHtml = trackedHtml.replace(
        /href="([^"]+)"/g,
        `href="${config.cors.origin[0]}/api/emails/track/click/${trackingId}?url=$1"`
      );
    }

    return trackedHtml;
  }

  // Crear registro en historial
  private async createEmailHistory(data: any) {
    // Implementación simplificada - en producción sería una tabla separada
    await prisma.activity.create({
      data: {
        type: "email_sent",
        description: `Email enviado: ${data.subject}`,
        userId: data.sentById,
        metadata: {
          to: data.to,
          templateId: data.templateId,
          status: data.status,
          messageId: data.messageId,
          trackingId: data.trackingId,
          error: data.error,
        },
      },
    });
  }

  // Métricas y tracking
  async trackEmailOpen(trackingId: string) {
    // Buscar el email por tracking ID en las actividades
    const activity = await prisma.activity.findFirst({
      where: {
        type: "email_sent",
        metadata: {
          path: ["trackingId"],
          equals: trackingId,
        },
      },
    });

    if (activity) {
      // Actualizar metadata para marcar como abierto
      await prisma.activity.update({
        where: { id: activity.id },
        data: {
          metadata: {
            ...activity.metadata,
            opened: true,
            openedAt: new Date(),
          },
        },
      });
    }
  }

  async trackEmailClick(trackingId: string, url: string) {
    const activity = await prisma.activity.findFirst({
      where: {
        type: "email_sent",
        metadata: {
          path: ["trackingId"],
          equals: trackingId,
        },
      },
    });

    if (activity) {
      await prisma.activity.update({
        where: { id: activity.id },
        data: {
          metadata: {
            ...activity.metadata,
            clicked: true,
            clickedAt: new Date(),
            clickedUrl: url,
          },
        },
      });
    }
  }

  async getEmailStats(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "day":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const emailActivities = await prisma.activity.findMany({
      where: {
        type: "email_sent",
        createdAt: { gte: startDate },
      },
    });

    const totalSent = emailActivities.length;
    const totalOpened = emailActivities.filter(
      (a: any) => a.metadata?.opened
    ).length;
    const totalClicked = emailActivities.filter(
      (a: any) => a.metadata?.clicked
    ).length;

    return {
      totalSent,
      totalOpened,
      totalClicked,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
    };
  }

  async getCampaigns() {
    return await prisma.campaign.findMany({
      include: {
        template: {
          select: {
            name: true,
            subject: true,
          },
        },
        _count: {
          select: {
            recipients: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getCampaignStats(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        recipients: true,
      },
    });

    if (!campaign) {
      throw new NotFoundError("Campaign");
    }

    const totalRecipients = campaign.recipients.length;
    const sentCount = campaign.recipients.filter(r => r.sent).length;
    const openedCount = campaign.recipients.filter(r => r.opened).length;
    const clickedCount = campaign.recipients.filter(r => r.clicked).length;

    return {
      totalRecipients,
      sentCount,
      openedCount,
      clickedCount,
      openRate: sentCount > 0 ? (openedCount / sentCount) * 100 : 0,
      clickRate: sentCount > 0 ? (clickedCount / sentCount) * 100 : 0,
      conversionRate: sentCount > 0 ? (clickedCount / sentCount) * 100 : 0,
    };
  }

  async getEmailHistory(filters: EmailHistoryFilter) {
    const { page = 1, pageSize = 20, ...otherFilters } = filters;
    
    const where: any = {
      type: "email_sent",
    };

    if (otherFilters.dateFrom || otherFilters.dateTo) {
      where.createdAt = {
        ...(otherFilters.dateFrom && { gte: otherFilters.dateFrom }),
        ...(otherFilters.dateTo && { lte: otherFilters.dateTo }),
      };
    }

    if (otherFilters.contactId) {
      where.contactId = otherFilters.contactId;
    }

    if (otherFilters.status) {
      where.metadata = {
        path: ["status"],
        equals: otherFilters.status,
      };
    }

    const [total, items] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          contact: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: items.map(activity => ({
        id: activity.id,
        to: activity.metadata?.to || activity.contact?.email,
        subject: activity.description.replace("Email enviado: ", ""),
        templateId: activity.metadata?.templateId,
        status: activity.metadata?.status || "sent",
        sentAt: activity.createdAt,
        openedAt: activity.metadata?.openedAt,
        clickedAt: activity.metadata?.clickedAt,
        error: activity.metadata?.error,
        sentBy: activity.user,
        contact: activity.contact,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async previewTemplate(templateId: string, variables: Record<string, any>) {
    const template = await this.getTemplate(templateId);

    const processedHtml = this.processTemplate(template.htmlContent, variables);
    const processedText = template.textContent 
      ? this.processTemplate(template.textContent, variables)
      : undefined;
    const processedSubject = this.processTemplate(template.subject, variables);

    return {
      subject: processedSubject,
      html: processedHtml,
      text: processedText,
      variables: template.variables,
    };
  }

  // Templates predefinidos
  async createDefaultTemplates(userId: string) {
    const defaultTemplates = [
      {
        name: "Bienvenida",
        category: "WELCOME",
        subject: "¡Bienvenido a Bukialo, {{firstName}}!",
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Bienvenido a Bukialo</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">✈️ Bukialo</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Tu agencia de viajes de confianza</p>
              </div>
              
              <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">¡Hola {{firstName}}!</h2>
                
                <p>Bienvenido a Bukialo, donde convertimos tus sueños de viaje en realidad.</p>
                
                <p>Tu agente asignado <strong>{{agentName}}</strong> estará en contacto contigo pronto para ayudarte a planificar tu próxima aventura.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <h3 style="margin-top: 0; color: #667eea;">¿Qué puedes esperar?</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li>Asesoría personalizada para tus viajes</li>
                    <li>Ofertas exclusivas en destinos populares</li>
                    <li>Soporte 24/7 durante tu viaje</li>
                    <li>Experiencias únicas y memorables</li>
                  </ul>
                </div>
                
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                
                <p style="margin-bottom: 0;">
                  Saludos cordiales,<br>
                  <strong>Equipo Bukialo</strong>
                </p>
              </div>
            </body>
          </html>
        `,
        textContent: `
          ¡Hola {{firstName}}!
          
          Bienvenido a Bukialo, donde convertimos tus sueños de viaje en realidad.
          
          Tu agente asignado {{agentName}} estará en contacto contigo pronto para ayudarte a planificar tu próxima aventura.
          
          ¿Qué puedes esperar?
          - Asesoría personalizada para tus viajes
          - Ofertas exclusivas en destinos populares  
          - Soporte 24/7 durante tu viaje
          - Experiencias únicas y memorables
          
          Si tienes alguna pregunta, no dudes en contactarnos.
          
          Saludos cordiales,
          Equipo Bukialo
        `,
        variables: [
          { name: "firstName", type: "text", required: true, description: "Nombre del cliente" },
          { name: "agentName", type: "text", required: true, description: "Nombre del agente asignado" },
        ],
      },
      {
        name: "Cotización de Viaje",
        category: "QUOTE",
        subject: "Tu cotización para {{destination}} está lista 🎯",
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Cotización de Viaje</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">💼 Cotización Lista</h1>
              </div>
              
              <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Hola {{firstName}},</h2>
                
                <p>¡Excelentes noticias! Tu cotización para viajar a <strong>{{destination}}</strong> está lista.</p>
                
                <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h3 style="margin-top: 0; color: #f5576c; text-align: center;">Detalles del Viaje</h3>
                  
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Destino:</strong></td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">{{destination}}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Fecha de salida:</strong></td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">{{departureDate}}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Duración:</strong></td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">{{duration}} días</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Viajeros:</strong></td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">{{travelers}} personas</td>
                    </tr>
                    <tr style="background: #f093fb; color: white;">
                      <td style="padding: 15px 10px; font-size: 18px;"><strong>Precio Total:</strong></td>
                      <td style="padding: 15px 10px; text-align: right; font-size: 24px; font-weight: bold;">${{totalPrice}}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #856404;">
                    ⏰ <strong>Esta cotización es válida por 7 días.</strong> ¡No dejes pasar esta oportunidad!
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{bookingUrl}}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                    ✈️ Reservar Ahora
                  </a>
                </div>
                
                <p>Si tienes alguna pregunta sobre esta cotización, no dudes en contactarme.</p>
                
                <p style="margin-bottom: 0;">
                  Saludos cordiales,<br>
                  <strong>{{agentName}}</strong><br>
                  <span style="color: #666;">Tu agente de viajes en Bukialo</span>
                </p>
              </div>
            </body>
          </html>
        `,
        variables: [
          { name: "firstName", type: "text", required: true },
          { name: "destination", type: "text", required: true },
          { name: "departureDate", type: "date", required: true },
          { name: "duration", type: "number", required: true },
          { name: "travelers", type: "number", required: true },
          { name: "totalPrice", type: "number", required: true },
          { name: "bookingUrl", type: "text", required: false },
          { name: "agentName", type: "text", required: true },
        ],
      },
      {
        name: "Seguimiento Post-Viaje",
        category: "POST_TRIP",
        subject: "¿Cómo estuvo tu viaje a {{destination}}? 🌟",
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Feedback de Viaje</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🌟 ¿Cómo estuvo tu viaje?</h1>
              </div>
              
              <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">¡Hola {{firstName}}!</h2>
                
                <p>Esperamos que hayas tenido un viaje increíble a <strong>{{destination}}</strong>. 🎉</p>
                
                <p>Tu opinión es muy importante para nosotros y nos ayuda a mejorar nuestros servicios para futuros viajeros.</p>
                
                <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center;">
                  <h3 style="margin-top: 0; color: #00d4ff;">Comparte tu experiencia</h3>
                  
                  <div style="margin: 20px 0;">
                    <a href="{{reviewUrl}}" style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 0 10px;">
                      ⭐ Dejar Reseña
                    </a>
                  </div>
                  
                  <p style="color: #666; margin: 0;">Solo tomará 2 minutos</p>
                </div>
                
                <div style="background: #e8f4fd; border-left: 4px solid #00d4ff; padding: 20px; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #00d4ff;">💡 ¿Sabías que...?</h4>
                  <p style="margin-bottom: 0;">Los clientes que comparten sus experiencias reciben descuentos especiales en sus próximos viajes. ¡Tu próxima aventura podría estar más cerca de lo que piensas!</p>
                </div>
                
                <p>Si tienes alguna sugerencia o comentario adicional, no dudes en responder a este email.</p>
                
                <p style="margin-bottom: 0;">
                  ¡Gracias por viajar con nosotros!<br>
                  <strong>{{agentName}}</strong><br>
                  <span style="color: #666;">Equipo Bukialo</span>
                </p>
              </div>
            </body>
          </html>
        `,
        variables: [
          { name: "firstName", type: "text", required: true },
          { name: "destination", type: "text", required: true },
          { name: "reviewUrl", type: "text", required: false },
          { name: "agentName", type: "text", required: true },
        ],
      },
    ];

    for (const templateData of defaultTemplates) {
      try {
        await this.createTemplate(templateData, userId);
        logger.info(`Default template "${templateData.name}" created`);
      } catch (error) {
        logger.warn(`Template "${templateData.name}" already exists or failed to create`);
      }
    }
  }