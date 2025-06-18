import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Contact, CreateContactDto } from "../../services/contacts.service";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";

const contactSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  status: z.enum(["INTERESADO", "PASAJERO", "CLIENTE"]).optional(),
  source: z.string().optional(),
  budgetRange: z.string().optional(),
  tags: z.string().optional(),
  preferredDestinations: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  contact?: Contact | null;
  onSubmit: (data: CreateContactDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const statusOptions = [
  { value: "INTERESADO", label: "Interesado" },
  { value: "PASAJERO", label: "Pasajero" },
  { value: "CLIENTE", label: "Cliente" },
];

const sourceOptions = [
  { value: "WEBSITE", label: "Sitio Web" },
  { value: "REFERRAL", label: "Referido" },
  { value: "SOCIAL_MEDIA", label: "Redes Sociales" },
  { value: "ADVERTISING", label: "Publicidad" },
  { value: "DIRECT", label: "Directo" },
  { value: "PARTNER", label: "Partner" },
  { value: "OTHER", label: "Otro" },
];

const budgetRangeOptions = [
  { value: "LOW", label: "Económico ($0 - $1,000)" },
  { value: "MEDIUM", label: "Medio ($1,000 - $3,000)" },
  { value: "HIGH", label: "Alto ($3,000 - $10,000)" },
  { value: "LUXURY", label: "Lujo ($10,000+)" },
];

export const ContactForm = ({
  contact,
  onSubmit,
  onCancel,
  isLoading,
}: ContactFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: contact?.firstName || "",
      lastName: contact?.lastName || "",
      email: contact?.email || "",
      phone: contact?.phone || "",
      status: contact?.status || "INTERESADO",
      source: contact?.source || "",
      budgetRange: contact?.budgetRange || "",
      tags: contact?.tags?.join(", ") || "",
      preferredDestinations: contact?.preferredDestinations?.join(", ") || "",
    },
  });

  const handleFormSubmit = async (data: ContactFormData) => {
    const formattedData: CreateContactDto = {
      ...data,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      preferredDestinations: data.preferredDestinations
        ? data.preferredDestinations
            .split(",")
            .map((dest) => dest.trim())
            .filter(Boolean)
        : [],
    };

    await onSubmit(formattedData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {contact ? "Editar Contacto" : "Nuevo Contacto"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Información básica */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">
              Información Personal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register("firstName")}
                label="Nombre"
                placeholder="Juan"
                error={errors.firstName?.message}
              />
              <Input
                {...register("lastName")}
                label="Apellido"
                placeholder="Pérez"
                error={errors.lastName?.message}
              />
              <Input
                {...register("email")}
                type="email"
                label="Email"
                placeholder="juan@ejemplo.com"
                error={errors.email?.message}
              />
              <Input
                {...register("phone")}
                label="Teléfono"
                placeholder="+54 11 1234-5678"
                error={errors.phone?.message}
              />
            </div>
          </div>

          {/* Estado y fuente */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">
              Clasificación
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Estado
                </label>
                <select {...register("status")} className="input-glass w-full">
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Fuente
                </label>
                <select {...register("source")} className="input-glass w-full">
                  <option value="">Seleccionar fuente</option>
                  {sourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Preferencias de viaje */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">
              Preferencias de Viaje
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Rango de Presupuesto
                </label>
                <select
                  {...register("budgetRange")}
                  className="input-glass w-full"
                >
                  <option value="">Seleccionar presupuesto</option>
                  {budgetRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                {...register("preferredDestinations")}
                label="Destinos Preferidos"
                placeholder="París, Roma, Nueva York (separados por comas)"
                error={errors.preferredDestinations?.message}
              />
              <Input
                {...register("tags")}
                label="Etiquetas"
                placeholder="VIP, Corporativo, Familiar (separados por comas)"
                error={errors.tags?.message}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="glass"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {contact ? "Guardar Cambios" : "Crear Contacto"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
