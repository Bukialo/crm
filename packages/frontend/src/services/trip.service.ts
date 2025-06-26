// packages/frontend/src/services/trip.service.ts
import api from "../lib/axios";

export interface Trip {
  id: string;
  contactId: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  status: "QUOTE" | "BOOKED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  estimatedBudget: number;
  finalPrice?: number;
  commission?: number;
  includesFlight: boolean;
  includesHotel: boolean;
  includesTransfer: boolean;
  includesTours: boolean;
  includesInsurance: boolean;
  customServices: string[];
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;

  // Relaciones
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  paidAt: string;
}

export interface CreateTripDto {
  contactId: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  estimatedBudget: number;
  finalPrice?: number;
  commission?: number;
  includesFlight?: boolean;
  includesHotel?: boolean;
  includesTransfer?: boolean;
  includesTours?: boolean;
  includesInsurance?: boolean;
  customServices?: string[];
  notes?: string;
  internalNotes?: string;
}

export interface UpdateTripDto extends Partial<CreateTripDto> {
  status?: Trip["status"];
}

export interface TripFilters {
  search?: string;
  status?: Trip["status"] | Trip["status"][];
  contactId?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TripsResponse {
  items: Trip[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TripStats {
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  totalRevenue: number;
  monthlyRevenue: number;
  upcomingDepartures: number;
  topDestinations: Array<{
    destination: string;
    count: number;
  }>;
}

export class TripService {
  // Obtener todos los viajes con filtros
  static async getTrips(filters?: TripFilters): Promise<TripsResponse> {
    try {
      const response = await api.get("/trips", { params: filters });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching trips:", error);
      throw error;
    }
  }

  // Obtener un viaje por ID
  static async getTripById(id: string): Promise<Trip> {
    try {
      const response = await api.get(`/trips/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching trip:", error);
      throw error;
    }
  }

  // Crear un nuevo viaje
  static async createTrip(tripData: CreateTripDto): Promise<Trip> {
    try {
      console.log("📤 Sending trip data to API:", tripData);

      // Limpiar datos antes de enviar
      const cleanedData = {
        contactId: tripData.contactId,
        destination: tripData.destination.trim(),
        // CORREGIR: Enviar fechas en formato ISO pero sin hora
        departureDate: tripData.departureDate + "T00:00:00.000Z",
        returnDate: tripData.returnDate + "T23:59:59.999Z",
        travelers: Number(tripData.travelers),
        estimatedBudget: Number(tripData.estimatedBudget),
        finalPrice: tripData.finalPrice
          ? Number(tripData.finalPrice)
          : undefined,
        commission: tripData.commission
          ? Number(tripData.commission)
          : undefined,
        // Asegurar booleans
        includesFlight: Boolean(tripData.includesFlight),
        includesHotel: Boolean(tripData.includesHotel),
        includesTransfer: Boolean(tripData.includesTransfer),
        includesTours: Boolean(tripData.includesTours),
        includesInsurance: Boolean(tripData.includesInsurance),
        // Asegurar arrays
        customServices: Array.isArray(tripData.customServices)
          ? tripData.customServices
          : [],
        // Limpiar strings opcionales
        notes: tripData.notes?.trim() || undefined,
        internalNotes: tripData.internalNotes?.trim() || undefined,
      };

      console.log("🧹 Cleaned trip data:", cleanedData);

      const response = await api.post("/trips", cleanedData);
      console.log("✅ Trip created successfully:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error creating trip:", error);
      console.error("📋 Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  // Actualizar un viaje
  static async updateTrip(id: string, tripData: UpdateTripDto): Promise<Trip> {
    try {
      const response = await api.put(`/trips/${id}`, tripData);
      return response.data.data;
    } catch (error) {
      console.error("Error updating trip:", error);
      throw error;
    }
  }

  // Actualizar estado del viaje
  static async updateTripStatus(
    id: string,
    status: Trip["status"],
    reason?: string
  ): Promise<Trip> {
    try {
      const response = await api.patch(`/trips/${id}/status`, {
        status,
        reason,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error updating trip status:", error);
      throw error;
    }
  }

  // Eliminar un viaje
  static async deleteTrip(id: string): Promise<void> {
    try {
      await api.delete(`/trips/${id}`);
    } catch (error) {
      console.error("Error deleting trip:", error);
      throw error;
    }
  }

  // Obtener estadísticas de viajes
  static async getTripStats(): Promise<TripStats> {
    try {
      const response = await api.get("/trips/stats");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching trip stats:", error);
      throw error;
    }
  }
}

export default TripService;
