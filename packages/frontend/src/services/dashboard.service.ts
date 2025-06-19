import api from "../lib/axios";

export interface DashboardStats {
  totalContacts: number;
  newContactsThisMonth: number;
  activeTrips: number;
  completedTrips: number;
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
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

export interface DashboardData {
  stats: DashboardStats;
  salesChart: SalesData[];
  topDestinations: TopDestination[];
  agentPerformance: AgentPerformance[];
  recentActivity: RecentActivity[];
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get("/dashboard");
    return response.data.data;
  }

  async getStats(): Promise<DashboardStats> {
    const response = await api.get("/dashboard/stats");
    return response.data.data;
  }

  async getSalesChart(
    period: "week" | "month" | "year" = "month"
  ): Promise<SalesData[]> {
    const response = await api.get(`/dashboard/sales-chart?period=${period}`);
    return response.data.data;
  }

  async getTopDestinations(limit = 5): Promise<TopDestination[]> {
    const response = await api.get(
      `/dashboard/top-destinations?limit=${limit}`
    );
    return response.data.data;
  }

  async getAgentPerformance(): Promise<AgentPerformance[]> {
    const response = await api.get("/dashboard/agent-performance");
    return response.data.data;
  }

  async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    const response = await api.get(`/dashboard/recent-activity?limit=${limit}`);
    return response.data.data;
  }
}

export const dashboardService = new DashboardService();
