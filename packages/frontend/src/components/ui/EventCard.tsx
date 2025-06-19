import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Plane,
  Users,
  Bell,
} from "lucide-react";
import { CalendarEvent } from "../../services/calendar.service";
import { clsx } from "clsx";

interface EventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  compact?: boolean;
  showDate?: boolean;
  showTime?: boolean;
}

const EVENT_TYPE_CONFIG = {
  CLIENT_MEETING: {
    color: "bg-blue-500",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/10",
    icon: Users,
    label: "Reunión",
  },
  TRIP_DEPARTURE: {
    color: "bg-green-500",
    borderColor: "border-green-500/30",
    bgColor: "bg-green-500/10",
    icon: Plane,
    label: "Salida",
  },
  TRIP_RETURN: {
    color: "bg-purple-500",
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/10",
    icon: Plane,
    label: "Regreso",
  },
  FOLLOW_UP_CALL: {
    color: "bg-amber-500",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
    icon: Phone,
    label: "Seguimiento",
  },
  PAYMENT_DUE: {
    color: "bg-red-500",
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/10",
    icon: Clock,
    label: "Pago",
  },
  SEASONAL_CAMPAIGN: {
    color: "bg-pink-500",
    borderColor: "border-pink-500/30",
    bgColor: "bg-pink-500/10",
    icon: Calendar,
    label: "Campaña",
  },
  TASK: {
    color: "bg-gray-500",
    borderColor: "border-gray-500/30",
    bgColor: "bg-gray-500/10",
    icon: Clock,
    label: "Tarea",
  },
  OTHER: {
    color: "bg-gray-400",
    borderColor: "border-gray-400/30",
    bgColor: "bg-gray-400/10",
    icon: Calendar,
    label: "Otro",
  },
} as const;

export const EventCard = ({
  event,
  onClick,
  compact = false,
  showDate = false,
  showTime = false,
}: EventCardProps) => {
  const config = EVENT_TYPE_CONFIG[event.type];
  const Icon = config.icon;

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isToday =
    format(startDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const isPast = startDate < new Date();

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  if (compact) {
    return (
      <div
        className={clsx(
          "p-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02]",
          config.bgColor,
          config.borderColor,
          "border",
          isPast && "opacity-60"
        )}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2">
          <div className={clsx("w-2 h-2 rounded-full", config.color)} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {event.title}
            </p>
            {showTime && !event.allDay && (
              <p className="text-xs text-white/60">
                {format(startDate, "HH:mm")}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg",
        config.bgColor,
        config.borderColor,
        "glass-morphism",
        isPast && "opacity-70"
      )}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={clsx("p-2 rounded-lg", config.color)}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{event.title}</h3>
            <p className="text-xs text-white/60">{config.label}</p>
          </div>
        </div>

        {event.aiGenerated && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
            <span className="text-xs">🤖 IA</span>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-white/80 mb-3 line-clamp-2">
          {event.description}
        </p>
      )}

      {/* Date and Time */}
      <div className="space-y-2">
        {showDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white">
              {format(startDate, "dd 'de' MMMM, yyyy", { locale: es })}
            </span>
            {isToday && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent">
                Hoy
              </span>
            )}
          </div>
        )}

        {(showTime || !showDate) && !event.allDay && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white">
              {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
            </span>
          </div>
        )}

        {event.allDay && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white">Todo el día</span>
          </div>
        )}
      </div>

      {/* Contact and Trip Info */}
      {(event.contact || event.trip) && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
          {event.contact && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white">
                {event.contact.firstName} {event.contact.lastName}
              </span>
            </div>
          )}

          {event.trip && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white">
                {event.trip.destination}
              </span>
              <span
                className={clsx(
                  "px-2 py-0.5 text-xs rounded-full",
                  event.trip.status === "CONFIRMED" &&
                    "bg-green-500/20 text-green-300",
                  event.trip.status === "BOOKED" &&
                    "bg-blue-500/20 text-blue-300",
                  event.trip.status === "QUOTE" &&
                    "bg-amber-500/20 text-amber-300",
                  event.trip.status === "COMPLETED" &&
                    "bg-gray-500/20 text-gray-300",
                  event.trip.status === "CANCELLED" &&
                    "bg-red-500/20 text-red-300"
                )}
              >
                {event.trip.status}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Reminders */}
      {event.reminderMinutes && event.reminderMinutes.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-white/60" />
          <span className="text-xs text-white/60">
            {event.reminderMinutes.length} recordatorio(s)
          </span>
        </div>
      )}

      {/* Assigned To */}
      {event.assignedTo && (
        <div className="mt-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {event.assignedTo.firstName.charAt(0)}
            </span>
          </div>
          <span className="text-xs text-white/60">
            {event.assignedTo.firstName} {event.assignedTo.lastName}
          </span>
        </div>
      )}
    </div>
  );
};
