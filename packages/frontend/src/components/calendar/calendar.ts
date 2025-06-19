import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
         eachDayOfInterval, isSameMonth, isSameDay, isToday,
         addMonths, subMonths, addWeeks, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Phone,
  Users,
  Plane,
  ArrowLeft,
  ArrowRight,
  Filter,
} from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import { useCalendar } from "../../hooks/useCalendar";
import { CalendarEvent, EventType } from "../../services/calendar.service";
import { EventModal } from "./EventModal";
import { EventCard } from "./EventCard";
import { clsx } from "clsx";

type CalendarView = "month" | "week" | "day" | "agenda";

const EVENT_TYPE_CONFIG = {
  CLIENT_MEETING: {
    color: "bg-blue-500",
    icon: Users,
    label: "Reunión",
  },
  TRIP_DEPARTURE: {
    color: "bg-green-500",
    icon: Plane,
    label: "Salida",
  },
  TRIP_RETURN: {
    color: "bg-purple-500",
    icon: ArrowLeft,
    label: "Regreso",
  },
  FOLLOW_UP_CALL: {
    color: "bg-amber-500",
    icon: Phone,
    label: "Seguimiento",
  },
  PAYMENT_DUE: {
    color: "bg-red-500",
    icon: Clock,
    label: "Pago",
  },
  SEASONAL_CAMPAIGN: {
    color: "bg-pink-500",
    icon: CalendarIcon,
    label: "Campaña",
  },
  TASK: {
    color: "bg-gray-500",
    icon: Clock,
    label: "Tarea",
  },
  OTHER: {
    color: "bg-gray-400",
    icon: CalendarIcon,
    label: "Otro",
  },
} as const;

interface CalendarProps {
  userId?: string;
  contactId?: string;
  tripId?: string;
  initialView?: CalendarView;
}

export const Calendar = ({
  userId,
  contactId,
  tripId,
  initialView = "month",
}: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(initialView);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType[]>([]);

  const {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    generateTripEvents,
  } = useCalendar({
    userId,
    contactId,
    tripId,
    startDate: getViewStartDate(),
    endDate: getViewEndDate(),
    eventTypes: eventTypeFilter.length > 0 ? eventTypeFilter : undefined,
  });

  function getViewStartDate(): Date {
    switch (view) {
      case "month":
        return startOfMonth(currentDate);
      case "week":
        return startOfWeek(currentDate, { locale: es });
      case "day":
        return new Date(currentDate.setHours(0, 0, 0, 0));
      case "agenda":
        return new Date();
      default:
        return startOfMonth(currentDate);
    }
  }

  function getViewEndDate(): Date {
    switch (view) {
      case "month":
        return endOfMonth(currentDate);
      case "week":
        return endOfWeek(currentDate, { locale: es });
      case "day":
        return new Date(currentDate.setHours(23, 59, 59, 999));
      case "agenda":
        const agendaEnd = new Date();
        agendaEnd.setDate(agendaEnd.getDate() + 30); // 30 days ahead
        return agendaEnd;
      default:
        return endOfMonth(currentDate);
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    switch (view) {
      case "month":
        setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(direction === "prev" ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
        break;
      case "day":
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction === "prev" ? -1 : 1));
        setCurrentDate(newDate);
        break;
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (view === "month") {
      setCurrentDate(date);
      setView("day");
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setSelectedDate(selectedDate || new Date());
    setShowEventModal(true);
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { locale: es });
    const calendarEnd = endOfWeek(monthEnd, { locale: es });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="grid grid-cols-7 gap-1 h-full">
        {/* Weekday headers */}
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-white/60">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={clsx(
                "min-h-24 p-1 border border-white/5 cursor-pointer transition-colors hover:bg-white/5",
                !isCurrentMonth && "opacity-50",
                isDayToday && "bg-primary-500/10 border-primary-500/30"
              )}
              onClick={() => handleDateClick(day)}
            >
              <div className={clsx(
                "text-sm font-medium mb-1",
                isDayToday ? "text-primary-300" : "text-white"
              )}>
                {format(day, "d")}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const config = EVENT_TYPE_CONFIG[event.type];
                  return (
                    <div
                      key={event.id}
                      className={clsx(
                        "text-xs p-1 rounded truncate cursor-pointer",
                        config.color,
                        "text-white hover:opacity-80"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-white/60 text-center">
                    +{dayEvents.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { locale: es });
    const weekEnd = endOfWeek(currentDate, { locale: es });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return (
      <div className="grid grid-cols-7 gap-2 h-full">
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isDayToday = isToday(day);
          
          return (
            <div key={day.toISOString()} className="space-y-2">
              <div className={clsx(
                "text-center p-2 rounded-lg",
                isDayToday && "bg-primary-500/20 text-primary-300"
              )}>
                <div className="text-sm text-white/60">
                  {format(day, "EEE", { locale: es })}
                </div>
                <div className="text-lg font-semibold text-white">
                  {format(day, "d")}
                </div>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {dayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event)}
                    compact
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate).sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return (
      <div className="space-y-4">
        <div className="text-center p-4 glass rounded-lg">
          <div className="text-lg text-white/60">
            {format(currentDate, "EEEE", { locale: es })}
          </div>
          <div className="text-2xl font-bold text-white">
            {format(currentDate, "d 'de' MMMM, yyyy", { locale: es })}
          </div>
        </div>
        
        {dayEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No hay eventos para este día</p>
            <Button
              variant="glass"
              onClick={handleCreateEvent}
              className="mt-4"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Crear Evento
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
                showTime
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAgendaView = () => {
    const upcomingEvents = events
      .filter(event => new Date(event.startDate) >= new Date())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 20);

    return (
      <div className="space-y-4">
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No hay eventos próximos</p>
          </div>
        ) : (
          upcomingEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => handleEventClick(event)}
              showDate
              showTime
            />
          ))
        )}
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (view) {
      case "month":
        return renderMonthView();
      case "week":
        return renderWeekView();
      case "day":
        return renderDayView();
      case "agenda":
        return renderAgendaView();
      default:
        return renderMonthView();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="loader"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => navigateDate("prev")}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                />
                <h2 className="text-xl font-bold text-white min-w-48 text-center">
                  {view === "month" && format(currentDate, "MMMM yyyy", { locale: es })}
                  {view === "week" && `${format(startOfWeek(currentDate, { locale: es }), "d MMM")} - ${format(endOfWeek(currentDate, { locale: es }), "d MMM yyyy")}`}
                  {view === "day" && format(currentDate, "d 'de' MMMM, yyyy", { locale: es })}
                  {view === "agenda" && "Próximos Eventos"}
                </h2>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => navigateDate("next")}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                />
              </div>
              
              <Button
                variant="glass"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoy
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* View selector */}
              <div className="flex gap-1 p-1 glass rounded-lg">
                {[
                  { key: "month", label: "Mes" },
                  { key: "week", label: "Semana" },
                  { key: "day", label: "Día" },
                  { key: "agenda", label: "Agenda" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setView(key as CalendarView)}
                    className={clsx(
                      "px-3 py-1 rounded text-sm transition-all",
                      view === key
                        ? "bg-primary-500 text-white"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                onClick={handleCreateEvent}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Nuevo Evento
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Event type filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Filter className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/60">Filtrar por tipo:</span>
            {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
              <button
                key={type}
                onClick={() => {
                  setEventTypeFilter(prev => 
                    prev.includes(type as EventType)
                      ? prev.filter(t => t !== type)
                      : [...prev, type as EventType]
                  );
                }}
                className={clsx(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all",
                  eventTypeFilter.includes(type as EventType)
                    ? `${config.color} text-white`
                    : "glass text-white/60 hover:text-white"
                )}
              >
                <config.icon className="w-3 h-3" />
                {config.label}
              </button>
            ))}
            {eventTypeFilter.length > 0 && (
              <Button
                variant="glass"
                size="sm"
                onClick={() => setEventTypeFilter([])}
                className="text-xs"
              >
                Limpiar
              </Button>
            )}
          </div>

          {/* Calendar View */}
          <div className="h-[600px]">
            {renderCurrentView()}
          </div>
        </CardContent>
      </Card>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setSelectedDate(null);
          }}
          onSave={selectedEvent ? updateEvent : createEvent}
          onDelete={selectedEvent ? deleteEvent : undefined}
          defaultDate={selectedDate}
          contactId={contactId}
          tripId={tripId}
        />
      )}
    </div>
  );
};