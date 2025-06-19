import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { AppError, NotFoundError } from "../utils/errors";
import { Prisma } from "@prisma/client";

export interface CreateCampaignDto {
  name: string;
  type: "EMAIL" | "SMS" | "WHATSAPP";
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
  scheduledDate?: Date;
  timezone: string;
}

export interface CampaignFilters {
  status?: string[];
  type?: string[];
  createdById?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class CampaignService {
  async create(data: CreateCampaignDto, userId: string) {
    try {
      // Calcular audiencia objetivo
      const targetContacts = await this.calculateTargetAudience(
        data.targetCriteria
      );

      const campaign = await prisma.$transaction(async (tx) => {
        // Crear campaña
        const newCampaign = await tx.campaign.create({
          data: {
            ...data,
            targetCriteria: data.targetCriteria as any,
            recipientCount: targetContacts.length,
            createdById: userId,
          },
          include: {
            template: true,
          },
        });

        // Crear registros de destinatarios
        if (targetContacts.length > 0) {
          await tx.campaignRecipient.createMany({
            data: targetContacts.map((contact) => ({
              campaignId: newCampaign.id,
              contactId: contact.id,
            })),
          });
        }

        // Registrar actividad
        await tx.activity.create({
          data: {
            type: "campaign_created",
            description: `Campaña "${newCampaign.name}" creada con ${targetContacts.length} destinatarios`,
            userId,
            metadata: {
              campaignId: newCampaign.id,
              recipientCount: targetContacts.length,
            },
          },
        });

        return newCampaign;
      });

      logger.info(`Campaign created: ${campaign.id} by user: ${userId}`);
      return campaign;
    } catch (error) {
      logger.error("Error creating campaign:", error);
      throw error;
    }
  }

  async findAll(filters: CampaignFilters = {}) {
    const {
      page = 1,
      pageSize = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      ...filterParams
    } = filters;

    // Construir filtros
    const where: Prisma.CampaignWhereInput = {};

    if (filterParams.status && filterParams.status.length > 0) {
      where.status = { in: filterParams.status as any };
    }

    if (filterParams.type && filterParams.type.length > 0) {
      where.type = { in: filterParams.type as any };
    }

    if (filterParams.createdById) {
      where.createdById = filterParams.createdById;
    }

    if (filterParams.dateFrom || filterParams.dateTo) {
      where.createdAt = {
        ...(filterParams.dateFrom && { gte: filterParams.dateFrom }),
        ...(filterParams.dateTo && { lte: filterParams.dateTo }),
      };
    }

    const [total, campaigns] = await Promise.all([
      prisma.campaign.count({ where }),
      prisma.campaign.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              recipients: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
    ]);

    return {
      items: campaigns,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        template: true,
        recipients: {
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
              },
            },
          },
          take: 100, // Limitar para performance
        },
        _count: {
          select: {
            recipients: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundError("Campaign");
    }

    return campaign;
  }

  async update(id: string, data: Partial<CreateCampaignDto>, userId: string) {
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      throw new NotFoundError("Campaign");
    }

    // No permitir editar campañas ya enviadas
    if (existingCampaign.status === "SENT") {
      throw new AppError("Cannot edit sent campaigns", 400);
    }

    const campaign = await prisma.$transaction(async (tx) => {
      // Si se actualizan los criterios, recalcular audiencia
      let recipientCount = existingCampaign.recipientCount;
      if (data.targetCriteria) {
        const targetContacts = await this.calculateTargetAudience(
          data.targetCriteria
        );
        recipientCount = targetContacts.length;

        // Eliminar destinatarios existentes
        await tx.campaignRecipient.deleteMany({
          where: { campaignId: id },
        });

        // Crear nuevos destinatarios
        if (targetContacts.length > 0) {
          await tx.campaignRecipient.createMany({
            data: targetContacts.map((contact) => ({
              campaignId: id,
              contactId: contact.id,
            })),
          });
        }
      }

      // Actualizar campaña
      const updatedCampaign = await tx.campaign.update({
        where: { id },
        data: {
          ...data,
          ...(data.targetCriteria && {
            targetCriteria: data.targetCriteria as any,
            recipientCount,
          }),
        },
        include: {
          template: true,
        },
      });

      // Registrar actividad
      await tx.activity.create({
        data: {
          type: "campaign_updated",
          description: `Campaña "${updatedCampaign.name}" actualizada`,
          userId,
          metadata: {
            campaignId: id,
            changes: Object.keys(data),
          },
        },
      });

      return updatedCampaign;
    });

    logger.info(`Campaign updated: ${id} by user: ${userId}`);
    return campaign;
  }

  async delete(id: string, userId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundError("Campaign");
    }

    // No permitir eliminar campañas ya enviadas
    if (campaign.status === "SENT") {
      throw new AppError("Cannot delete sent campaigns", 400);
    }

    await prisma.$transaction(async (tx) => {
      // Eliminar destinatarios
      await tx.campaignRecipient.deleteMany({
        where: { campaignId: id },
      });

      // Eliminar campaña
      await tx.campaign.delete({
        where: { id },
      });

      // Registrar actividad
      await tx.activity.create({
        data: {
          type: "campaign_deleted",
          description: `Campaña "${campaign.name}" eliminada`,
          userId,
          metadata: {
            campaignId: id,
            campaignName: campaign.name,
          },
        },
      });
    });

    logger.info(`Campaign deleted: ${id} by user: ${userId}`);
  }

  async sendCampaign(id: string, userId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        recipients: {
          include: {
            contact: true,
          },
        },
        template: true,
      },
    });

    if (!campaign) {
      throw new NotFoundError("Campaign");
    }

    if (campaign.status !== "DRAFT" && campaign.status !== "SCHEDULED") {
      throw new AppError("Campaign is not in a sendable state", 400);
    }

    if (campaign.recipients.length === 0) {
      throw new AppError("Campaign has no recipients", 400);
    }

    // Actualizar estado a enviando
    await prisma.campaign.update({
      where: { id },
      data: {
        status: "SENDING",
        sentDate: new Date(),
      },
    });

    // Aquí se implementaría la lógica de envío real
    // Por ahora simulamos el envío
    try {
      let sentCount = 0;
      const batchSize = 50; // Enviar en lotes para no sobrecargar

      for (let i = 0; i < campaign.recipients.length; i += batchSize) {
        const batch = campaign.recipients.slice(i, i + batchSize);

        // Simular envío de lote
        await this.sendEmailBatch(campaign, batch);
        sentCount += batch.length;

        // Actualizar progreso
        await prisma.campaign.update({
          where: { id },
          data: { sentCount },
        });

        // Pequeña pausa entre lotes
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Actualizar estado final
      await prisma.campaign.update({
        where: { id },
        data: {
          status: "SENT",
          sentCount,
        },
      });

      logger.info(`Campaign sent: ${id}, recipients: ${sentCount}`);
      return { success: true, sentCount };
    } catch (error) {
      // En caso de error, marcar como fallida
      await prisma.campaign.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      logger.error(`Campaign send failed: ${id}`, error);
      throw new AppError("Failed to send campaign", 500);
    }
  }

  async duplicateCampaign(id: string, userId: string) {
    const originalCampaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!originalCampaign) {
      throw new NotFoundError("Campaign");
    }

    const duplicateData: CreateCampaignDto = {
      name: `${originalCampaign.name} (Copia)`,
      type: originalCampaign.type,
      subject: originalCampaign.subject,
      content: originalCampaign.content,
      templateId: originalCampaign.templateId,
      targetCriteria: originalCampaign.targetCriteria as any,
      useAiPersonalization: originalCampaign.useAiPersonalization,
      timezone: originalCampaign.timezone,
    };

    return this.create(duplicateData, userId);
  }

  async getStats(id: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        recipients: true,
      },
    });

    if (!campaign) {
      throw new NotFoundError("Campaign");
    }

    const stats = {
      totalRecipients: campaign.recipientCount,
      sent: campaign.sentCount,
      opened: campaign.openCount,
      clicked: campaign.clickCount,
      converted: campaign.conversionCount,
      openRate:
        campaign.sentCount > 0
          ? (campaign.openCount / campaign.sentCount) * 100
          : 0,
      clickRate:
        campaign.sentCount > 0
          ? (campaign.clickCount / campaign.sentCount) * 100
          : 0,
      conversionRate:
        campaign.sentCount > 0
          ? (campaign.conversionCount / campaign.sentCount) * 100
          : 0,
    };

    return stats;
  }

  private async calculateTargetAudience(criteria: any) {
    const where: Prisma.ContactWhereInput = {};

    if (criteria.status && criteria.status.length > 0) {
      where.status = { in: criteria.status };
    }

    if (criteria.tags && criteria.tags.length > 0) {
      where.tags = { hasSome: criteria.tags };
    }

    if (criteria.source && criteria.source.length > 0) {
      where.source = { in: criteria.source };
    }

    if (criteria.budgetRange && criteria.budgetRange.length > 0) {
      where.budgetRange = { in: criteria.budgetRange };
    }

    if (criteria.assignedAgentId) {
      where.assignedAgentId = criteria.assignedAgentId;
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

    const contacts = await prisma.contact.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return contacts;
  }

  private async sendEmailBatch(campaign: any, recipients: any[]) {
    // Aquí se implementaría la integración con el servicio de email
    // Por ahora simulamos el envío

    for (const recipient of recipients) {
      try {
        // Simular envío de email
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Marcar como enviado
        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            sent: true,
            sentAt: new Date(),
          },
        });
      } catch (error) {
        logger.error(`Failed to send to recipient: ${recipient.id}`, error);
      }
    }
  }
}
