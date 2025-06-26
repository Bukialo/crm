import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/error.middleware";
import { z } from "zod";
import { CalendarService } from "../services/calendar.service";
import { ApiResponse } from "@bukialo/shared";
import { EventType } from "@prisma/client";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        firebaseUid: string;
      };
    }
  }
}

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.nativeEnum(EventType),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  allDay: z.boolean().optional().default(false),
  timezone: z.string().optional().default("UTC"),
  contactId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
  assignedToId: z.string().uuid(),
  reminderMinutes: z.array(z.number()).optional(),
});

const updateEventSchema = createEventSchema.partial();

const getEventsQuerySchema = z.object({
  assignedToId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
  type: z.array(z.nativeEnum(EventType)).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().optional(),
});

const dateRangeQuerySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  userId: z.string().uuid().optional(),
});

const generateTripEventsSchema = z.object({
  tripId: z.string().uuid(),
});

const checkConflictsSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  userId: z.string().uuid(),
  excludeEventId: z.string().uuid().optional(),
});

export class CalendarController {
  private calendarService: CalendarService;

  constructor() {
    this.calendarService = new CalendarService();
  }

  // Create event
  createEvent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      const validatedData = createEventSchema.parse(req.body);

      // Check for conflicts
      const conflicts = await this.calendarService.getConflictingEvents(
        validatedData.startDate,
        validatedData.endDate,
        validatedData.assignedToId
      );

      if (conflicts.length > 0 && !validatedData.allDay) {
        res.status(409).json({
          success: false,
          error: "Time conflict detected",
          data: { conflicts },
        });
        return;
      }

      const event = await this.calendarService.createEvent(
        validatedData,
        req.user.id
      );

      const response: ApiResponse = {
        success: true,
        data: event,
        message: "Event created successfully",
      };

      res.status(201).json(response);
    }
  );

  // Get all events
  getEvents = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const filters = getEventsQuerySchema.parse(req.query);

      const events = await this.calendarService.getEvents(filters);

      const response: ApiResponse = {
        success: true,
        data: events,
      };

      res.json(response);
    }
  );

  // Get events by date range
  getEventsByDateRange = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { startDate, endDate, userId } = dateRangeQuerySchema.parse(
        req.query
      );

      const events = await this.calendarService.getEventsByDateRange(
        startDate,
        endDate,
        userId
      );

      const response: ApiResponse = {
        success: true,
        data: events,
      };

      res.json(response);
    }
  );

  // Get single event
  getEvent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      const event = await this.calendarService.getEvent(id);

      if (!event) {
        res.status(404).json({
          success: false,
          error: "Event not found",
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: event,
      };

      res.json(response);
    }
  );

  // Update event
  updateEvent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      const { id } = req.params;
      const validatedData = updateEventSchema.parse(req.body);

      // Check for conflicts if dates are being updated
      if (
        validatedData.startDate &&
        validatedData.endDate &&
        validatedData.assignedToId
      ) {
        const conflicts = await this.calendarService.getConflictingEvents(
          validatedData.startDate,
          validatedData.endDate,
          validatedData.assignedToId,
          id // exclude current event
        );

        if (conflicts.length > 0 && !validatedData.allDay) {
          res.status(409).json({
            success: false,
            error: "Time conflict detected",
            data: { conflicts },
          });
          return;
        }
      }

      const event = await this.calendarService.updateEvent(
        id,
        validatedData,
        req.user.id
      );

      const response: ApiResponse = {
        success: true,
        data: event,
        message: "Event updated successfully",
      };

      res.json(response);
    }
  );

  // Delete event
  deleteEvent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      const { id } = req.params;

      await this.calendarService.deleteEvent(id, req.user.id);

      const response: ApiResponse = {
        success: true,
        message: "Event deleted successfully",
      };

      res.json(response);
    }
  );

  // Get upcoming events
  getUpcomingEvents = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      const { days = "7" } = req.query;

      const events = await this.calendarService.getUpcomingEvents(
        req.user.id,
        parseInt(days as string)
      );

      const response: ApiResponse = {
        success: true,
        data: events,
      };

      res.json(response);
    }
  );

  // Get calendar statistics
  getCalendarStats = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      const stats = await this.calendarService.getCalendarStats(req.user.id);

      const response: ApiResponse = {
        success: true,
        data: stats,
      };

      res.json(response);
    }
  );

  // Generate trip events
  generateTripEvents = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      const { tripId } = generateTripEventsSchema.parse(req.body);

      const events = await this.calendarService.generateTripEvents(
        tripId,
        req.user.id
      );

      const response: ApiResponse = {
        success: true,
        data: events,
        message: `Generated ${events.length} events for the trip`,
      };

      res.json(response);
    }
  );

  // Get AI event suggestions
  getAISuggestions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      const { contactId } = req.params;

      const suggestions = await this.calendarService.generateAIEventSuggestions(
        contactId,
        req.user.id
      );

      const response: ApiResponse = {
        success: true,
        data: suggestions,
      };

      res.json(response);
    }
  );

  // Check for time conflicts
  checkConflicts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { startDate, endDate, userId, excludeEventId } =
        checkConflictsSchema.parse(req.body);

      const conflicts = await this.calendarService.getConflictingEvents(
        startDate,
        endDate,
        userId,
        excludeEventId
      );

      const response: ApiResponse = {
        success: true,
        data: {
          hasConflicts: conflicts.length > 0,
          conflicts,
        },
      };

      res.json(response);
    }
  );

  // Get events for today
  getTodayEvents = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const events = await this.calendarService.getEventsByDateRange(
        startOfDay,
        endOfDay,
        req.user.id
      );

      const response: ApiResponse = {
        success: true,
        data: events,
      };

      res.json(response);
    }
  );

  // Get events for this week
  getWeekEvents = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
      endOfWeek.setHours(23, 59, 59, 999);

      const events = await this.calendarService.getEventsByDateRange(
        startOfWeek,
        endOfWeek,
        req.user.id
      );

      const response: ApiResponse = {
        success: true,
        data: events,
      };

      res.json(response);
    }
  );

  // Get events for this month
  getMonthEvents = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      const events = await this.calendarService.getEventsByDateRange(
        startOfMonth,
        endOfMonth,
        req.user.id
      );

      const response: ApiResponse = {
        success: true,
        data: events,
      };

      res.json(response);
    }
  );

  // Bulk create events
  bulkCreateEvents = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Usuario no autenticado",
        });
        return;
      }

      const { events } = req.body;

      if (!Array.isArray(events)) {
        res.status(400).json({
          success: false,
          error: "Events must be an array",
        });
        return;
      }

      const results = [];
      const errors = [];

      for (const [index, eventData] of events.entries()) {
        try {
          const validatedData = createEventSchema.parse(eventData);
          const event = await this.calendarService.createEvent(
            validatedData,
            req.user.id
          );
          results.push(event);
        } catch (error: any) {
          errors.push({
            index,
            error: error.message,
            data: eventData,
          });
        }
      }

      const response: ApiResponse = {
        success: true,
        data: {
          created: results,
          errors,
          total: events.length,
          successful: results.length,
          failed: errors.length,
        },
        message: `Bulk creation completed: ${results.length} successful, ${errors.length} failed`,
      };

      res.json(response);
    }
  );
}

export const calendarController = new CalendarController();
