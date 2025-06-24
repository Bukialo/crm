// ============================================================================
// ARCHIVO: src/types/index.ts - ACTUALIZADO
// ============================================================================

// ============================================================================
// TIPOS COMPARTIDOS PARA BUKIALO CRM BACKEND
// ============================================================================

// Enums principales
export enum ContactStatus {
  INTERESADO = "INTERESADO",
  PASAJERO = "PASAJERO",
  CLIENTE = "CLIENTE",
}

export enum BudgetRange {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  LUXURY = "LUXURY",
}

export enum TravelStyle {
  ADVENTURE = "ADVENTURE",
  RELAXATION = "RELAXATION",
  CULTURAL = "CULTURAL",
  BUSINESS = "BUSINESS",
  LUXURY = "LUXURY",
  FAMILY = "FAMILY",
  ROMANTIC = "ROMANTIC",
}

export enum ContactSource {
  WEBSITE = "WEBSITE",
  REFERRAL = "REFERRAL",
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  ADVERTISING = "ADVERTISING",
  DIRECT = "DIRECT",
  PARTNER = "PARTNER",
  OTHER = "OTHER",
}

export enum TripStatus {
  QUOTE = "QUOTE",
  BOOKED = "BOOKED",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  AGENT = "AGENT",
  VIEWER = "VIEWER",
}

// Interfaces para DTOs
export interface CreateContactDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: Date;
  status?: ContactStatus;
  preferredDestinations?: string[];
  budgetRange?: BudgetRange;
  travelStyle?: TravelStyle[];
  groupSize?: number;
  preferredSeasons?: string[];
  source?: ContactSource;
  referralSource?: string;
  tags?: string[];
  assignedAgentId?: string;
}

export interface UpdateContactDto extends Partial<CreateContactDto> {
  id: string;
}

// Interfaces para responses
export interface ContactWithRelations {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: ContactStatus;
  assignedAgent?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  trips: {
    id: string;
    destination: string;
    status: TripStatus;
    departureDate: Date;
  }[];
  lastActivity?: Date;
  tags: string[];
}

// Filtros
export interface ContactFilter {
  search?: string;
  status?: ContactStatus | ContactStatus[];
  assignedAgentId?: string;
  tags?: string[];
  source?: ContactSource | ContactSource[];
  budgetRange?: BudgetRange | BudgetRange[];
  dateFrom?: Date;
  dateTo?: Date;
}

// Paginación
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Usuario autenticado
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  firebaseUid: string;
}

// Actividades
export interface Activity {
  id: string;
  type: string;
  description: string;
  userId: string;
  contactId?: string;
  tripId?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// AI Query types
export interface AiQueryRequest {
  query: string;
  context?: {
    currentPage?: string;
    selectedContactId?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
}

export interface AiResponse {
  message: {
    id: string;
    role: "assistant";
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
  };
  suggestions?: string[];
  actions?: Array<{
    type: string;
    label: string;
    params?: Record<string, any>;
  }>;
}

// Trip types
export interface CreateTripDto {
  contactId: string;
  destination: string;
  departureDate: Date;
  returnDate: Date;
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

// Validation helpers
export const isValidContactStatus = (
  status: string
): status is ContactStatus => {
  return Object.values(ContactStatus).includes(status as ContactStatus);
};

export const isValidBudgetRange = (range: string): range is BudgetRange => {
  return Object.values(BudgetRange).includes(range as BudgetRange);
};

export const isValidTravelStyle = (style: string): style is TravelStyle => {
  return Object.values(TravelStyle).includes(style as TravelStyle);
};

export const isValidContactSource = (
  source: string
): source is ContactSource => {
  return Object.values(ContactSource).includes(source as ContactSource);
};

// Constantes útiles
export const CONTACT_STATUS_LABELS = {
  [ContactStatus.INTERESADO]: "Interesado",
  [ContactStatus.PASAJERO]: "Pasajero",
  [ContactStatus.CLIENTE]: "Cliente",
} as const;

export const BUDGET_RANGE_LABELS = {
  [BudgetRange.LOW]: "Bajo (< $1,000)",
  [BudgetRange.MEDIUM]: "Medio ($1,000 - $3,000)",
  [BudgetRange.HIGH]: "Alto ($3,000 - $10,000)",
  [BudgetRange.LUXURY]: "Lujo (> $10,000)",
} as const;

export const TRAVEL_STYLE_LABELS = {
  [TravelStyle.ADVENTURE]: "Aventura",
  [TravelStyle.RELAXATION]: "Relajación",
  [TravelStyle.CULTURAL]: "Cultural",
  [TravelStyle.BUSINESS]: "Negocios",
  [TravelStyle.LUXURY]: "Lujo",
  [TravelStyle.FAMILY]: "Familiar",
  [TravelStyle.ROMANTIC]: "Romántico",
} as const;

export const CONTACT_SOURCE_LABELS = {
  [ContactSource.WEBSITE]: "Sitio Web",
  [ContactSource.REFERRAL]: "Referido",
  [ContactSource.SOCIAL_MEDIA]: "Redes Sociales",
  [ContactSource.ADVERTISING]: "Publicidad",
  [ContactSource.DIRECT]: "Directo",
  [ContactSource.PARTNER]: "Socio",
  [ContactSource.OTHER]: "Otro",
} as const;
