import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  calendarService,
  CalendarEvent,
  CreateEventDto,
  UpdateEventDto,
  EventFilter,
  EventType,
} from "../services/calendar.service";
import toast from "react-hot-toast";

interface UseCalendarProps {
  userId?: string;
  contactId?: string;
  tripId?: string;
  startDate?: Date;
  endDate?: Date;
  eventTypes?: EventType[];
  autoRefresh?: boolean;
}

export const useCalendar = ({
  userId,
  contactId,
  tripId,
  startDate,
  endDate,
  eventTypes,
  autoRefresh = false,
}: UseCalendarProps = {}) => {
  const queryClient = useQueryClient();

  // Build filter object
  const filter: EventFilter = {
    ...(userId && { assignedToId: userId }),
    ...(contactId && { contactId }),
    ...(tripId && { tripId }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(eventTypes && eventTypes.length > 0 && { type: eventTypes }),
  };

  // Query key for caching
  const queryKey = ["calendar-events", filter];

  // Fetch events
  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => {
      if (startDate && endDate) {
        return calendarService.getEventsByDateRange(startDate, endDate, userId);
      }
      return calendarService.getEvents(filter);
    },
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds if enabled
    staleTime: 60000, // Consider data fresh for 1 minute
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventDto) => calendarService.createEvent(data),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries(["calendar-events"]);
      queryClient.invalidateQueries(["calendar-stats"]);
      toast.success("Evento creado exitosamente");
      return newEvent;
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error("Conflicto de horario detectado");
      } else {
        toast.error("Error al crear evento");
      }
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ id, ...data }: UpdateEventDto) =>
      calendarService.updateEvent(id, data),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries(["calendar-events"]);
      queryClient.invalidateQueries(["calendar-stats"]);
      queryClient.setQueryData(
        ["calendar-event", updatedEvent.id],
        updatedEvent
      );
      toast.success("Evento actualizado exitosamente");
      return updatedEvent;
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error("Conflicto de horario detectado");
      } else {
        toast.error("Error al actualizar evento");
      }
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => calendarService.deleteEvent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(["calendar-events"]);
      queryClient.invalidateQueries(["calendar-stats"]);
      queryClient.removeQueries(["calendar-event", id]);
      toast.success("Evento eliminado exitosamente");
    },
    onError: () => {
      toast.error("Error al eliminar evento");
    },
  });

  // Generate trip events mutation
  const generateTripEventsMutation = useMutation({
    mutationFn: (tripId: string) => calendarService.generateTripEvents(tripId),
    onSuccess: (events) => {
      queryClient.invalidateQueries(["calendar-events"]);
      queryClient.invalidateQueries(["calendar-stats"]);
      toast.success(`${events.length} eventos generados para el viaje`);
      return events;
    },
    onError: () => {
      toast.error("Error al generar eventos del viaje");
    },
  });

  return {
    // Data
    events,
    isLoading,
    error,

    // Actions
    createEvent: createEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
    generateTripEvents: generateTripEventsMutation.mutateAsync,
    refetch,

    // Loading states
    isCreating: createEventMutation.isLoading,
    isUpdating: updateEventMutation.isLoading,
    isDeleting: deleteEventMutation.isLoading,
    isGenerating: generateTripEventsMutation.isLoading,

    // Helper functions
    getEventsForDate: (date: Date) =>
      calendarService.getEventsForDate(events, date),
    sortEventsByTime: (eventList: CalendarEvent[]) =>
      calendarService.sortEventsByTime(eventList),
  };
};

// Hook for single event
export const useCalendarEvent = (id: string) => {
  return useQuery({
    queryKey: ["calendar-event", id],
    queryFn: () => calendarService.getEvent(id),
    enabled: !!id,
  });
};

// Hook for upcoming events
export const useUpcomingEvents = (days: number = 7) => {
  return useQuery({
    queryKey: ["calendar-upcoming", days],
    queryFn: () => calendarService.getUpcomingEvents(days),
    refetchInterval: 60000, // Refresh every minute
  });
};

// Hook for today's events
export const useTodayEvents = () => {
  return useQuery({
    queryKey: ["calendar-today"],
    queryFn: () => calendarService.getTodayEvents(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Hook for this week's events
export const useWeekEvents = () => {
  return useQuery({
    queryKey: ["calendar-week"],
    queryFn: () => calendarService.getWeekEvents(),
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};

// Hook for this month's events
export const useMonthEvents = () => {
  return useQuery({
    queryKey: ["calendar-month"],
    queryFn: () => calendarService.getMonthEvents(),
    refetchInterval: 600000, // Refresh every 10 minutes
  });
};

// Hook for calendar statistics
export const useCalendarStats = () => {
  return useQuery({
    queryKey: ["calendar-stats"],
    queryFn: () => calendarService.getCalendarStats(),
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 120000, // Consider data fresh for 2 minutes
  });
};

// Hook for AI suggestions
export const useAISuggestions = (contactId?: string) => {
  return useQuery({
    queryKey: ["calendar-ai-suggestions", contactId],
    queryFn: () => calendarService.getAISuggestions(contactId!),
    enabled: !!contactId,
    staleTime: 600000, // Consider data fresh for 10 minutes
  });
};

// Hook for conflict checking
export const useConflictCheck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      startDate,
      endDate,
      userId,
      excludeEventId,
    }: {
      startDate: Date;
      endDate: Date;
      userId: string;
      excludeEventId?: string;
    }) =>
      calendarService.checkConflicts(
        startDate,
        endDate,
        userId,
        excludeEventId
      ),
    onError: () => {
      toast.error("Error al verificar conflictos");
    },
  });
};

// Hook for bulk operations
export const useBulkCalendarOperations = () => {
  const queryClient = useQueryClient();

  const bulkCreateMutation = useMutation({
    mutationFn: (events: CreateEventDto[]) =>
      calendarService.bulkCreateEvents(events),
    onSuccess: (result) => {
      queryClient.invalidateQueries(["calendar-events"]);
      queryClient.invalidateQueries(["calendar-stats"]);

      if (result.failed > 0) {
        toast.error(
          `${result.successful} eventos creados, ${result.failed} fallaron`
        );
      } else {
        toast.success(`${result.successful} eventos creados exitosamente`);
      }

      return result;
    },
    onError: () => {
      toast.error("Error en la creación masiva de eventos");
    },
  });

  return {
    bulkCreate: bulkCreateMutation.mutateAsync,
    isBulkCreating: bulkCreateMutation.isLoading,
  };
};

// Hook for calendar helpers and utilities
export const useCalendarHelpers = () => {
  return {
    getEventTypeLabel: calendarService.getEventTypeLabel,
    getEventTypeColor: calendarService.getEventTypeColor,
    formatEventDuration: calendarService.formatEventDuration,
    getReminderLabel: calendarService.getReminderLabel,
    isEventToday: calendarService.isEventToday,
    isEventPast: calendarService.isEventPast,
    isEventUpcoming: calendarService.isEventUpcoming,
  };
};
