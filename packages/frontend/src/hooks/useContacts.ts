import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContactsStore } from "../store/contacts.store";
import {
  contactsService,
  Contact,
  CreateContactDto,
  ContactFilters,
} from "../services/contacts.service";
import toast from "react-hot-toast";

export const useContacts = () => {
  const queryClient = useQueryClient();
  const {
    filters,
    setContacts,
    setLoading,
    setCreating,
    setUpdating,
    setDeleting,
    addContact,
    updateContact,
    removeContact,
  } = useContactsStore();

  // Fetch contacts
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["contacts", filters],
    queryFn: () => contactsService.getContacts(filters),
    onSuccess: (data) => {
      setContacts(data.items, data.total, data.totalPages);
    },
    onError: () => {
      toast.error("Error al cargar contactos");
    },
  });

  // Create contact
  const createMutation = useMutation({
    mutationFn: (data: CreateContactDto) => contactsService.createContact(data),
    onMutate: () => setCreating(true),
    onSuccess: (newContact) => {
      queryClient.invalidateQueries(["contacts"]);
      toast.success("Contacto creado exitosamente");
      return newContact;
    },
    onError: () => {
      toast.error("Error al crear contacto");
    },
    onSettled: () => setCreating(false),
  });

  // Update contact
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateContactDto>;
    }) => contactsService.updateContact(id, data),
    onMutate: () => setUpdating(true),
    onSuccess: (updatedContact) => {
      updateContact(updatedContact.id, updatedContact);
      queryClient.invalidateQueries(["contacts"]);
      queryClient.invalidateQueries(["contact", updatedContact.id]);
      toast.success("Contacto actualizado");
    },
    onError: () => {
      toast.error("Error al actualizar contacto");
    },
    onSettled: () => setUpdating(false),
  });

  // Update status
  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: Contact["status"];
      reason?: string;
    }) => contactsService.updateContactStatus(id, status, reason),
    onSuccess: (updatedContact) => {
      updateContact(updatedContact.id, updatedContact);
      queryClient.invalidateQueries(["contacts"]);
      queryClient.invalidateQueries(["contact", updatedContact.id]);
      toast.success("Estado actualizado");
    },
    onError: () => {
      toast.error("Error al actualizar estado");
    },
  });

  // Delete contact
  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactsService.deleteContact(id),
    onMutate: () => setDeleting(true),
    onSuccess: (_, id) => {
      removeContact(id);
      queryClient.invalidateQueries(["contacts"]);
      toast.success("Contacto eliminado");
    },
    onError: () => {
      toast.error("Error al eliminar contacto");
    },
    onSettled: () => setDeleting(false),
  });

  // Add note
  const addNoteMutation = useMutation({
    mutationFn: ({
      contactId,
      content,
      isImportant,
    }: {
      contactId: string;
      content: string;
      isImportant?: boolean;
    }) => contactsService.addNote(contactId, content, isImportant),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["contact", variables.contactId]);
      toast.success("Nota agregada");
    },
    onError: () => {
      toast.error("Error al agregar nota");
    },
  });

  return {
    // Data
    contacts: data?.items || [],
    totalContacts: data?.total || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.page || 1,

    // Loading states
    isLoading: isLoading || false,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,

    // Error
    error,

    // Actions
    createContact: createMutation.mutateAsync,
    updateContact: updateMutation.mutateAsync,
    updateContactStatus: updateStatusMutation.mutateAsync,
    deleteContact: deleteMutation.mutateAsync,
    addNote: addNoteMutation.mutateAsync,
    refetch,
  };
};

// Hook para un contacto individual
export const useContact = (id: string) => {
  const { setSelectedContact } = useContactsStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["contact", id],
    queryFn: () => contactsService.getContact(id),
    enabled: !!id,
    onSuccess: (data) => {
      setSelectedContact(data);
    },
    onError: () => {
      toast.error("Error al cargar contacto");
    },
  });

  return {
    contact: data,
    isLoading,
    error,
  };
};
