import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { NotFoundError } from "../utils/errors"; // CORREGIDO: Remover AppError no usado

export interface CreateTripDto {
  contactId: string;
  destination: string;
  departureDate: Date;
  returnDate: Date;
  travelers: number;
  estimatedBudget: number;
  finalPrice?: number;
  commission?: number;
  includesFlight?: boolean;
  includesHotel?: boolean;
  includesTransfer?: boolean;
  includesTours?: boolean;
  includesInsurance?: boolean;
  customServices?: string[];
  notes?: string;
  internalNotes?: string;
}

export interface TripFilter {
  status?: string[];
  contactId?: string;
  destination?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class TripService {
  async create(data: CreateTripDto, userId: string) {
    try {
      // Verify contact exists
      const contact = await prisma.contact.findUnique({
        where: { id: data.contactId },
      });

      if (!contact) {
        throw new NotFoundError("Contact");
      }

      const trip = await prisma.$transaction(async (tx) => {
        // Create trip
        const newTrip = await tx.trip.create({
          data: {
            ...data,
            status: "QUOTE",
          },
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        // Create activity log
        await tx.activity.create({
          data: {
            type: "trip_created",
            description: `Trip to ${newTrip.destination} created for ${contact.firstName} ${contact.lastName}`,
            userId,
            contactId: data.contactId,
            tripId: newTrip.id,
            metadata: {
              destination: newTrip.destination,
              travelers: newTrip.travelers,
              estimatedBudget: newTrip.estimatedBudget,
            },
          },
        });

        return newTrip;
      });

      logger.info(`Trip created: ${trip.id} by user: ${userId}`);
      return trip;
    } catch (error) {
      logger.error("Error creating trip:", error);
      throw error;
    }
  }

  async findAll(filters: TripFilter = {}) {
    const {
      page = 1,
      pageSize = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      ...filterParams
    } = filters;

    // Build where clause
    const where: Prisma.TripWhereInput = {};

    if (filterParams.status && filterParams.status.length > 0) {
      where.status = { in: filterParams.status as any };
    }

    if (filterParams.contactId) {
      where.contactId = filterParams.contactId;
    }

    if (filterParams.destination) {
      where.destination = {
        contains: filterParams.destination,
        mode: "insensitive",
      };
    }

    if (filterParams.dateFrom || filterParams.dateTo) {
      where.departureDate = {
        ...(filterParams.dateFrom && { gte: filterParams.dateFrom }),
        ...(filterParams.dateTo && { lte: filterParams.dateTo }),
      };
    }

    if (filterParams.search) {
      where.OR = [
        { destination: { contains: filterParams.search, mode: "insensitive" } },
        {
          contact: {
            OR: [
              {
                firstName: {
                  contains: filterParams.search,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: filterParams.search,
                  mode: "insensitive",
                },
              },
              { email: { contains: filterParams.search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [total, trips] = await Promise.all([
      prisma.trip.count({ where }),
      prisma.trip.findMany({
        where,
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paidAt: true,
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
      items: trips,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        documents: {
          orderBy: { createdAt: "desc" },
        },
        activities: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!trip) {
      throw new NotFoundError("Trip");
    }

    return trip;
  }

  async update(id: string, data: Partial<CreateTripDto>, userId: string) {
    const existingTrip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      throw new NotFoundError("Trip");
    }

    const trip = await prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id },
        data,
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Create activity log
      await tx.activity.create({
        data: {
          type: "trip_updated",
          description: `Trip to ${updatedTrip.destination} updated`,
          userId,
          contactId: updatedTrip.contactId,
          tripId: updatedTrip.id,
          metadata: {
            changes: Object.keys(data),
          },
        },
      });

      return updatedTrip;
    });

    logger.info(`Trip updated: ${id} by user: ${userId}`);
    return trip;
  }

  async updateStatus(id: string, status: string, userId: string) {
    const trip = await prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: { status: status as any },
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Create activity log
      await tx.activity.create({
        data: {
          type: "trip_status_changed",
          description: `Trip status changed to ${status}`,
          userId,
          contactId: updatedTrip.contactId,
          tripId: updatedTrip.id,
          metadata: {
            newStatus: status,
          },
        },
      });

      return updatedTrip;
    });

    logger.info(`Trip status updated: ${id} to ${status} by user: ${userId}`);
    return trip;
  }

  async delete(id: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        contact: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundError("Trip");
    }

    await prisma.$transaction(async (tx) => {
      // Create activity log before deletion
      await tx.activity.create({
        data: {
          type: "trip_deleted",
          description: `Trip to ${trip.destination} deleted`,
          userId,
          contactId: trip.contactId,
          metadata: {
            tripId: id,
            destination: trip.destination,
          },
        },
      });

      // Delete trip (cascades to related records)
      await tx.trip.delete({
        where: { id },
      });
    });

    logger.info(`Trip deleted: ${id} by user: ${userId}`);
  }

  // CORREGIDO: Remover parámetro userId no usado
  async getStats() {
    const [
      totalTrips,
      activeTrips,
      completedTrips,
      totalRevenue,
      monthlyRevenue,
      upcomingDepartures,
    ] = await Promise.all([
      prisma.trip.count(),
      prisma.trip.count({
        where: {
          status: { in: ["BOOKED", "CONFIRMED"] },
        },
      }),
      prisma.trip.count({
        where: { status: "COMPLETED" },
      }),
      prisma.trip.aggregate({
        _sum: { finalPrice: true },
        where: { status: "COMPLETED" },
      }),
      prisma.trip.aggregate({
        _sum: { finalPrice: true },
        where: {
          status: "COMPLETED",
          updatedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.trip.count({
        where: {
          departureDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
        },
      }),
    ]);

    // Top destinations
    const topDestinations = await prisma.trip.groupBy({
      by: ["destination"],
      _count: true,
      orderBy: {
        _count: {
          destination: "desc",
        },
      },
      take: 5,
    });

    return {
      totalTrips,
      activeTrips,
      completedTrips,
      totalRevenue: totalRevenue._sum.finalPrice || 0,
      monthlyRevenue: monthlyRevenue._sum.finalPrice || 0,
      upcomingDepartures,
      topDestinations: topDestinations.map((dest) => ({
        destination: dest.destination,
        count: dest._count,
      })),
    };
  }
}
