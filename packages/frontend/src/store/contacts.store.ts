import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Contact, ContactFilters } from "../services/contacts.service";

interface ContactsState {
  // Data
  contacts: Contact[];
  selectedContact: Contact | null;
  totalContacts: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Filters
  filters: ContactFilters;

  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Actions
  setContacts: (contacts: Contact[], total: number, totalPages: number) => void;
  setSelectedContact: (contact: Contact | null) => void;
  setFilters: (filters: Partial<ContactFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setDeleting: (deleting: boolean) => void;

  // CRUD Operations
  addContact: (contact: Contact) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  removeContact: (id: string) => void;
}

const initialFilters: ContactFilters = {
  page: 1,
  pageSize: 20,
  search: "",
  status: [],
  assignedAgentId: "",
  tags: [],
  source: [],
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const useContactsStore = create<ContactsState>()(
  devtools(
    (set) => ({
      // Initial state
      contacts: [],
      selectedContact: null,
      totalContacts: 0,
      currentPage: 1,
      pageSize: 20,
      totalPages: 0,
      filters: initialFilters,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,

      // Actions
      setContacts: (contacts, total, totalPages) =>
        set({ contacts, totalContacts: total, totalPages }),

      setSelectedContact: (contact) => set({ selectedContact: contact }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: newFilters.page || state.currentPage,
        })),

      resetFilters: () => set({ filters: initialFilters, currentPage: 1 }),

      setPage: (page) =>
        set((state) => ({
          currentPage: page,
          filters: { ...state.filters, page },
        })),

      setPageSize: (pageSize) =>
        set((state) => ({
          pageSize,
          currentPage: 1,
          filters: { ...state.filters, pageSize, page: 1 },
        })),

      setLoading: (loading) => set({ isLoading: loading }),
      setCreating: (creating) => set({ isCreating: creating }),
      setUpdating: (updating) => set({ isUpdating: updating }),
      setDeleting: (deleting) => set({ isDeleting: deleting }),

      // CRUD Operations
      addContact: (contact) =>
        set((state) => ({
          contacts: [contact, ...state.contacts],
          totalContacts: state.totalContacts + 1,
        })),

      updateContact: (id, updatedData) =>
        set((state) => ({
          contacts: state.contacts.map((contact) =>
            contact.id === id ? { ...contact, ...updatedData } : contact
          ),
          selectedContact:
            state.selectedContact?.id === id
              ? { ...state.selectedContact, ...updatedData }
              : state.selectedContact,
        })),

      removeContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((contact) => contact.id !== id),
          totalContacts: state.totalContacts - 1,
          selectedContact:
            state.selectedContact?.id === id ? null : state.selectedContact,
        })),
    }),
    {
      name: "contacts-storage",
    }
  )
);
