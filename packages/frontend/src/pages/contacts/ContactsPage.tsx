// src/pages/contacts/ContactsPage.tsx
import React, { useState } from "react";
import { Users, Plus, Filter, Search, Download, Upload } from "lucide-react";
import { useContacts } from "../../hooks/useContacts";
import { ContactCard } from "../../components/contacts/ContactCard";
import { ContactModal } from "../../components/contacts/ContactModal";
import { ImportModal } from "../../components/contacts/ImportModal";
import { Contact } from "../../types/contact.types";

export const ContactsPage: React.FC = () => {
  const { contacts, isLoading, createContact, updateContact, deleteContact } =
    useContacts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filtrar contactos
  const filteredContacts = contacts.filter((contact: Contact) => {
    const matchesSearch =
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateContact = async (contactData: Partial<Contact>) => {
    try {
      await createContact({
        firstName: contactData.firstName || "",
        lastName: contactData.lastName || "",
        email: contactData.email || "",
        phone: contactData.phone,
        status: contactData.status || "INTERESADO",
        source: contactData.source,
        tags: contactData.tags,
        travelPreferences: contactData.travelPreferences,
        birthDate: contactData.birthDate,
        assignedAgent: contactData.assignedAgent,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating contact:", error);
    }
  };

  const handleUpdateContact = async (contactData: Partial<Contact>) => {
    try {
      if (selectedContact) {
        await updateContact({
          id: selectedContact.id,
          data: {
            firstName: contactData.firstName || selectedContact.firstName,
            lastName: contactData.lastName || selectedContact.lastName,
            email: contactData.email || selectedContact.email,
            phone: contactData.phone,
            status: contactData.status || selectedContact.status,
            source: contactData.source,
            tags: contactData.tags,
            travelPreferences: contactData.travelPreferences,
            birthDate: contactData.birthDate,
            assignedAgent: contactData.assignedAgent,
          },
        });
        setSelectedContact(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const handleImportContacts = async (file: File) => {
    try {
      // Esta función se implementará en el hook useContacts
      console.log("Importing file:", file.name);
      // await importContacts(file);
      setIsImportModalOpen(false);
    } catch (error) {
      console.error("Error importing contacts:", error);
    }
  };

  const openEditModal = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedContact(null);
    setIsModalOpen(true);
  };

  const exportContacts = () => {
    const csv = [
      // Headers
      "firstName,lastName,email,phone,status,createdAt",
      // Data
      ...contacts.map(
        (contact: Contact) =>
          `${contact.firstName},${contact.lastName},${contact.email},${contact.phone || ""},${contact.status},${contact.createdAt}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteContact(id);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contactos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tus contactos y leads de viajes
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importar
          </button>

          <button
            onClick={exportContacts}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Contacto
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Interesados
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {/* Corregido: Especificar tipo del parámetro */}
                {
                  contacts.filter((c: Contact) => c.status === "INTERESADO")
                    .length
                }
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pasajeros
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {/* Corregido: Especificar tipo del parámetro */}
                {
                  contacts.filter((c: Contact) => c.status === "PASAJERO")
                    .length
                }
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Clientes
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {/* Corregido: Especificar tipo del parámetro */}
                {contacts.filter((c: Contact) => c.status === "CLIENTE").length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="ALL">Todos los estados</option>
            <option value="INTERESADO">Interesados</option>
            <option value="PASAJERO">Pasajeros</option>
            <option value="CLIENTE">Clientes</option>
          </select>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact: Contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onEdit={openEditModal}
            onDelete={handleDeleteContact}
          />
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay contactos
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter !== "ALL"
              ? "No se encontraron contactos con los filtros aplicados"
              : "Comienza agregando tu primer contacto"}
          </p>
          {!searchTerm && statusFilter === "ALL" && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear Contacto
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedContact(null);
        }}
        onSubmit={selectedContact ? handleUpdateContact : handleCreateContact}
        contact={selectedContact}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportContacts}
      />
    </div>
  );
};
