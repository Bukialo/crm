import api from "../lib/axios";

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: "INTERESADO" | "PASAJERO" | "CLIENTE";
  assignedAgent?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  tags: string[];
  source?: string;
  budgetRange?: string;
  preferredDestinations?: string[];
  travelStyle?: string[];
  lastContact?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  items: Contact[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: "INTERESADO" | "PASAJERO" | "CLIENTE";
  source?: string;
  assignedAgentId?: string;
  tags?: string[];
  preferredDestinations?: string[];
  budgetRange?: string;
  travelStyle?: string[];
}

export interface ContactFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string[];
  assignedAgentId?: string;
  tags?: string[];
  source?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

class ContactsService {
  async getContacts(filters: ContactFilters = {}): Promise<ContactsResponse> {
    try {
      const params = new URLSearchParams();

      // ✅ LIMPIAR PARÁMETROS PARA EVITAR 400
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            // Solo agregar arrays que tengan elementos
            if (value.length > 0) {
              value.forEach((v) => {
                if (v && v !== "") {
                  params.append(key, String(v));
                }
              });
            }
          } else {
            // Solo agregar valores no vacíos
            const stringValue = String(value);
            if (stringValue !== "" && stringValue !== "undefined") {
              params.append(key, stringValue);
            }
          }
        }
      });

      console.log("Final contacts params:", params.toString());

      const response = await api.get(`/contacts?${params.toString()}`);

      console.log("Contacts response:", response.data); // Debug

      // ✅ MANEJAR RESPUESTA DEL BACKEND
      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Fallback para respuesta malformada
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      };
    } catch (error: any) {
      console.error("Contacts service error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // ✅ RETORNAR ESTRUCTURA VÁLIDA EN ERROR
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      };
    }
  }

  async getContact(id: string): Promise<Contact | null> {
    try {
      const response = await api.get(`/contacts/${id}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error("Error fetching contact:", error);
      return null;
    }
  }

  async createContact(data: CreateContactDto): Promise<Contact | null> {
    try {
      console.log("Creating contact:", data); // Debug

      const response = await api.post("/contacts", data);

      console.log("Create contact response:", response.data); // Debug

      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error; // Re-throw para que el hook maneje el error
    }
  }

  async updateContact(
    id: string,
    data: Partial<CreateContactDto>
  ): Promise<Contact | null> {
    try {
      const response = await api.put(`/contacts/${id}`, data);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  }

  async updateContactStatus(
    id: string,
    status: Contact["status"],
    reason?: string
  ): Promise<Contact | null> {
    try {
      const response = await api.patch(`/contacts/${id}/status`, {
        status,
        reason,
      });
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error("Error updating contact status:", error);
      throw error;
    }
  }

  async deleteContact(id: string): Promise<void> {
    try {
      await api.delete(`/contacts/${id}`);
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  }

  async addNote(
    contactId: string,
    content: string,
    isImportant = false
  ): Promise<void> {
    try {
      await api.post(`/contacts/${contactId}/notes`, { content, isImportant });
    } catch (error) {
      console.error("Error adding note:", error);
      throw error;
    }
  }

  async importContacts(
    file: File
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/contacts/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.success
        ? response.data.data
        : {
            success: 0,
            failed: 0,
            errors: [],
          };
    } catch (error) {
      console.error("Error importing contacts:", error);
      throw error;
    }
  }

  async exportContacts(
    filters: ContactFilters = {},
    format: "csv" | "xlsx" = "csv"
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append("format", format);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });

      const response = await api.get(`/contacts/export?${params.toString()}`, {
        responseType: "blob",
      });

      return response.data;
    } catch (error) {
      console.error("Error exporting contacts:", error);
      throw error;
    }
  }
}

export const contactsService = new ContactsService();
