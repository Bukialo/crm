// src/types/contact.types.ts
export interface Contact {
  id: string;

  // Información básica
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: Date;

  // Clasificación según estado del lead
  status: "INTERESADO" | "PASAJERO" | "CLIENTE";

  // Información de viajes y preferencias - CORREGIDO: hacer opcional todas las propiedades
  travelPreferences?: {
    destinations: string[];
    budgetRange?: "LOW" | "MEDIUM" | "HIGH" | "LUXURY";
    travelStyle?: "ADVENTURE" | "RELAXATION" | "CULTURAL" | "BUSINESS";
    groupSize: number;
    preferredSeasons: string[];
  };

  // Seguimiento comercial
  lastContact?: Date;
  nextFollowUp?: Date;
  assignedAgent?: string;
  tags?: string[];
  notes?: ContactNote[];

  // Historial de viajes
  trips?: Trip[];

  // Metadatos
  source?: string; // 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'ADVERTISING'
  createdAt: Date | string;
  updatedAt?: Date | string;

  // ✅ NUEVAS PROPIEDADES para compatibilidad
  budgetRange?: "LOW" | "MEDIUM" | "HIGH" | "LUXURY";
  preferredDestinations?: string[];
}

export interface ContactNote {
  id: string;
  contactId: string;
  content: string;
  createdBy: string;
  createdAt: Date | string;
  type: "CALL" | "EMAIL" | "MEETING" | "NOTE";
}

export interface Trip {
  id: string;
  contactId: string;

  // Detalles del viaje
  destination: string;
  departureDate: Date | string;
  returnDate: Date | string;
  travelers: number;
  status: "QUOTE" | "BOOKED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

  // Información comercial
  estimatedBudget: number;
  finalPrice?: number;
  commission: number;

  // Servicios incluidos
  services: {
    flights: boolean;
    hotels: boolean;
    transfers: boolean;
    tours: boolean;
    insurance: boolean;
  };

  // Fechas importantes
  quoteDate: Date | string;
  bookingDate?: Date | string;
  paymentDueDate?: Date | string;

  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface ContactFilter {
  search?: string;
  status?: Contact["status"] | "ALL";
  tags?: string[];
  source?: string;
  assignedAgent?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ContactStats {
  total: number;
  interesados: number;
  pasajeros: number;
  clientes: number;
  newThisMonth: number;
  conversionRate: number;
}
