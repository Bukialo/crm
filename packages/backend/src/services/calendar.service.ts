import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";
import { EventType, CalendarEvent } from "@prisma/client";

export interface CreateEventDto {
  title: string;
  description?: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  timezone?: string;
  contactId?: string;
  tripId?: string;
  assignedToId: string;
  reminderMinutes?: number[];
  aiGenerated?: boolean;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  id: string;
}

export interface EventFilter {
  assignedToId?: string;
  contactId?: string;
  tripId?: string;
  type?: EventType[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface CalendarStats {
  totalEvents: number;
  upcomingEvents: number;
  overdueEvents: number;
  eventsByType: Record<EventType, number>;
  eventsByMonth: Array<{
    month: string;
    events: number;
  }>;
}

export class CalendarService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }

  async createEvent(
    data: CreateEventDto,
    userId: string
  ): Promise<CalendarEvent> {
    try {
      const event = await prisma.$transaction(async (tx) => {
        // Create the event
        const newEvent = await tx.calendarEvent.create({
          data: {
            ...data,
            reminderMinutes: data.reminderMinutes || [60], // Default 1 hour reminder
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
            trip: {
              select: {
                id: true,
                destination: true,
                status: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        // Create activity log
        await tx.activity.create({
          data: {
            type: "event_created",
            description: `Event created: ${newEvent.title}`,
            userId,
            contactId: data.contactId,
            metadata: {
              eventId: newEvent.id,
              eventType: data.type,
              startDate: data.startDate,
            },
          },
        });

        return newEvent;
      });

      logger.info(`Event created: ${event.id} by user: ${userId}`);
      return event;
    } catch (error) {
      logger.error("Error creating event:", error);
      throw error;
    }
  }

  async updateEvent(
    id: string,
    data: Partial<CreateEventDto>,
    userId: string
  ): Promise<CalendarEvent> {
    try {
      const event = await prisma.$transaction(async (tx) => {
        const updatedEvent = await tx.calendarEvent.update({
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
            trip: {
              select: {
                id: true,
                destination: true,
                status: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        // Create activity log
        await tx.activity.create({
          data: {
            type: "event_updated",
            description: `Event updated: ${updatedEvent.title}`,
            userId,
            contactId: updatedEvent.contactId,
            metadata: {
              eventId: updatedEvent.id,
              changes: Object.keys(data),
            },
          },
        });

        return updatedEvent;
      });

      logger.info(`Event updated: ${id} by user: ${userId}`);
      return event;
    } catch (error) {
      logger.error("Error updating event:", error);
      throw error;
    }
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        const event = await tx.calendarEvent.findUnique({
          where: { id },
        });

        if (!event) {
          throw new Error("Event not found");
        }

        // Create activity log before deletion
        await tx.activity.create({
          data: {
            type: "event_deleted",
            description: `Event deleted: ${event.title}`,
            userId,
            contactId: event.contactId,
            metadata: {
              eventId: id,
              eventType: event.type,
            },
          },
        });

        // Delete the event
        await tx.calendarEvent.delete({
          where: { id },
        });
      });

      logger.info(`Event deleted: ${id} by user: ${userId}`);
    } catch (error) {
      logger.error("Error deleting event:", error);
      throw error;
    }
  }

  async getEvent(id: string): Promise<CalendarEvent | null> {
    return prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        trip: {
          select: {
            id: true,
            destination: true,
            status: true,
            departureDate: true,
            returnDate: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getEvents(filter: EventFilter): Promise<CalendarEvent[]> {
    const where: any = {};

    if (filter.assignedToId) {
      where.assignedToId = filter.assignedToId;
    }

    if (filter.contactId) {
      where.contactId = filter.contactId;
    }

    if (filter.tripId) {
      where.tripId = filter.tripId;
    }

    if (filter.type && filter.type.length > 0) {
      where.type = { in: filter.type };
    }

    if (filter.startDate || filter.endDate) {
      where.startDate = {};
      if (filter.startDate) where.startDate.gte = filter.startDate;
      if (filter.endDate) where.startDate.lte = filter.endDate;
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: "insensitive" } },
        { description: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    return prisma.calendarEvent.findMany({
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
        trip: {
          select: {
            id: true,
            destination: true,
            status: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });
  }

  async getEventsByDateRange(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<CalendarEvent[]> {
    const where: any = {
      startDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (userId) {
      where.assignedToId = userId;
    }

    return prisma.calendarEvent.findMany({
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
        trip: {
          select: {
            id: true,
            destination: true,
            status: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });
  }

  async getUpcomingEvents(
    userId: string,
    days: number = 7
  ): Promise<CalendarEvent[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.getEventsByDateRange(startDate, endDate, userId);
  }

  async getCalendarStats(userId: string): Promise<CalendarStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get events for current month
    const events = await this.getEventsByDateRange(
      startOfMonth,
      endOfMonth,
      userId
    );

    // Calculate stats
    const totalEvents = events.length;
    const upcomingEvents = events.filter((e) => e.startDate > now).length;
    const overdueEvents = events.filter(
      (e) => e.startDate < now && e.type === "TASK"
    ).length;

    // Events by type
    const eventsByType = events.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<EventType, number>
    );

    // Events by month (last 6 months)
    const eventsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthEvents = await prisma.calendarEvent.count({
        where: {
          assignedToId: userId,
          startDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      eventsByMonth.push({
        month: monthStart.toLocaleDateString("es-ES", {
          month: "short",
          year: "numeric",
        }),
        events: monthEvents,
      });
    }

    return {
      totalEvents,
      upcomingEvents,
      overdueEvents,
      eventsByType,
      eventsByMonth,
    };
  }

  async generateTripEvents(
    tripId: string,
    userId: string
  ): Promise<CalendarEvent[]> {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          contact: true,
        },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }

      const events: CalendarEvent[] = [];

      // Pre-departure meeting
      const preDepartureDate = new Date(trip.departureDate);
      preDepartureDate.setDate(preDepartureDate.getDate() - 7); // 1 week before

      const preMeeting = await this.createEvent(
        {
          title: `Reunión pre-viaje - ${trip.destination}`,
          description: `Reunión de preparación para el viaje a ${trip.destination} de ${trip.contact.firstName} ${trip.contact.lastName}`,
          type: "CLIENT_MEETING",
          startDate: preDepartureDate,
          endDate: new Date(preDepartureDate.getTime() + 60 * 60 * 1000), // 1 hour
          contactId: trip.contactId,
          tripId: trip.id,
          assignedToId: userId,
          reminderMinutes: [1440, 60], // 24h and 1h reminders
          aiGenerated: true,
        },
        userId
      );

      events.push(preMeeting);

      // Departure event
      const departure = await this.createEvent(
        {
          title: `Salida a ${trip.destination}`,
          description: `${trip.contact.firstName} ${trip.contact.lastName} viaja a ${trip.destination}`,
          type: "TRIP_DEPARTURE",
          startDate: trip.departureDate,
          endDate: trip.departureDate,
          allDay: true,
          contactId: trip.contactId,
          tripId: trip.id,
          assignedToId: userId,
          reminderMinutes: [1440], // 24h reminder
          aiGenerated: true,
        },
        userId
      );

      events.push(departure);

      // Return event
      const returnEvent = await this.createEvent(
        {
          title: `Regreso de ${trip.destination}`,
          description: `${trip.contact.firstName} ${trip.contact.lastName} regresa de ${trip.destination}`,
          type: "TRIP_RETURN",
          startDate: trip.returnDate,
          endDate: trip.returnDate,
          allDay: true,
          contactId: trip.contactId,
          tripId: trip.id,
          assignedToId: userId,
          reminderMinutes: [1440], // 24h reminder
          aiGenerated: true,
        },
        userId
      );

      events.push(returnEvent);

      // Post-trip follow up
      const postTripDate = new Date(trip.returnDate);
      postTripDate.setDate(postTripDate.getDate() + 3); // 3 days after return

      const postTrip = await this.createEvent(
        {
          title: `Seguimiento post-viaje - ${trip.destination}`,
          description: `Llamada de seguimiento para evaluar la experiencia del viaje a ${trip.destination}`,
          type: "FOLLOW_UP_CALL",
          startDate: postTripDate,
          endDate: new Date(postTripDate.getTime() + 30 * 60 * 1000), // 30 minutes
          contactId: trip.contactId,
          tripId: trip.id,
          assignedToId: userId,
          reminderMinutes: [60], // 1h reminder
          aiGenerated: true,
        },
        userId
      );

      events.push(postTrip);

      logger.info(`Generated ${events.length} events for trip ${tripId}`);
      return events;
    } catch (error) {
      logger.error("Error generating trip events:", error);
      throw error;
    }
  }

  async generateAIEventSuggestions(contactId: string): Promise<string[]> {
    try {
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: {
          trips: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
          notes: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
      });

      if (!contact) {
        throw new Error("Contact not found");
      }

      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        Como asistente de IA para una agencia de viajes, sugiere eventos de calendario apropiados para este cliente:
        
        Cliente: ${contact.firstName} ${contact.lastName}
        Estado: ${contact.status}
        Última actividad: ${contact.lastContact || "No registrada"}
        Destinos preferidos: ${contact.preferredDestinations?.join(", ") || "No especificado"}
        
        Viajes recientes:
        ${contact.trips.map((trip) => `- ${trip.destination} (${trip.status})`).join("\n")}
        
        Notas recientes:
        ${contact.notes.map((note) => `- ${note.content.substring(0, 100)}`).join("\n")}
        
        Sugiere 3-5 eventos de calendario relevantes que un agente de viajes debería programar.
        Incluye el tipo de evento y una breve descripción.
        
        Tipos disponibles: CLIENT_MEETING, FOLLOW_UP_CALL, SEASONAL_CAMPAIGN
        
        Formato de respuesta:
        - Tipo: Descripción breve del evento
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestions = response
        .text()
        .split("\n")
        .filter((line) => line.trim().startsWith("-"));

      return suggestions;
    } catch (error) {
      logger.error("Error generating AI event suggestions:", error);
      return [
        "- FOLLOW_UP_CALL: Llamada de seguimiento general",
        "- CLIENT_MEETING: Reunión para discutir próximos viajes",
        "- SEASONAL_CAMPAIGN: Presentar ofertas de temporada",
      ];
    }
  }

  async getConflictingEvents(
    startDate: Date,
    endDate: Date,
    userId: string,
    excludeEventId?: string
  ): Promise<CalendarEvent[]> {
    const where: any = {
      assignedToId: userId,
      OR: [
        {
          startDate: {
            lte: endDate,
          },
          endDate: {
            gte: startDate,
          },
        },
      ],
    };

    if (excludeEventId) {
      where.id = { not: excludeEventId };
    }

    return prisma.calendarEvent.findMany({
      where,
      include: {
        contact: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });
  }
}
