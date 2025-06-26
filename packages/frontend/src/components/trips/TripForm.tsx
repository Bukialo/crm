// packages/frontend/src/components/trips/TripForm.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Plane,
  Building,
  Car,
  Camera,
  Shield,
  Plus,
  X,
} from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { CreateTripDto, Trip } from "../../services/trip.service";
import { useContactsForTrips } from "../../hooks/useContactsForTrips";

// Tipo simplificado para el formulario
interface TripFormData {
  contactId: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  estimatedBudget: number;
  finalPrice?: number;
  commission?: number;
  includesFlight: boolean;
  includesHotel: boolean;
  includesTransfer: boolean;
  includesTours: boolean;
  includesInsurance: boolean;
  customServices: string[];
  notes?: string;
  internalNotes?: string;
}

interface TripFormProps {
  initialData?: Partial<Trip>;
  onSubmit: (data: CreateTripDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [customService, setCustomService] = useState("");

  // Usar el nuevo hook para contactos
  const contactsQuery = useContactsForTrips({ pageSize: 100 });
  const contacts = contactsQuery.data?.items || [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TripFormData>({
    defaultValues: {
      contactId: initialData?.contactId || "",
      destination: initialData?.destination || "",
      departureDate: initialData?.departureDate?.split("T")[0] || "",
      returnDate: initialData?.returnDate?.split("T")[0] || "",
      travelers: initialData?.travelers || 1,
      estimatedBudget: initialData?.estimatedBudget || 0,
      finalPrice: initialData?.finalPrice || undefined,
      commission: initialData?.commission || undefined,
      includesFlight: initialData?.includesFlight || false,
      includesHotel: initialData?.includesHotel || false,
      includesTransfer: initialData?.includesTransfer || false,
      includesTours: initialData?.includesTours || false,
      includesInsurance: initialData?.includesInsurance || false,
      customServices: initialData?.customServices || [],
      notes: initialData?.notes || "",
      internalNotes: initialData?.internalNotes || "",
    },
  });

  const watchedServices = watch("customServices");

  const addCustomService = () => {
    if (customService.trim()) {
      const currentServices = watchedServices || [];
      setValue("customServices", [...currentServices, customService.trim()]);
      setCustomService("");
    }
  };

  const removeCustomService = (index: number) => {
    const currentServices = watchedServices || [];
    setValue(
      "customServices",
      currentServices.filter((_, i) => i !== index)
    );
  };

  const onFormSubmit = (data: TripFormData) => {
    console.log("📝 Form data received:", data);
    
    // Validaciones básicas
    if (!data.contactId) {
      alert("Por favor selecciona un contacto");
      return;
    }
    
    if (!data.destination) {
      alert("Por favor ingresa un destino");
      return;
    }
    
    if (!data.departureDate || !data.returnDate) {
      alert("Por favor selecciona las fechas");
      return;
    }
    
    if (new Date(data.returnDate) <= new Date(data.departureDate)) {
      alert("La fecha de regreso debe ser posterior a la de salida");
      return;
    }

    // Preparar datos para envío con logging detallado
    const submitData: CreateTripDto = {
      contactId: data.contactId,
      destination: data.destination.trim(),
      departureDate: data.departureDate,
      returnDate: data.returnDate,
      travelers: Number(data.travelers) || 1,
      estimatedBudget: Number(data.estimatedBudget) || 0,
      finalPrice: data.finalPrice ? Number(data.finalPrice) : undefined,
      commission: data.commission ? Number(data.commission) : undefined,
      includesFlight: Boolean(data.includesFlight),
      includesHotel: Boolean(data.includesHotel),
      includesTransfer: Boolean(data.includesTransfer),
      includesTours: Boolean(data.includesTours),
      includesInsurance: Boolean(data.includesInsurance),
      customServices: data.customServices || [],
      notes: data.notes?.trim() || undefined,
      internalNotes: data.internalNotes?.trim() || undefined,
    };
    
    // Debug detallado
    console.log("📤 Sending data to API:", submitData);
    console.log("🔍 Data types check:", {
      contactId: typeof submitData.contactId,
      destination: typeof submitData.destination,
      departureDate: typeof submitData.departureDate,
      returnDate: typeof submitData.returnDate,
      travelers: typeof submitData.travelers,
      estimatedBudget: typeof submitData.estimatedBudget,
      includesFlight: typeof submitData.includesFlight,
      customServices: Array.isArray(submitData.customServices),
    });
    
    onSubmit(submitData);
  };

  // Debug: Mostrar contactos cargados
  useEffect(() => {
    console.log("👥 Contacts loaded in form:", {
      count: contacts.length,
      source: contactsQuery.source,
      isLoading: contactsQuery.isLoading,
      contacts: contacts
    });
  }, [contacts, contactsQuery]);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Información básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Información Básica
        </h3>

        {/* Contacto */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Contacto *
          </label>
          <select
            {...register("contactId", { required: "Contacto es requerido" })}
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            disabled={isLoading || contactsQuery.isLoading}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='rgba(255,255,255,0.5)' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="" className="bg-gray-800 text-white">
              {contactsQuery.isLoading ? "Cargando contactos..." : "Seleccionar contacto"}
            </option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id} className="bg-gray-800 text-white">
                {contact.firstName} {contact.lastName} - {contact.email}
              </option>
            ))}
          </select>
          {errors.contactId && (
            <p className="mt-1 text-sm text-red-400">
              {errors.contactId.message}
            </p>
          )}
          {/* Debug info */}
          <p className="text-xs text-white/40 mt-1">
            {contacts.length} contactos disponibles ({contactsQuery.source})
            {contactsQuery.error && " - Error API, usando datos locales"}
          </p>
        </div>

        {/* Destino */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Destino *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              {...register("destination", { required: "Destino es requerido" })}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg pl-10 pr-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              placeholder="París, Francia"
              disabled={isLoading}
            />
          </div>
          {errors.destination && (
            <p className="mt-1 text-sm text-red-400">{errors.destination.message}</p>
          )}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Fecha de Salida *"
            type="date"
            {...register("departureDate", { required: "Fecha de salida es requerida" })}
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.departureDate?.message}
            disabled={isLoading}
          />
          <Input
            label="Fecha de Regreso *"
            type="date"
            {...register("returnDate", { required: "Fecha de regreso es requerida" })}
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.returnDate?.message}
            disabled={isLoading}
          />
        </div>

        {/* Viajeros */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Número de Viajeros *
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="number"
              min="1"
              max="50"
              {...register("travelers", { 
                required: "Número de viajeros es requerido",
                valueAsNumber: true,
                min: { value: 1, message: "Mínimo 1 viajero" }
              })}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg pl-10 pr-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              placeholder="1"
              disabled={isLoading}
            />
          </div>
          {errors.travelers && (
            <p className="mt-1 text-sm text-red-400">{errors.travelers.message}</p>
          )}
        </div>
      </div>

      {/* Presupuesto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Presupuesto</h3>

        <div className="grid grid-cols-3 gap-4">
          {/* Presupuesto Estimado */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Presupuesto Estimado *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("estimatedBudget", { 
                  required: "Presupuesto es requerido",
                  valueAsNumber: true,
                  min: { value: 1, message: "Presupuesto debe ser mayor a 0" }
                })}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg pl-10 pr-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            {errors.estimatedBudget && (
              <p className="mt-1 text-sm text-red-400">{errors.estimatedBudget.message}</p>
            )}
          </div>

          {/* Precio Final */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Precio Final
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("finalPrice", { valueAsNumber: true })}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg pl-10 pr-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            {errors.finalPrice && (
              <p className="mt-1 text-sm text-red-400">{errors.finalPrice.message}</p>
            )}
          </div>

          {/* Comisión */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Comisión
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("commission", { valueAsNumber: true })}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg pl-10 pr-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            {errors.commission && (
              <p className="mt-1 text-sm text-red-400">{errors.commission.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Servicios incluidos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Servicios Incluidos
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "includesFlight", label: "Vuelos", icon: Plane },
            { key: "includesHotel", label: "Hoteles", icon: Building },
            { key: "includesTransfer", label: "Traslados", icon: Car },
            { key: "includesTours", label: "Tours", icon: Camera },
            { key: "includesInsurance", label: "Seguro", icon: Shield },
          ].map(({ key, label, icon: Icon }) => (
            <label key={key} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                {...register(key as keyof TripFormData)}
                className="w-4 h-4 text-purple-600 bg-transparent border-white/30 rounded focus:ring-purple-500"
                disabled={isLoading}
              />
              <Icon className="w-4 h-4 text-white/60" />
              <span className="text-white/80">{label}</span>
            </label>
          ))}
        </div>

        {/* Servicios personalizados */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Servicios Adicionales
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              placeholder="Agregar servicio personalizado"
              className="input-glass flex-1"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomService();
                }
              }}
            />
            <Button
              type="button"
              variant="glass"
              onClick={addCustomService}
              disabled={!customService.trim() || isLoading}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Lista de servicios personalizados */}
          {watchedServices && watchedServices.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {watchedServices.map((service, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => removeCustomService(index)}
                    className="hover:text-purple-100"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Notas</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Notas del Cliente
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className="input-glass w-full resize-none"
              placeholder="Notas visibles para el cliente..."
              disabled={isLoading}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-400">{errors.notes.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Notas Internas
            </label>
            <textarea
              {...register("internalNotes")}
              rows={3}
              className="input-glass w-full resize-none"
              placeholder="Notas internas del equipo..."
              disabled={isLoading}
            />
            {errors.internalNotes && (
              <p className="mt-1 text-sm text-red-400">
                {errors.internalNotes.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {initialData ? "Actualizar Viaje" : "Crear Viaje"}
        </Button>
      </div>
    </form>
  );
};

export default TripForm;