import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { NotFoundError, AppError } from "../utils/errors";
import * as nodemailer from "nodemailer";
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

class EmailServiceClass {
  private transporter: nodemailer.Transporter;
  private genAI: GoogleGenerativeAI;

  constructor() {
    // CORREGIDO: Usar createTransport en lugar de createTransporter
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.auth,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });

    // Verificar configuración
    this.transporter.verify((error) => {
      if (error) {
        logger.error("SMTP Configuration Error:", error);
      } else {
        logger.info("SMTP Server ready to take our messages");
      }
    });

    // CORREGIDO: Usar createTransport en lugar de createTransporter
    this.transporter = nodemailer.createTransport({
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

    const {
      id: _,
      createdAt,
      updatedAt,
      usageCount,
      ...templateData
    } = originalTemplate;

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
        htmlContent = this.processTemplate(
          template.htmlContent,
          request.variables || {}
        );
        textContent = template.textContent
          ? this.processTemplate(template.textContent, request.variables || {})
          : undefined;
        subject = this.processTemplate(
          template.subject,
          request.variables || {}
        );

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
        // CORREGIDO: Verificar que tenemos al menos un tracking ID
        const primaryTrackingId =
          trackingIds.length > 0 ? trackingIds[0] : uuidv4();
        if (primaryTrackingId) {
          htmlContent = this.addTracking(
            htmlContent,
            primaryTrackingId,
            request.trackOpens,
            request.trackClicks
          );
        }
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
          // CORREGIDO: Verificar que request.variables no es undefined y que email es válido
          if (
            request.variables &&
            typeof email === "string" &&
            request.variables[email]
          ) {
            personalizedHtml = this.processTemplate(
              htmlContent,
              request.variables[email]
            );
            personalizedSubject = this.processTemplate(
              subject,
              request.variables[email]
            );
          }

          // Reemplazar tracking ID específico
          if (trackingId) {
            personalizedHtml = personalizedHtml.replace(
              /{{TRACKING_ID}}/g,
              trackingId
            );
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

          logger.info(`Email sent successfully to ${email}`, {
            messageId: info.messageId,
          });
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
        totalSent: results.filter((r) => r.success).length,
        totalFailed: results.filter((r) => !r.success).length,
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
    // Crear campaña - CORREGIDO: Agregar campo 'content' requerido
    const template = await this.getTemplate(request.templateId);

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
        // CORREGIDO: Agregar campo content requerido
        content: template.htmlContent,
        subject: template.subject,
      },
    });

    // Obtener contactos según criterios
    const contacts = await this.getTargetContacts(request.targetCriteria);

    // Crear registros de destinatarios
    await prisma.campaignRecipient.createMany({
      data: contacts.map((contact) => ({
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

        // CORREGIDO: Verificar que result y results existen antes de acceder
        if (
          result &&
          result.results &&
          result.results.length > 0 &&
          result.results[0].success
        ) {
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
        logger.error(
          `Failed to send campaign email to ${recipient.contact.email}:`,
          error
        );
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
  private async personalizeWithAI(
    content: string,
    contact: any
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: config.gemini.model,
      });

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
  private processTemplate(
    content: string,
    variables: Record<string, any>
  ): string {
    let processed = content;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      processed = processed.replace(regex, String(value || ""));
    });

    return processed;
  }

  // Agregar tracking al contenido
  private addTracking(
    html: string,
    trackingId: string,
    trackOpens = true,
    trackClicks = true
  ): string {
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
        } as any,
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

    if (
      activity &&
      activity.metadata &&
      typeof activity.metadata === "object"
    ) {
      // CORREGIDO: Manejo seguro de metadata
      const currentMetadata = activity.metadata as any;

      await prisma.activity.update({
        where: { id: activity.id },
        data: {
          metadata: {
            ...currentMetadata,
            opened: true,
            openedAt: new Date(),
          } as any,
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

    if (
      activity &&
      activity.metadata &&
      typeof activity.metadata === "object"
    ) {
      // CORREGIDO: Manejo seguro de metadata
      const currentMetadata = activity.metadata as any;

      await prisma.activity.update({
        where: { id: activity.id },
        data: {
          metadata: {
            ...currentMetadata,
            clicked: true,
            clickedAt: new Date(),
            clickedUrl: url,
          } as any,
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
    const sentCount = campaign.recipients.filter((r) => r.sent).length;
    const openedCount = campaign.recipients.filter((r) => r.opened).length;
    const clickedCount = campaign.recipients.filter((r) => r.clicked).length;

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
      items: items.map((activity) => {
        // CORREGIDO: Manejo seguro de metadata
        const metadata = activity.metadata as any;

        return {
          id: activity.id,
          to: metadata?.to || activity.contact?.email,
          subject: activity.description.replace("Email enviado: ", ""),
          templateId: metadata?.templateId,
          status: metadata?.status || "sent",
          sentAt: activity.createdAt,
          openedAt: metadata?.openedAt,
          clickedAt: metadata?.clickedAt,
          error: metadata?.error,
          sentBy: activity.user,
          contact: activity.contact,
        };
      }),
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
}

// Crear una instancia única del servicio
export const emailService = new EmailServiceClass();
