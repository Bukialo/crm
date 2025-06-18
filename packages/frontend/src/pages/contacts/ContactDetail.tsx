import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  Tag,
  Edit,
  Trash2,
  Plus,
  Plane,
  StickyNote,
  Clock,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { ContactStatusBadge } from "../../components/contacts/ContactStatusBadge";
import { useContact, useContacts } from "../../hooks/useContacts";
import { ContactForm } from "../../components/contacts/ContactForm";

const ContactDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contact, isLoading } = useContact(id!);
  const { updateContact, deleteContact, addNote } = useContacts();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  if (isLoading || !contact) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  const handleUpdate = async (data: any) => {
    await updateContact({ id: contact.id, data });
    setShowEditForm(false);
  };

  const handleDelete = async () => {
    await deleteContact(contact.id);
    navigate("/contacts");
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    await addNote({
      contactId: contact.id,
      content: noteContent,
      isImportant: false,
    });

    setNoteContent("");
    setShowNoteForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="glass"
            size="sm"
            onClick={() => navigate("/contacts")}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {contact.firstName} {contact.lastName}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <ContactStatusBadge status={contact.status} />
              <span className="text-white/60">
                Creado{" "}
                {format(new Date(contact.createdAt), "dd/MM/yyyy", {
                  locale: es,
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="glass"
            onClick={() => setShowEditForm(true)}
            leftIcon={<Edit className="w-5 h-5" />}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            leftIcon={<Trash2 className="w-5 h-5" />}
          >
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-sm text-white/60">Email</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-white hover:text-primary-400"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>

                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Teléfono</p>
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-white hover:text-primary-400"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {contact.source && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Fuente</p>
                        <p className="text-white">{contact.source}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {contact.assignedAgent && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Agente Asignado</p>
                        <p className="text-white">
                          {contact.assignedAgent.firstName}{" "}
                          {contact.assignedAgent.lastName}
                        </p>
                      </div>
                    </div>
                  )}

                  {contact.lastContact && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Último Contacto</p>
                        <p className="text-white">
                          {format(new Date(contact.lastContact), "dd/MM/yyyy", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {contact.nextFollowUp && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">
                          Próximo Seguimiento
                        </p>
                        <p className="text-white">
                          {format(
                            new Date(contact.nextFollowUp),
                            "dd/MM/yyyy",
                            { locale: es }
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Viaje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contact.preferredDestinations &&
                  contact.preferredDestinations.length > 0 && (
                    <div>
                      <p className="text-sm text-white/60 mb-2">
                        Destinos Preferidos
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {contact.preferredDestinations.map((dest) => (
                          <span
                            key={dest}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full glass text-sm"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            {dest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {contact.budgetRange && (
                  <div>
                    <p className="text-sm text-white/60 mb-2">
                      Rango de Presupuesto
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                      <DollarSign className="w-4 h-4" />
                      {contact.budgetRange === "LOW" && "Económico"}
                      {contact.budgetRange === "MEDIUM" && "Medio"}
                      {contact.budgetRange === "HIGH" && "Alto"}
                      {contact.budgetRange === "LUXURY" && "Lujo"}
                    </div>
                  </div>
                )}

                {contact.travelStyle && contact.travelStyle.length > 0 && (
                  <div>
                    <p className="text-sm text-white/60 mb-2">
                      Estilo de Viaje
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {contact.travelStyle.map((style) => (
                        <span
                          key={style}
                          className="px-3 py-1 rounded-full glass text-sm"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notas</CardTitle>
                <Button
                  size="sm"
                  variant="glass"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowNoteForm(true)}
                >
                  Agregar Nota
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showNoteForm && (
                <div className="mb-4 p-4 glass rounded-lg">
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Escribe una nota..."
                    className="w-full h-24 bg-transparent text-white placeholder-white/50 resize-none focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="glass"
                      onClick={() => {
                        setShowNoteForm(false);
                        setNoteContent("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button size="sm" variant="primary" onClick={handleAddNote}>
                      Guardar
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="p-4 glass rounded-lg">
                  <div className="flex items-start gap-3">
                    <StickyNote className="w-5 h-5 text-white/60 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white">
                        Cliente interesado en viajes a{" "}
                        {contact.preferredDestinations?.[0] || "Europa"}.
                        Prefiere viajar en temporada baja.
                      </p>
                      <p className="text-sm text-white/60 mt-2">Hace 2 días</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Etiquetas</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.tags && contact.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full glass text-sm"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-sm">Sin etiquetas</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Trips */}
          <Card>
            <CardHeader>
              <CardTitle>Viajes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm">No hay viajes registrados</p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="glass"
                  size="sm"
                  className="w-full justify-start"
                  leftIcon={<Plane className="w-4 h-4" />}
                >
                  Crear Viaje
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  className="w-full justify-start"
                  leftIcon={<Mail className="w-4 h-4" />}
                >
                  Enviar Email
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  className="w-full justify-start"
                  leftIcon={<Calendar className="w-4 h-4" />}
                >
                  Programar Reunión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <ContactForm
          contact={contact}
          onSubmit={handleUpdate}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-white/80 mb-6">
                ¿Estás seguro de que deseas eliminar a{" "}
                <span className="font-semibold">
                  {contact.firstName} {contact.lastName}
                </span>
                ? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="glass"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button variant="danger" onClick={handleDelete}>
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

export default ContactDetail;
