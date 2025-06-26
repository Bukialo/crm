// Shared types for the backend
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  firebaseUid: string;
}

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
    role: "assistant" | "user";
    content: string;
    timestamp: string;
    metadata?: any;
  };
  suggestions?: string[];
  actions?: Array<{
    type: string;
    label: string;
    params?: any;
  }>;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  userId: string;
  contactId?: string;
  tripId?: string;
  createdAt: Date;
  metadata?: any;
}
