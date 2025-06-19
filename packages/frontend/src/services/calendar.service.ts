import api from "../lib/axios";

export type EventType =
  | "CLIENT_MEETING"
  | "TRIP_DEPARTURE"
  | "TRIP_RETURN"
  | "FOLLOW_UP_CALL"
  | "PAYMENT_DUE"
  | "SEASONAL_CAMPAIGN"
  | "TASK"
  | "OTHER";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  timezone: string;
  contactId?: string;
  tripId?: string;
  assignedToId: string;
  aiGenerated: boolean;
  aiSuggestions: string[];
  reminderMinutes: number[];
  createdAt: string;
  updatedAt: string;

  // Relations
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  trip?: {
    id: string;
    destination: string;
    status: string;
  };
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

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

class CalendarService {
  // Get events with filters
  async getEvents(filters: EventFilter = {}): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else if (value instanceof Date) {
          params.append(key, value.toISOString());
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await api.get(`/calendar?${params.toString()}`);
    return response.data.data;
  }

  // Get events by date range
  async getEventsByDateRange(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    params.append("startDate", startDate.toISOString());
    params.append("endDate", endDate.toISOString());
    if (userId) params.append("userId", userId);

    const response = await api.get(`/calendar/range?${params.toString()}`);
    return response.data.data;
  }

  // Get single event
  async getEvent(id: string): Promise<CalendarEvent> {
    const response = await api.get(`/calendar/${id}`);
    return response.data.data;
  }

  // Create event
  async createEvent(data: CreateEventDto): Promise<CalendarEvent> {
    const response = await api.post("/calendar", data);
    return response.data.data;
  }

  // Update event
  async updateEvent(
    id: string,
    data: Partial<CreateEventDto>
  ): Promise<CalendarEvent> {
    const response = await api.put(`/calendar/${id}`, data);
    return response.data.data;
  }

  // Delete event
  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/calendar/${id}`);
  }

  // Get upcoming events
  async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
    const response = await api.get(`/calendar/upcoming?days=${days}`);
    return response.data.data;
  }

  // Get today's events
  async getTodayEvents(): Promise<CalendarEvent[]> {
    const response = await api.get("/calendar/today");
    return response.data.data;
  }

  // Get this week's events
  async getWeekEvents(): Promise<CalendarEvent[]> {
    const response = await api.get("/calendar/week");
    return response.data.data;
  }

  // Get this month's events
  async getMonthEvents(): Promise<CalendarEvent[]> {
    const response = await api.get("/calendar/month");
    return response.data.data;
  }

  // Get calendar statistics
  async getCalendarStats(): Promise<CalendarStats> {
    const response = await api.get("/calendar/stats");
    return response.data.data;
  }

  // Generate trip events
  async generateTripEvents(tripId: string): Promise<CalendarEvent[]> {
    const response = await api.post("/calendar/generate-trip-events", {
      tripId,
    });
    return response.data.data;
  }

  // Get AI suggestions for events
  async getAISuggestions(contactId: string): Promise<string[]> {
    const response = await api.get(`/calendar/ai-suggestions/${contactId}`);
    return response.data.data;
  }

  // Check for time conflicts
  async checkConflicts(
    startDate: Date,
    endDate: Date,
    userId: string,
    excludeEventId?: string
  ): Promise<{ hasConflicts: boolean; conflicts: CalendarEvent[] }> {
    const response = await api.post("/calendar/check-conflicts", {
      startDate,
      endDate,
      userId,
      excludeEventId,
    });
    return response.data.data;
  }

  // Bulk create events
  async bulkCreateEvents(events: CreateEventDto[]): Promise<{
    created: CalendarEvent[];
    errors: any[];
    total: number;
    successful: number;
    failed: number;
  }> {
    const response = await api.post("/calendar/bulk", { events });
    return response.data.data;
  }

  // Helper functions
  getEventTypeLabel(type: EventType): string {
    const labels: Record<EventType, string> = {
      CLIENT_MEETING: "Reunión con Cliente",
      TRIP_DEPARTURE: "Salida de Viaje",
      TRIP_RETURN: "Regreso de Viaje",
      FOLLOW_UP_CALL: "Llamada de Seguimiento",
      PAYMENT_DUE: "Vencimiento de Pago",
      SEASONAL_CAMPAIGN: "Campaña Estacional",
      TASK: "Tarea",
      OTHER: "Otro",
    };
    return labels[type] || "Desconocido";
  }

  getEventTypeColor(type: EventType): string {
    const colors: Record<EventType, string> = {
      CLIENT_MEETING: "#3b82f6", // blue
      TRIP_DEPARTURE: "#10b981", // green
      TRIP_RETURN: "#8b5cf6", // purple
      FOLLOW_UP_CALL: "#f59e0b", // amber
      PAYMENT_DUE: "#ef4444", // red
      SEASONAL_CAMPAIGN: "#ec4899", // pink
      TASK: "#6b7280", // gray
      OTHER: "#9ca3af", // gray
    };
    return colors[type] || "#6b7280";
  }

  // Get events for a specific date
  getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((event) => {
      const eventDateStr = new Date(event.startDate)
        .toISOString()
        .split("T")[0];
      return eventDateStr === dateStr;
    });
  }

  // Sort events by start time
  sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
    return [...events].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }

  // Check if event is happening today
  isEventToday(event: CalendarEvent): boolean {
    const today = new Date().toISOString().split("T")[0];
    const eventDate = new Date(event.startDate).toISOString().split("T")[0];
    return eventDate === today;
  }

  // Check if event is in the past
  isEventPast(event: CalendarEvent): boolean {
    return new Date(event.startDate) < new Date();
  }

  // Check if event is upcoming (within next 7 days)
  isEventUpcoming(event: CalendarEvent): boolean {
    const now = new Date();
    const eventDate = new Date(event.startDate);
    const diffDays =
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }

  // Format event duration
  formatEventDuration(event: CalendarEvent): string {
    if (event.allDay) {
      return "Todo el día";
    }

    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours >= 1) {
      const remainingMinutes = diffMinutes % 60;
      return remainingMinutes > 0
        ? `${diffHours}h ${remainingMinutes}m`
        : `${diffHours}h`;
    }

    return `${diffMinutes}m`;
  }

  // Get reminder label
  getReminderLabel(minutes: number): string {
    if (minutes === 0) return "Al momento";
    if (minutes < 60) return `${minutes} minutos antes`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} horas antes`;
    if (minutes < 10080) return `${Math.floor(minutes / 1440)} días antes`;
    return `${Math.floor(minutes / 10080)} semanas antes`;
  }
}

export const calendarService = new CalendarService();
