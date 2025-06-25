import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Plane,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Contact } from "../../services/contacts.service";
import { ContactStatusBadge } from "./ContactStatusBadge";
import Button from "../ui/Button";

interface ContactsTableProps {
  contacts: Contact[];
  isLoading: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onStatusChange: (contact: Contact, newStatus: Contact["status"]) => void;
}

export const ContactsTable = ({
  contacts,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
}: ContactsTableProps) => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleRowClick = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  const getNextStatus = (
    currentStatus: Contact["status"]
  ): Contact["status"] | null => {
    switch (currentStatus) {
      case "INTERESADO":
        return "PASAJERO";
      case "PASAJERO":
        return "CLIENTE";
      case "CLIENTE":
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No se encontraron contactos</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
              Contacto
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
              Estado
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
              Contacto
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
              Tags
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
              Último Contacto
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
              Agente
            </th>
            <th className="text-center py-3 px-4 text-sm font-medium text-white/80">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => {
            const nextStatus = getNextStatus(contact.status);

            return (
              <tr
                key={contact.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => handleRowClick(contact.id)}
              >
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-white">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-sm text-white/60">{contact.email}</p>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <ContactStatusBadge status={contact.status} size="sm" />
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-white/60 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-white/60 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs glass"
                      >
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 2 && (
                      <span className="text-xs text-white/60">
                        +{contact.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <p className="text-sm text-white/60">
                    {contact.lastContact
                      ? format(new Date(contact.lastContact), "dd MMM yyyy", {
                          locale: es,
                        })
                      : "Sin contacto"}
                  </p>
                </td>

                <td className="py-4 px-4">
                  <p className="text-sm text-white/80">
                    {contact.assignedAgent
                      ? `${contact.assignedAgent.firstName} ${contact.assignedAgent.lastName}`
                      : "Sin asignar"}
                  </p>
                </td>

                <td className="py-4 px-4">
                  <div
                    className="flex items-center justify-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {nextStatus && (
                      <Button
                        size="sm"
                        variant="glass"
                        onClick={() => onStatusChange(contact, nextStatus)}
                        title={`Cambiar a ${nextStatus}`}
                      >
                        {nextStatus === "PASAJERO" && (
                          <Plane className="w-4 h-4" />
                        )}
                        {nextStatus === "CLIENTE" && (
                          <Star className="w-4 h-4" />
                        )}
                      </Button>
                    )}

                    <div className="relative">
                      <Button
                        size="sm"
                        variant="glass"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === contact.id ? null : contact.id
                          )
                        }
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>

                      {openMenuId === contact.id && (
                        <div className="absolute right-0 mt-2 w-48 glass-morphism rounded-xl shadow-glass-lg p-2 z-10 fade-in">
                          <button
                            onClick={() => {
                              navigate(`/contacts/${contact.id}`);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Ver detalles
                          </button>
                          <button
                            onClick={() => {
                              onEdit(contact);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              onDelete(contact);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
