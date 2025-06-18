// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  firebaseUid: string;
}

// Contact Related Types
export interface ContactWithRelations {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: string;
  assignedAgent?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  trips: Array<{
    id: string;
    destination: string;
    status: string;
    departureDate: Date;
  }>;
  lastActivity?: Date;
  tags: string[];
}

export interface ContactFilter {
  status?: string[];
  assignedAgentId?: string;
  tags?: string[];
  source?: string[];
  budgetRange?: string[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: string;
  source?: string;
  assignedAgentId?: string;
  tags?: string[];
  preferredDestinations?: string[];
  budgetRange?: string;
  travelStyle?: string[];
}

// Dashboard Types
export interface DashboardStats {
  totalContacts: number;
  newContactsThisMonth: number;
  activeTrips: number;
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  conversionRate: number;
  contactsByStatus: {
    interesados: number;
    pasajeros: number;
    clientes: number;
  };
}

export interface SalesData {
  month: string;
  sales: number;
  trips: number;
}

export interface TopDestination {
  destination: string;
  trips: number;
  revenue: number;
}

export interface AgentPerformance {
  id: string;
  name: string;
  contactsManaged: number;
  tripsBooked: number;
  revenue: number;
  conversionRate: number;
}

export interface RecentActivity {
  id: string;
  type:
    | "contact_created"
    | "trip_booked"
    | "status_changed"
    | "payment_received";
  description: string;
  timestamp: string;
  user: {
    name: string;
  };
}

// Bulk Operations
export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}
