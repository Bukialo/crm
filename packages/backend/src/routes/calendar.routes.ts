import { Router } from "express";
import { calendarController } from "../controllers/calendar.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const eventParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid event ID"),
  }),
});

const contactParamsSchema = z.object({
  params: z.object({
    contactId: z.string().uuid("Invalid contact ID"),
  }),
});

const createEventBodySchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    type: z.enum([
      "CLIENT_MEETING",
      "TRIP_DEPARTURE",
      "TRIP_RETURN",
      "FOLLOW_UP_CALL",
      "PAYMENT_DUE",
      "SEASONAL_CAMPAIGN",
      "TASK",
      "OTHER",
    ]),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    allDay: z.boolean().optional(),
    timezone: z.string().optional(),
    contactId: z.string().uuid().optional(),
    tripId: z.string().uuid().optional(),
    assignedToId: z.string().uuid(),
    reminderMinutes: z.array(z.number()).optional(),
  }),
});

const updateEventBodySchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    type: z
      .enum([
        "CLIENT_MEETING",
        "TRIP_DEPARTURE",
        "TRIP_RETURN",
        "FOLLOW_UP_CALL",
        "PAYMENT_DUE",
        "SEASONAL_CAMPAIGN",
        "TASK",
        "OTHER",
      ])
      .optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    allDay: z.boolean().optional(),
    timezone: z.string().optional(),
    contactId: z.string().uuid().optional(),
    tripId: z.string().uuid().optional(),
    assignedToId: z.string().uuid().optional(),
    reminderMinutes: z.array(z.number()).optional(),
  }),
});

const eventsQuerySchema = z.object({
  query: z.object({
    assignedToId: z.string().uuid().optional(),
    contactId: z.string().uuid().optional(),
    tripId: z.string().uuid().optional(),
    type: z.array(z.string()).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    search: z.string().optional(),
  }),
});

const dateRangeQuerySchema = z.object({
  query: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    userId: z.string().uuid().optional(),
  }),
});

const upcomingEventsQuerySchema = z.object({
  query: z.object({
    days: z.string().optional(),
  }),
});

const generateTripEventsBodySchema = z.object({
  body: z.object({
    tripId: z.string().uuid(),
  }),
});

const checkConflictsBodySchema = z.object({
  body: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    userId: z.string().uuid(),
    excludeEventId: z.string().uuid().optional(),
  }),
});

const bulkCreateEventsBodySchema = z.object({
  body: z.object({
    events: z.array(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        type: z.enum([
          "CLIENT_MEETING",
          "TRIP_DEPARTURE",
          "TRIP_RETURN",
          "FOLLOW_UP_CALL",
          "PAYMENT_DUE",
          "SEASONAL_CAMPAIGN",
          "TASK",
          "OTHER",
        ]),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        allDay: z.boolean().optional(),
        timezone: z.string().optional(),
        contactId: z.string().uuid().optional(),
        tripId: z.string().uuid().optional(),
        assignedToId: z.string().uuid(),
        reminderMinutes: z.array(z.number()).optional(),
      })
    ),
  }),
});

// All calendar routes require authentication
router.use(authenticate);

// Basic CRUD operations
router.get(
  "/",
  validateQuery(eventsQuerySchema.shape.query),
  calendarController.getEvents
);

router.post(
  "/",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateBody(createEventBodySchema.shape.body),
  calendarController.createEvent
);

router.get(
  "/range",
  validateQuery(dateRangeQuerySchema.shape.query),
  calendarController.getEventsByDateRange
);

router.get(
  "/upcoming",
  validateQuery(upcomingEventsQuerySchema.shape.query),
  calendarController.getUpcomingEvents
);

router.get("/stats", calendarController.getCalendarStats);

router.get("/today", calendarController.getTodayEvents);

router.get("/week", calendarController.getWeekEvents);

router.get("/month", calendarController.getMonthEvents);

// Bulk operations
router.post(
  "/bulk",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateBody(bulkCreateEventsBodySchema.shape.body),
  calendarController.bulkCreateEvents
);

// AI and automation features
router.post(
  "/generate-trip-events",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateBody(generateTripEventsBodySchema.shape.body),
  calendarController.generateTripEvents
);

router.get(
  "/ai-suggestions/:contactId",
  validateParams(contactParamsSchema.shape.params),
  calendarController.getAISuggestions
);

router.post(
  "/check-conflicts",
  validateBody(checkConflictsBodySchema.shape.body),
  calendarController.checkConflicts
);

// Individual event operations (must come after other routes)
router.get(
  "/:id",
  validateParams(eventParamsSchema.shape.params),
  calendarController.getEvent
);

router.put(
  "/:id",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateParams(eventParamsSchema.shape.params),
  validateBody(updateEventBodySchema.shape.body),
  calendarController.updateEvent
);

router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER", "AGENT"),
  validateParams(eventParamsSchema.shape.params),
  calendarController.deleteEvent
);

export default router;
