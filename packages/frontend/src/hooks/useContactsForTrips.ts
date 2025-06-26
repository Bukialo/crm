// packages/frontend/src/hooks/useContactsForTrips.ts
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { useContacts } from "./useContacts"; // Tu hook original (ahora con UUIDs)

// Interfaz simple para el dropdown de contactos
interface ContactForDropdown {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
}

interface ContactsResponse {
  items: ContactForDropdown[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Servicio para contactos con fallback
export const ContactDropdownService = {
  async getContacts(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ContactsResponse> {
    try {
      console.log("🔍 Fetching contacts from API for dropdown...");
      const response = await api.get("/contacts", { params });
      console.log("✅ API contacts response:", response.data);

      // Manejar diferentes estructuras de respuesta
      const data = response.data.data || response.data;

      return {
        items: data.items || data || [],
        total: data.total || data.length || 0,
        page: data.page || 1,
        pageSize: data.pageSize || params?.pageSize || 100,
        totalPages: data.totalPages || 1,
      };
    } catch (error: any) {
      console.error("❌ Error fetching contacts from API:", error);
      console.warn("🔄 Falling back to local contacts data...");

      // Fallback: usar el hook local como fuente de datos
      throw error; // Dejar que el hook maneje el fallback
    }
  },
};

// Hook específico para contactos en formularios de trips
export const useContactsForTrips = (params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) => {
  // Intentar obtener desde API
  const apiQuery = useQuery({
    queryKey: ["contacts-dropdown", params],
    queryFn: () => ContactDropdownService.getContacts(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // No reintentar, usar fallback inmediatamente
  });

  // Fallback: usar tu hook original que funciona (ahora con UUIDs válidos)
  const localContacts = useContacts();

  // Decidir qué datos usar
  const useApiData = !apiQuery.error && apiQuery.data;

  if (useApiData) {
    console.log("📡 Using API contacts data");
    return {
      data: apiQuery.data,
      isLoading: apiQuery.isLoading,
      error: apiQuery.error,
      source: "api" as const,
    };
  } else {
    console.log("🏠 Using local contacts data as fallback (with UUIDs)");

    // ✅ AHORA TU HOOK YA TIENE UUIDs VÁLIDOS
    const convertedData: ContactsResponse = {
      items: localContacts.contacts.map((contact) => ({
        id: contact.id, // ✅ Ya es un UUID válido
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        status: contact.status,
      })),
      total: localContacts.totalContacts,
      page: localContacts.currentPage,
      pageSize: 100,
      totalPages: localContacts.totalPages,
    };

    return {
      data: convertedData,
      isLoading: localContacts.isLoading,
      error: localContacts.error,
      source: "local" as const,
    };
  }
};

export default useContactsForTrips;
