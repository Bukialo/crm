import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Grid3X3,
  List,
} from "lucide-react";
import Card, { CardContent, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import { EventModal } from "../modal/eventModal";
import { EventCard } from "../ui/EventCard";
import { useCalendar } from "../../hooks/useCalendar";
import { CalendarEvent, CreateEventDto } from "../../services/calendar.service";

interface CalendarProps {
  userId?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ userId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [filterType, setFilterType] = useState<string>("all");

  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCalendar({
    userId,
    startDate,
    endDate,
    autoRefresh: true,
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Next month's days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const filteredEvents = events.filter((event) => {
    if (filterType === "all") return true;
    return event.type === filterType;
  });

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSaveEvent = async (data: CreateEventDto) => {
    if (selectedEvent) {
      await updateEvent({ id: selectedEvent.id, ...data });
    } else {
      await createEvent(data);
    }
    setShowEventModal(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const days = getDaysInMonth(currentDate);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>

          <div className="flex items-center gap-1">
            <Button
              variant="glass"
              size="sm"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="glass"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoy
            </Button>

            <Button
              variant="glass"
              size="sm"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex gap-1 p-1 glass rounded-lg">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded text-sm transition-all ${
                viewMode === "month"
                  ? "bg-primary-500 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded text-sm transition-all ${
                viewMode === "week"
                  ? "bg-primary-500 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="glass px-3 py-2 rounded-lg text-white text-sm"
          >
            <option value="all">Todos los eventos</option>
            <option value="CLIENT_MEETING">Reuniones</option>
            <option value="TRIP_DEPARTURE">Salidas</option>
            <option value="TRIP_RETURN">Regresos</option>
            <option value="FOLLOW_UP_CALL">Seguimientos</option>
          </select>

          <Button
            variant="primary"
            onClick={() => {
              setSelectedDate(new Date());
              setSelectedEvent(null);
              setShowEventModal(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-white/60"
              >
                {day}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-0 border-t border-white/10">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const isSelected =
                selectedDate && day.date.getTime() === selectedDate.getTime();

              return (
                <div
                  key={index}
                  className={`
                    min-h-[120px] p-2 border-r border-b border-white/5 cursor-pointer
                    hover:bg-white/5 transition-colors relative
                    ${!day.isCurrentMonth ? "bg-white/5 text-white/40" : ""}
                    ${day.isToday ? "bg-primary-500/20" : ""}
                    ${isSelected ? "bg-primary-500/30" : ""}
                  `}
                  onClick={() => handleDateClick(day.date)}
                >
                  <div
                    className={`
                      text-sm mb-2 ${day.isToday ? "font-bold text-primary-300" : ""}
                      ${!day.isCurrentMonth ? "text-white/40" : "text-white/80"}
                    `}
                  >
                    {day.date.getDate()}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className="px-2 py-1 rounded text-xs glass hover:bg-white/20 transition-colors truncate"
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}

                    {dayEvents.length > 3 && (
                      <div className="text-xs text-white/60 px-2">
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Próximos Eventos
            </h3>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <CalendarIcon className="w-4 h-4" />
              {filteredEvents.length} eventos
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No hay eventos programados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.slice(0, 5).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => handleEventClick(event)}
                  showDate
                  showTime
                />
              ))}
            </div>
          )}
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
          onSave={handleSaveEvent}
          onDelete={
            selectedEvent
              ? () => handleDeleteEvent(selectedEvent.id)
              : undefined
          }
          isLoading={isCreating || isUpdating}
          isDeleting={isDeleting}
          defaultDate={selectedDate}
        />
      )}
    </div>
  );
};
