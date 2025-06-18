import { useState } from "react";
import { Plus, Download, Upload, Users } from "lucide-react";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { ContactFilters } from "../../components/contacts/ContactFilters";
import { ContactsTable } from "../../components/contacts/ContactsTable";
import { ContactForm } from "../../components/contacts/ContactForm";
import { useContacts } from "../../hooks/useContacts";
import { useContactsStore } from "../../store/contacts.store";
import { Contact } from "../../services/contacts.service";
import { contactsService } from "../../services/contacts.service";
import toast from "react-hot-toast";

const ContactsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const {
    contacts,
    totalContacts,
    isLoading,
    createContact,
    updateContact,
    updateContactStatus,
    deleteContact,
  } = useContacts();

  const { currentPage, pageSize, setPage } = useContactsStore();

  const handleCreateContact = async (data: any) => {
    try {
      await createContact(data);
      setShowForm(false);
      setEditingContact(null);
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleUpdateContact = async (data: any) => {
    if (!editingContact) return;

    try {
      await updateContact({ id: editingContact.id, data });
      setShowForm(false);
      setEditingContact(null);
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleStatusChange = async (
    contact: Contact,
    newStatus: Contact["status"]
  ) => {
    try {
      await updateContactStatus({ id: contact.id, status: newStatus });
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleDeleteContact = async () => {
    if (!deletingContact) return;

    try {
      await deleteContact(deletingContact.id);
      setDeletingContact(null);
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleExport = async () => {
    try {
      const blob = await contactsService.exportContacts(
        useContactsStore.getState().filters,
        "csv"
      );

      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contactos_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Contactos exportados exitosamente");
    } catch (error) {
      toast.error("Error al exportar contactos");
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const totalPages = Math.ceil(totalContacts / pageSize);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Contactos</h1>
          <p className="text-white/60">{totalContacts} contactos en total</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="glass"
            leftIcon={<Upload className="w-5 h-5" />}
            disabled
          >
            Importar
          </Button>
          <Button
            variant="glass"
            leftIcon={<Download className="w-5 h-5" />}
            onClick={handleExport}
          >
            Exportar
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setShowForm(true)}
          >
            Nuevo Contacto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Interesados</p>
                <p className="text-2xl font-bold text-white">
                  {contacts.filter((c) => c.status === "INTERESADO").length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Pasajeros</p>
                <p className="text-2xl font-bold text-white">
                  {contacts.filter((c) => c.status === "PASAJERO").length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Clientes</p>
                <p className="text-2xl font-bold text-white">
                  {contacts.filter((c) => c.status === "CLIENTE").length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/20">
                <Users className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ContactFilters />

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contactos</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactsTable
            contacts={contacts}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={setDeletingContact}
            onStatusChange={handleStatusChange}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        currentPage === pageNum
                          ? "bg-primary-500 text-white"
                          : "glass text-white/60 hover:text-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="glass"
                size="sm"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Form Modal */}
      {showForm && (
        <ContactForm
          contact={editingContact}
          onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
          onCancel={() => {
            setShowForm(false);
            setEditingContact(null);
          }}
          isLoading={false}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-white/80 mb-6">
                ¿Estás seguro de que deseas eliminar a{" "}
                <span className="font-semibold">
                  {deletingContact.firstName} {deletingContact.lastName}
                </span>
                ? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="glass"
                  onClick={() => setDeletingContact(null)}
                >
                  Cancelar
                </Button>
                <Button variant="danger" onClick={handleDeleteContact}>
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

export default ContactsPage;
