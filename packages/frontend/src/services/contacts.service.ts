import api from '../lib/axios'

// Types (temporalmente aquí hasta resolver el problema de shared)
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
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await api.get(`/contacts?${params.toString()}`);
    return response.data.data;
  }

  async getContact(id: string): Promise<Contact> {
    const response = await api.get(`/contacts/${id}`);
    return response.data.data;
  }

  async createContact(data: CreateContactDto): Promise<Contact> {
    const response = await api.post("/contacts", data);
    return response.data.data;
  }

  async updateContact(
    id: string,
    data: Partial<CreateContactDto>
  ): Promise<Contact> {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data.data;
  }

  async updateContactStatus(
    id: string,
    status: Contact["status"],
    reason?: string
  ): Promise<Contact> {
    const response = await api.patch(`/contacts/${id}/status`, {
      status,
      reason,
    });
    return response.data.data;
  }

  async deleteContact(id: string): Promise<void> {
    await api.delete(`/contacts/${id}`);
  }

  async addNote(
    contactId: string,
    content: string,
    isImportant = false
  ): Promise<void> {
    await api.post(`/contacts/${contactId}/notes`, { content, isImportant });
  }

  async importContacts(
    file: File
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/contacts/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  }

  async exportContacts(
    filters: ContactFilters = {},
    format: "csv" | "xlsx" = "csv"
  ): Promise<Blob> {
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
  }
}

export const contactsService = new ContactsService();
