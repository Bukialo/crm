// packages/frontend/src/hooks/useContacts.ts - ACTUALIZADO
import { useState, useEffect } from "react";
import { Contact } from "../types/contact.types";

// Tipos para compatibilidad con el sistema existente
export interface CreateContactDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: Contact["status"];
  source?: string;
  tags?: string[];
  travelPreferences?: Contact["travelPreferences"];
  birthDate?: Date;
  assignedAgent?: string;
}

export interface UpdateContactParams {
  id: string;
  data: Partial<CreateContactDto>;
}

export interface UseContactsReturn {
  contacts: Contact[];
  totalContacts: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: Error | null;
  createContact: (data: CreateContactDto) => Promise<Contact | null>;
  updateContact: (params: UpdateContactParams) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<void>;
  addNote: (contactId: string, noteContent: string) => Promise<void>;
  refetch: () => Promise<void>;
}

// ✅ FUNCIÓN PARA GENERAR UUIDs VÁLIDOS
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useContacts = (): UseContactsReturn => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ✅ MOCK DATA CON UUIDs VÁLIDOS
  const mockContacts: Contact[] = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001", // ✅ UUID válido
      firstName: "María",
      lastName: "García",
      email: "maria@example.com",
      phone: "+54 11 1234-5678",
      status: "INTERESADO",
      source: "WEBSITE",
      tags: ["VIP", "Frecuente"],
      travelPreferences: {
        destinations: ["París", "Roma"],
        budgetRange: "MEDIUM",
        travelStyle: "CULTURAL",
        groupSize: 2,
        preferredSeasons: ["Primavera", "Verano"],
      },
      createdAt: new Date("2025-06-15"),
      lastContact: new Date("2025-06-20"),
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002", // ✅ UUID válido
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan@example.com",
      phone: "+54 11 8765-4321",
      status: "CLIENTE",
      source: "REFERRAL",
      tags: ["Corporativo"],
      travelPreferences: {
        destinations: ["Barcelona", "Madrid"],
        budgetRange: "HIGH",
        travelStyle: "BUSINESS",
        groupSize: 1,
        preferredSeasons: ["Otoño"],
      },
      createdAt: new Date("2025-06-10"),
      lastContact: new Date("2025-06-22"),
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003", // ✅ UUID válido
      firstName: "Ana",
      lastName: "López",
      email: "ana@example.com",
      phone: "+54 11 5555-0000",
      status: "PASAJERO",
      source: "SOCIAL_MEDIA",
      tags: ["Luna de Miel"],
      travelPreferences: {
        destinations: ["Maldivas", "Bali"],
        budgetRange: "LUXURY",
        travelStyle: "RELAXATION",
        groupSize: 2,
        preferredSeasons: ["Verano"],
      },
      createdAt: new Date("2025-06-05"),
      lastContact: new Date("2025-06-18"),
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004", // ✅ UUID válido adicional
      firstName: "Miguel",
      lastName: "Fernández",
      email: "miguel.fernandez@example.com",
      phone: "+54 11 9999-8888",
      status: "PASAJERO",
      source: "REFERRAL",
      tags: ["Familiar"],
      travelPreferences: {
        destinations: ["Londres", "Escocia"],
        budgetRange: "MEDIUM",
        travelStyle: "CULTURAL",
        groupSize: 4,
        preferredSeasons: ["Primavera", "Verano"],
      },
      createdAt: new Date("2025-06-12"),
      lastContact: new Date("2025-06-25"),
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440005", // ✅ UUID válido adicional
      firstName: "Patricia",
      lastName: "Morales",
      email: "patricia.morales@example.com",
      phone: "+54 11 7777-6666",
      status: "CLIENTE",
      source: "WEBSITE",
      tags: ["VIP", "Repetidor"],
      travelPreferences: {
        destinations: ["Japón", "Corea del Sur"],
        budgetRange: "LUXURY",
        travelStyle: "CULTURAL",
        groupSize: 2,
        preferredSeasons: ["Otoño", "Primavera"],
      },
      createdAt: new Date("2025-06-08"),
      lastContact: new Date("2025-06-24"),
    },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // En una implementación real, aquí harías fetch a la API
      setContacts(mockContacts);
      setTotalContacts(mockContacts.length);
      setTotalPages(Math.ceil(mockContacts.length / 10));
      setCurrentPage(1);

      console.log(
        "✅ Contacts loaded with UUIDs:",
        mockContacts.map((c) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Error loading contacts")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createContact = async (
    data: CreateContactDto
  ): Promise<Contact | null> => {
    setIsCreating(true);
    setError(null);

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ✅ GENERAR UUID VÁLIDO
      const newContact: Contact = {
        id: generateUUID(), // ✅ UUID válido en lugar de Math.random()
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        status: data.status || "INTERESADO",
        source: data.source,
        tags: data.tags,
        travelPreferences: data.travelPreferences,
        birthDate: data.birthDate,
        assignedAgent: data.assignedAgent,
        createdAt: new Date(),
      };

      setContacts((prev) => [newContact, ...prev]);
      setTotalContacts((prev) => prev + 1);

      console.log("✅ New contact created with UUID:", newContact.id);
      return newContact;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Error creating contact");
      setError(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateContact = async (
    params: UpdateContactParams
  ): Promise<Contact | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === params.id
            ? {
                ...contact,
                ...params.data,
                updatedAt: new Date(),
              }
            : contact
        )
      );

      const updatedContact = contacts.find((c) => c.id === params.id);
      return updatedContact || null;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Error updating contact");
      setError(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteContact = async (id: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      setContacts((prev) => prev.filter((contact) => contact.id !== id));
      setTotalContacts((prev) => prev - 1);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Error deleting contact");
      setError(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const addNote = async (
    contactId: string,
    noteContent: string
  ): Promise<void> => {
    setError(null);

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ✅ GENERAR UUID VÁLIDO PARA LA NOTA
      const newNote = {
        id: generateUUID(), // ✅ UUID válido
        contactId,
        content: noteContent,
        createdBy: "Usuario Actual",
        createdAt: new Date(),
        type: "NOTE" as const,
      };

      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === contactId
            ? {
                ...contact,
                notes: [newNote, ...(contact.notes || [])],
                updatedAt: new Date(),
              }
            : contact
        )
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error adding note");
      setError(error);
      throw error;
    }
  };

  const refetch = async (): Promise<void> => {
    await loadContacts();
  };

  return {
    contacts,
    totalContacts,
    totalPages,
    currentPage,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createContact,
    updateContact,
    deleteContact,
    addNote,
    refetch,
  };
};
