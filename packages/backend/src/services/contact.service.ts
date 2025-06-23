import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
// Mantener las importaciones como están según tu instrucción
import {
  ContactWithRelations,
  ContactFilter,
  CreateContactDto,
  PaginatedResponse,
} from "../../../shared/src/types/index";
import {
  ContactStatus,
  BudgetRange,
  ContactSource,
  TravelStyle,
} from "../../../shared/src/types/enums";
import { NotFoundError, ConflictError } from "../utils/errors";
import { logger } from "../utils/logger";

export class ContactService {
  async create(
    data: CreateContactDto,
    userId: string
  ): Promise<ContactWithRelations> {
    try {
      // Check if email already exists
      const existingContact = await prisma.contact.findUnique({
        where: { email: data.email },
      });

      if (existingContact) {
        throw new ConflictError("Contact with this email already exists");
      }

      // Create contact with activity log
      const contact = await prisma.$transaction(async (tx) => {
        // CORREGIDO: Usar la relación correcta 'assignedAgent' en lugar de 'assignedAgentId'
        const createData: Prisma.ContactCreateInput = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          status: (data.status as ContactStatus) || ContactStatus.INTERESADO,
          source: data.source ? (data.source as ContactSource) : undefined,
          budgetRange: data.budgetRange
            ? (data.budgetRange as BudgetRange)
            : undefined,
          travelStyle: data.travelStyle
            ? (data.travelStyle as TravelStyle[])
            : undefined,
          preferredDestinations: data.preferredDestinations,
          tags: data.tags,
          // CORREGIDO: Usar la relación 'assignedAgent' en lugar de 'assignedAgentId'
          assignedAgent: data.assignedAgentId
            ? { connect: { id: data.assignedAgentId } }
            : undefined,
          createdBy: userId ? { connect: { id: userId } } : undefined,
        };

        // Remover campos undefined
        Object.keys(createData).forEach((key) => {
          if (createData[key as keyof typeof createData] === undefined) {
            delete createData[key as keyof typeof createData];
          }
        });

        const newContact = await tx.contact.create({
          data: createData,
          include: {
            assignedAgent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            trips: {
              select: {
                id: true,
                destination: true,
                status: true,
                departureDate: true,
              },
              orderBy: {
                departureDate: "desc",
              },
            },
          },
        });

        // Create activity log
        await tx.activity.create({
          data: {
            type: "contact_created",
            description: `Contact ${newContact.firstName} ${newContact.lastName} created`,
            userId,
            contactId: newContact.id,
            metadata: {
              email: newContact.email,
              source: newContact.source,
            },
          },
        });

        return newContact;
      });

      logger.info(`Contact created: ${contact.id} by user: ${userId}`);
      return this.mapToContactWithRelations(contact);
    } catch (error) {
      logger.error("Error creating contact:", error);
      throw error;
    }
  }

  async findById(id: string): Promise<ContactWithRelations> {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        trips: {
          select: {
            id: true,
            destination: true,
            status: true,
            departureDate: true,
          },
          orderBy: {
            departureDate: "desc",
          },
        },
        activities: {
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!contact) {
      throw new NotFoundError("Contact");
    }

    return this.mapToContactWithRelations(contact);
  }

  async findAll(
    filter: ContactFilter & {
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<PaginatedResponse<ContactWithRelations>> {
    const {
      page = 1,
      pageSize = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      ...filterParams
    } = filter;

    // Build where clause
    const where: Prisma.ContactWhereInput = {};

    if (filterParams.search) {
      where.OR = [
        { firstName: { contains: filterParams.search, mode: "insensitive" } },
        { lastName: { contains: filterParams.search, mode: "insensitive" } },
        { email: { contains: filterParams.search, mode: "insensitive" } },
        { phone: { contains: filterParams.search, mode: "insensitive" } },
      ];
    }

    if (filterParams.status) {
      where.status = Array.isArray(filterParams.status)
        ? { in: filterParams.status as ContactStatus[] }
        : (filterParams.status as ContactStatus);
    }

    if (filterParams.assignedAgentId) {
      where.assignedAgentId = filterParams.assignedAgentId;
    }

    if (filterParams.tags && filterParams.tags.length > 0) {
      where.tags = { hasSome: filterParams.tags };
    }

    if (filterParams.source) {
      where.source = Array.isArray(filterParams.source)
        ? { in: filterParams.source as ContactSource[] }
        : (filterParams.source as ContactSource);
    }

    if (filterParams.budgetRange) {
      where.budgetRange = Array.isArray(filterParams.budgetRange)
        ? { in: filterParams.budgetRange as BudgetRange[] }
        : (filterParams.budgetRange as BudgetRange);
    }

    if (filterParams.dateFrom || filterParams.dateTo) {
      where.createdAt = {
        ...(filterParams.dateFrom && { gte: filterParams.dateFrom }),
        ...(filterParams.dateTo && { lte: filterParams.dateTo }),
      };
    }

    // Execute query
    const [total, contacts] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where,
        include: {
          assignedAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          trips: {
            select: {
              id: true,
              destination: true,
              status: true,
              departureDate: true,
            },
            orderBy: {
              departureDate: "desc",
            },
          },
          activities: {
            select: {
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
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
      items: contacts.map((contact) => this.mapToContactWithRelations(contact)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async update(
    id: string,
    data: Partial<CreateContactDto>,
    userId: string
  ): Promise<ContactWithRelations> {
    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!existingContact) {
      throw new NotFoundError("Contact");
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== existingContact.email) {
      const emailExists = await prisma.contact.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new ConflictError("Email already in use");
      }
    }

    // Update contact with activity log
    const contact = await prisma.$transaction(async (tx) => {
      const updateData: Prisma.ContactUpdateInput = {};

      // Solo agregar campos que están presentes en data
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.status !== undefined)
        updateData.status = data.status as ContactStatus;
      if (data.source !== undefined)
        updateData.source = data.source as ContactSource;
      if (data.budgetRange !== undefined)
        updateData.budgetRange = data.budgetRange as BudgetRange;
      if (data.travelStyle !== undefined)
        updateData.travelStyle = data.travelStyle as TravelStyle[];
      if (data.preferredDestinations !== undefined)
        updateData.preferredDestinations = data.preferredDestinations;
      if (data.tags !== undefined) updateData.tags = data.tags;
      // CORREGIDO: Usar la relación 'assignedAgent' en lugar de 'assignedAgentId'
      if (data.assignedAgentId !== undefined) {
        updateData.assignedAgent = data.assignedAgentId
          ? { connect: { id: data.assignedAgentId } }
          : { disconnect: true };
      }

      const updatedContact = await tx.contact.update({
        where: { id },
        data: updateData,
        include: {
          assignedAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          trips: {
            select: {
              id: true,
              destination: true,
              status: true,
              departureDate: true,
            },
            orderBy: {
              departureDate: "desc",
            },
          },
        },
      });

      // Create activity log
      await tx.activity.create({
        data: {
          type: "contact_updated",
          description: `Contact ${updatedContact.firstName} ${updatedContact.lastName} updated`,
          userId,
          contactId: updatedContact.id,
          metadata: {
            changes: Object.keys(data),
          },
        },
      });

      return updatedContact;
    });

    logger.info(`Contact updated: ${id} by user: ${userId}`);
    return this.mapToContactWithRelations(contact);
  }

  async updateStatus(
    id: string,
    status: ContactStatus,
    userId: string,
    reason?: string
  ): Promise<ContactWithRelations> {
    const contact = await prisma.$transaction(async (tx) => {
      const updatedContact = await tx.contact.update({
        where: { id },
        data: { status },
        include: {
          assignedAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          trips: {
            select: {
              id: true,
              destination: true,
              status: true,
              departureDate: true,
            },
            orderBy: {
              departureDate: "desc",
            },
          },
        },
      });

      // Create activity log
      await tx.activity.create({
        data: {
          type: "status_changed",
          description: `Status changed to ${status}`,
          userId,
          contactId: id,
          metadata: {
            previousStatus: updatedContact.status,
            newStatus: status,
            reason,
          },
        },
      });

      return updatedContact;
    });

    logger.info(
      `Contact status updated: ${id} to ${status} by user: ${userId}`
    );
    return this.mapToContactWithRelations(contact);
  }

  async delete(id: string, userId: string): Promise<void> {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundError("Contact");
    }

    await prisma.$transaction(async (tx) => {
      // Create activity log before deletion
      await tx.activity.create({
        data: {
          type: "contact_deleted",
          description: `Contact ${contact.firstName} ${contact.lastName} deleted`,
          userId,
          metadata: {
            contactId: id,
            email: contact.email,
          },
        },
      });

      // Delete contact (cascades to related records)
      await tx.contact.delete({
        where: { id },
      });
    });

    logger.info(`Contact deleted: ${id} by user: ${userId}`);
  }

  async addNote(
    contactId: string,
    content: string,
    userId: string,
    isImportant = false
  ): Promise<void> {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundError("Contact");
    }

    await prisma.$transaction(async (tx) => {
      // Create note
      await tx.contactNote.create({
        data: {
          contactId,
          content,
          isImportant,
          createdById: userId,
        },
      });

      // Update last contact date
      await tx.contact.update({
        where: { id: contactId },
        data: { lastContact: new Date() },
      });

      // Create activity log
      await tx.activity.create({
        data: {
          type: "note_added",
          description: "Note added to contact",
          userId,
          contactId,
          metadata: {
            isImportant,
            notePreview: content.substring(0, 100),
          },
        },
      });
    });

    logger.info(`Note added to contact: ${contactId} by user: ${userId}`);
  }

  async bulkImport(
    contacts: CreateContactDto[],
    userId: string,
    skipDuplicates = true
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const [index, contactData] of contacts.entries()) {
      try {
        if (skipDuplicates) {
          const exists = await prisma.contact.findUnique({
            where: { email: contactData.email },
          });

          if (exists) {
            results.failed++;
            results.errors.push({
              index,
              email: contactData.email,
              error: "Email already exists",
            });
            continue;
          }
        }

        await this.create(contactData, userId);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          index,
          email: contactData.email,
          error: error.message,
        });
      }
    }

    logger.info(
      `Bulk import completed: ${results.success} success, ${results.failed} failed`
    );
    return results;
  }

  // Helper method to map database model to response type
  private mapToContactWithRelations(contact: any): ContactWithRelations {
    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      status: contact.status,
      assignedAgent: contact.assignedAgent,
      trips: contact.trips,
      lastActivity: contact.activities?.[0]?.createdAt || contact.updatedAt,
      tags: contact.tags || [],
    };
  }
}
