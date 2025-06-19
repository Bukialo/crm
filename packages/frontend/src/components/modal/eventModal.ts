import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  X,
  Save,
  Trash2,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Plane,
  Bell,
  Users,
} from "lucide-react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { CalendarEvent, EventType } from "../../services/calendar.service";
import { useContacts } from "../../hooks/useContacts";

const eventSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  type: z.enum([
    "CLIENT_MEETING",
    "TRIP_DEPARTURE",
    "TRIP_RETURN", 
    "FOLLOW_UP_CALL",
    "PAYMENT_DUE",
    "SEASONAL_CAMPAIGN",
    "TASK",
    "OTHER"
  ]),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  startTime: z.string().optional(),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  endTime: z.string().optional(),
  allDay: z.boolean().optional().default(false),
  contactId: z.string().optional(),
  tripId: z.string().optional(),
  reminderMinutes: z.array(z.number()).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventModalProps {
  event?: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  defaultDate?: Date | null;
  contactId?: string;
  tripId?: string;
}

const EVENT_TYPES = [
  { value: "CLIENT_MEETING", label: "Reunión con Cliente", icon: Users, color: "text-blue-400" },
  { value: "TRIP_DEPARTURE", label: "Salida de Viaje", icon: Plane, color: "text-green-400" },
  { value: "TRIP_RETURN", label: "Regreso de Viaje", icon: Plane, color: "text-purple-400" },
  { value: "FOLLOW_UP_CALL", label: "Llamada de Seguimiento", icon: Phone, color: "text-amber-400" },
  { value: "PAYMENT_DUE", label: "Vencimiento de Pago", icon: Clock, color: "text-red-400" },
  { value: "SEASONAL_CAMPAIGN", label: "Campaña Estacional", icon: Calendar, color: "text-pink-400" },
  { value: "TASK", label: "Tarea", icon: Clock, color: "text-gray-400" },
  { value: "OTHER", label: "Otro", icon: Calendar, color: "text-gray-400" },
];

const REMINDER_OPTIONS = [
  { value: 0, label: "Al momento" },
  { value: 5, label: "5 minutos antes" },
  { value: 15, label: "15 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
  { value: 1440, label: "1 día antes" },
  { value: 10080, label: "1 semana antes" },
];

export const EventModal = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  defaultDate,
  contactId,
  tripId,
}: EventModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { contacts } = useContacts();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "CLIENT_MEETING",
      allDay: false,
      reminderMinutes: [60], // Default 1 hour reminder
    },
  });

  const watchAllDay = watch("allDay");
  const watchType = watch("type");

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (event) {
        // Edit mode
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = new Date(event.endDate);
        
        reset({
          title: event.title,
          description: event.description || "",
          type: event.type,
          startDate: format(eventStartDate, "yyyy-MM-dd"),
          startTime: event.allDay ? "" : format(eventStartDate, "HH:mm"),
          endDate: format(eventEndDate, "yyyy-MM-dd"),
          endTime: event.allDay ? "" : format(eventEndDate, "HH:mm"),
          allDay: event.allDay,
          contactId: event.contactId || "",
          tripId: event.tripId || "",
          reminderMinutes: event.reminderMinutes || [60],
        });
      } else {
        // Create mode
        const date = defaultDate || new Date();
        const endDate = new Date(date);
        endDate.setHours(date.getHours() + 1); // Default 1 hour duration
        
        reset({
          title: "",
          description: "",
          type: "CLIENT_MEETING",
          startDate: format(date, "yyyy-MM-dd"),
          startTime: format(date, "HH:mm"),
          endDate: format(endDate, "yyyy-MM-dd"),
          endTime: format(endDate, "HH:mm"),
          allDay: false,
          contactId: contactId || "",
          tripId: tripId || "",
          reminderMinutes: [60],
        });
      }
    }
  }, [isOpen, event, defaultDate, contactId, tripId, reset]);

  // Auto-update end time when all day is toggled
  useEffect(() => {
    if (watchAllDay) {
      setValue("startTime", "");
      setValue("endTime", "");
    } else if (!watch("startTime")) {
      const now = new Date();
      setValue("startTime", format(now, "HH:mm"));
      setValue("endTime", format(new Date(now.getTime() + 60 * 60 * 1000), "HH:mm"));
    }
  }, [watchAllDay, setValue, watch]);

  if (!isOpen) return null;

  const handleSave = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      // Parse dates
      const startDateTime = new Date(`${data.startDate}T${data.startTime || "00:00"}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime || "23:59"}`);

      const eventData = {
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: data.allDay,
        contactId: data.contactId || undefined,
        tripId: data.tripId || undefined,
        reminderMinutes: data.reminderMinutes || [60],
        assignedToId: event?.assignedToId || "current-user", // This should come from auth
      };

      if (event) {
        await onSave({ id: event.id, ...eventData });
      } else {
        await onSave(eventData);
      }

      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !onDelete) return;
    
    setIsLoading(true);
    try {
      await onDelete(event.id);
      onClose();
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEventType = EVENT_TYPES.find(type => type.value === watchType);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              {selectedEventType ? (
                <selectedEventType.icon className={`w-6 h-6 ${selectedEventType.color}`} />
              ) : (
                <Calendar className="w-6 h-6 text-blue-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {event ? "Editar Evento" : "Nuevo Evento"}
              </h2>
              {event && (
                <p className="text-white/60">
                  {format(new Date(event.startDate), "dd/MM/yyyy", { locale: es })}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <Input
                {...register("title")}
                label="Título del Evento"
                placeholder="Reunión con cliente..."
                error={errors.title?.message}
              />

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Tipo de Evento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                        watchType === type.value
                          ? "bg-primary-500/20 border border-primary-500/30"
                          : "glass hover:bg-white/10"
                      }`}
                    >
                      <input
                        {...register("type")}
                        type="radio"
                        value={type.value}
                        className="sr-only"
                      />
                      <type.icon className={`w-4 h-4 ${type.color}`} />
                      <span className="text-sm text-white">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Descripción
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Descripción del evento..."
                  className="input-glass w-full h-20 resize-none"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Fecha y Hora</h3>
              
              <div className="flex items-center gap-2">
                <input
                  {...register("allDay")}
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary-500"
                />
                <label className="text-sm text-white">Todo el día</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    {...register("startDate")}
                    type="date"
                    className="input-glass w-full"
                  />
                  {errors.startDate && (
                    <p className="text-red-400 text-sm mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Fecha de Fin
                  </label>
                  <input
                    {...register("endDate")}
                    type="date"
                    className="input-glass w-full"
                  />
                  {errors.endDate && (
                    <p className="text-red-400 text-sm mt-1">{errors.endDate.message}</p>
                  )}
                </div>

                {!watchAllDay && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Hora de Inicio
                      </label>
                      <input
                        {...register("startTime")}
                        type="time"
                        className="input-glass w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Hora de Fin
                      </label>
                      <input
                        {...register("endTime")}
                        type="time"
                        className="input-glass w-full"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Associations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Asociaciones</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Contacto (Opcional)
                  </label>
                  <select {...register("contactId")} className="input-glass w-full">
                    <option value="">Seleccionar contacto</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    ID del Viaje (Opcional)
                  </label>
                  <input
                    {...register("tripId")}
                    placeholder="ID del viaje"
                    className="input-glass w-full"
                  />
                </div>
              </div>
            </div>

            {/* Reminders */}
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Recordatorios</h3>
              <div className="flex flex-wrap gap-2">
                {REMINDER_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      {...register("reminderMinutes")}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary-500"
                    />
                    <span className="text-sm text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-white/10">
              <div>
                {event && onDelete && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="glass"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  {event ? "Guardar Cambios" : "Crear Evento"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-white/80 mb-6">
                ¿Estás seguro de que deseas eliminar este evento?{" "}
                <span className="font-semibold">{event?.title}</span>
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="glass"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  isLoading={isLoading}
                >
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};