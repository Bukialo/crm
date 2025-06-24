// src/components/contacts/ContactModal.tsx
import React, { useState, useEffect } from "react";
import { X, User, Mail, Phone, Calendar, MapPin, Tag } from "lucide-react";
import { Contact } from "../../types/contact.types";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contactData: Partial<Contact>) => Promise<void>;
  contact?: Contact | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contact,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "INTERESADO" as Contact["status"],
    birthDate: "",
    source: "WEBSITE",
    assignedAgent: "",
    tags: "",
    // Travel preferences - Corregidos los tipos por defecto
    destinations: "",
    budgetRange: "MEDIUM" as Contact["travelPreferences"]["budgetRange"],
    travelStyle: "RELAXATION" as Contact["travelPreferences"]["travelStyle"],
    groupSize: 2,
    preferredSeasons: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or contact changes
  useEffect(() => {
    if (isOpen) {
      if (contact) {
        // Edit mode - Corregidos los tipos de las propiedades
        setFormData({
          firstName: contact.firstName || "",
          lastName: contact.lastName || "",
          email: contact.email || "",
          phone: contact.phone || "",
          status: contact.status || "INTERESADO",
          birthDate: contact.birthDate
            ? new Date(contact.birthDate).toISOString().split("T")[0]
            : "",
          source: contact.source || "WEBSITE",
          assignedAgent: contact.assignedAgent || "",
          tags: contact.tags?.join(", ") || "",
          destinations:
            contact.travelPreferences?.destinations.join(", ") || "",
          budgetRange: contact.travelPreferences?.budgetRange || "MEDIUM",
          travelStyle: contact.travelPreferences?.travelStyle || "RELAXATION",
          groupSize: contact.travelPreferences?.groupSize || 2,
          preferredSeasons:
            contact.travelPreferences?.preferredSeasons.join(", ") || "",
        });
      } else {
        // Create mode
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          status: "INTERESADO",
          birthDate: "",
          source: "WEBSITE",
          assignedAgent: "",
          tags: "",
          destinations: "",
          budgetRange: "MEDIUM",
          travelStyle: "RELAXATION",
          groupSize: 2,
          preferredSeasons: "",
        });
      }
      setError(null);
    }
  }, [isOpen, contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.firstName.trim()) {
        throw new Error("El nombre es requerido");
      }
      if (!formData.lastName.trim()) {
        throw new Error("El apellido es requerido");
      }
      if (!formData.email.trim()) {
        throw new Error("El email es requerido");
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("El formato del email no es válido");
      }

      // Preparar datos del contacto
      const contactData: Partial<Contact> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        status: formData.status,
        birthDate: formData.birthDate
          ? new Date(formData.birthDate)
          : undefined,
        source: formData.source,
        assignedAgent: formData.assignedAgent.trim() || undefined,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
        travelPreferences: {
          destinations: formData.destinations
            ? formData.destinations
                .split(",")
                .map((dest) => dest.trim())
                .filter(Boolean)
            : [],
          budgetRange: formData.budgetRange,
          travelStyle: formData.travelStyle,
          groupSize: formData.groupSize,
          preferredSeasons: formData.preferredSeasons
            ? formData.preferredSeasons
                .split(",")
                .map((season) => season.trim())
                .filter(Boolean)
            : [],
        },
      };

      await onSubmit(contactData);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el contacto"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {contact ? "Editar Contacto" : "Nuevo Contacto"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {contact
                  ? "Actualiza la información del contacto"
                  : "Agrega un nuevo contacto a tu base de datos"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="Ej: María"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Ej: García"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="maria@example.com"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+54 11 1234-5678"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Nacimiento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Información Comercial */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Información Comercial
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="INTERESADO">Interesado</option>
                  <option value="PASAJERO">Pasajero</option>
                  <option value="CLIENTE">Cliente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fuente
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleChange("source", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="WEBSITE">Sitio Web</option>
                  <option value="REFERRAL">Referido</option>
                  <option value="SOCIAL_MEDIA">Redes Sociales</option>
                  <option value="ADVERTISING">Publicidad</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Etiquetas
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  placeholder="VIP, Frecuente, Corporativo (separadas por coma)"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Preferencias de Viaje */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Preferencias de Viaje
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Destinos de Interés
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.destinations}
                  onChange={(e) => handleChange("destinations", e.target.value)}
                  placeholder="París, Roma, Barcelona (separados por coma)"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rango de Presupuesto
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) =>
                    handleChange(
                      "budgetRange",
                      e.target
                        .value as Contact["travelPreferences"]["budgetRange"]
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="LOW">Económico ($0 - $1,000)</option>
                  <option value="MEDIUM">Medio ($1,000 - $3,000)</option>
                  <option value="HIGH">Alto ($3,000 - $5,000)</option>
                  <option value="LUXURY">Lujo ($5,000+)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estilo de Viaje
                </label>
                <select
                  value={formData.travelStyle}
                  onChange={(e) =>
                    handleChange(
                      "travelStyle",
                      e.target
                        .value as Contact["travelPreferences"]["travelStyle"]
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="ADVENTURE">Aventura</option>
                  <option value="RELAXATION">Relax</option>
                  <option value="CULTURAL">Cultural</option>
                  <option value="BUSINESS">Negocios</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tamaño del Grupo
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.groupSize}
                  onChange={(e) =>
                    handleChange("groupSize", parseInt(e.target.value) || 1)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temporadas Preferidas
                </label>
                <input
                  type="text"
                  value={formData.preferredSeasons}
                  onChange={(e) =>
                    handleChange("preferredSeasons", e.target.value)
                  }
                  placeholder="Verano, Invierno (separadas por coma)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <User className="w-4 h-4" />
              )}
              {loading
                ? "Guardando..."
                : contact
                  ? "Actualizar Contacto"
                  : "Crear Contacto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
