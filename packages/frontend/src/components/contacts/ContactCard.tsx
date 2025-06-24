// src/components/contacts/ContactCard.tsx
import React from "react";
import { Mail, Phone, Calendar, Edit, Trash2, MapPin } from "lucide-react";
import { Contact } from "../../types/contact.types";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "INTERESADO":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "PASAJERO":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "CLIENTE":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusText = (status: Contact["status"]) => {
    switch (status) {
      case "INTERESADO":
        return "Interesado";
      case "PASAJERO":
        return "Pasajero";
      case "CLIENTE":
        return "Cliente";
      default:
        return "Desconocido";
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar a ${contact.firstName} ${contact.lastName}?`
      )
    ) {
      onDelete(contact.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
            {contact.firstName.charAt(0)}
            {contact.lastName.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {contact.firstName} {contact.lastName}
            </h3>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}
            >
              {getStatusText(contact.status)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(contact)}
            className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Editar contacto"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Eliminar contacto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300">
            {contact.email}
          </span>
        </div>

        {contact.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {contact.phone}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300">
            Registrado: {formatDate(contact.createdAt)}
          </span>
        </div>

        {/* Travel Preferences */}
        {contact.travelPreferences &&
          contact.travelPreferences.destinations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    Destinos de interés:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contact.travelPreferences.destinations
                      .slice(0, 2)
                      .map((destination, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          {destination}
                        </span>
                      ))}
                    {contact.travelPreferences.destinations.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                        +{contact.travelPreferences.destinations.length - 2} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {contact.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {contact.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                  +{contact.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{contact.source && `Fuente: ${contact.source}`}</span>
          {contact.lastContact && (
            <span>Último contacto: {formatDate(contact.lastContact)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
