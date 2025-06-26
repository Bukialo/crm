// src/pages/contacts/ContactDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { Contact } from "../../types/contact.types";
import { useContacts } from "../../hooks/useContacts";

export const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { deleteContact } = useContacts();

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data para el contacto (en una implementación real vendría de la API)
  useEffect(() => {
    const loadContact = async () => {
      setLoading(true);

      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock contact data
      const mockContact: Contact = {
        id: id || "1",
        firstName: "María",
        lastName: "García",
        email: "maria@example.com",
        phone: "+54 11 1234-5678",
        status: "CLIENTE",
        source: "WEBSITE",
        tags: ["VIP", "Frecuente", "Luna de Miel"],
        birthDate: new Date("1985-03-15"),
        assignedAgent: "Ana López",
        lastContact: new Date("2025-06-20"),
        nextFollowUp: new Date("2025-06-30"),
        createdAt: new Date("2025-06-01"),
        updatedAt: new Date("2025-06-20"),
        travelPreferences: {
          destinations: ["París", "Roma", "Barcelona"],
          budgetRange: "HIGH",
          travelStyle: "CULTURAL",
          groupSize: 2,
          preferredSeasons: ["Primavera", "Verano"],
        },
      };

      setContact(mockContact);
      setLoading(false);
    };

    if (id) {
      loadContact();
    }
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Contacto no encontrado
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          El contacto que buscas no existe o ha sido eliminado
        </p>
        <button
          onClick={() => navigate("/contacts")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Contactos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/contacts")}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
              {contact.firstName.charAt(0)}
              {contact.lastName.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {contact.firstName} {contact.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}
                >
                  {contact.status}
                </span>
                {contact.source && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                    {contact.source}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Información del Contacto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Datos Personales
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Email:
                </span>
                <span className="ml-2 text-sm text-gray-900 dark:text-white">
                  {contact.email}
                </span>
              </div>
              {contact.phone && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Teléfono:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                    {contact.phone}
                  </span>
                </div>
              )}
              {contact.birthDate && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Fecha de Nacimiento:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                    {new Date(contact.birthDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Información Comercial
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Estado:
                </span>
                <span className="ml-2 text-sm text-gray-900 dark:text-white">
                  {contact.status}
                </span>
              </div>
              {contact.assignedAgent && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Agente:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                    {contact.assignedAgent}
                  </span>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Registrado:
                </span>
                <span className="ml-2 text-sm text-gray-900 dark:text-white">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Etiquetas
            </h4>
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Travel Preferences */}
        {contact.travelPreferences && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Preferencias de Viaje
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contact.travelPreferences.destinations.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Destinos de Interés:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {contact.travelPreferences.destinations.map(
                      (dest: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs"
                        >
                          {dest}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Presupuesto:
                </span>
                <span className="ml-2 text-sm text-gray-900 dark:text-white">
                  {contact.travelPreferences.budgetRange}
                </span>
              </div>

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Estilo de Viaje:
                </span>
                <span className="ml-2 text-sm text-gray-900 dark:text-white">
                  {contact.travelPreferences.travelStyle}
                </span>
              </div>

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Tamaño del Grupo:
                </span>
                <span className="ml-2 text-sm text-gray-900 dark:text-white">
                  {contact.travelPreferences.groupSize} personas
                </span>
              </div>
            </div>

            {contact.travelPreferences.preferredSeasons.length > 0 && (
              <div className="mt-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Temporadas Preferidas:
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {contact.travelPreferences.preferredSeasons.map(
                    (season: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded text-xs"
                      >
                        {season}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
          Editar Contacto
        </button>
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          Enviar Email
        </button>
        <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
          Nueva Cotización
        </button>
        <button
          onClick={async () => {
            if (
              window.confirm(
                "¿Estás seguro de que quieres eliminar este contacto?"
              )
            ) {
              try {
                await deleteContact(contact.id);
                navigate("/contacts");
              } catch (error) {
                console.error("Error deleting contact:", error);
              }
            }
          }}
          className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};
