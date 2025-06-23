import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";

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

export class DashboardService {
  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private endOfMonth(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
  }

  private subMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() - months);
    return result;
  }

  private formatMonth(date: Date): string {
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    // CORREGIDO: Verificar que el índice sea válido
    const monthIndex = date.getMonth();
    return months[monthIndex] || "Unknown";
  }

  async getDashboardData() {
    try {
      const [
        stats,
        salesChart,
        topDestinations,
        agentPerformance,
        recentActivity,
      ] = await Promise.all([
        this.getStats(),
        this.getSalesChart(),
        this.getTopDestinations(),
        this.getAgentPerformance(),
        this.getRecentActivity(),
      ]);

      return {
        stats,
        salesChart,
        topDestinations,
        agentPerformance,
        recentActivity,
      };
    } catch (error) {
      logger.error("Error getting dashboard data:", error);
      throw error;
    }
  }

  // CORREGIDO: Remover parámetro userId no usado
  async getStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const startThisMonth = this.startOfMonth(now);
      const endThisMonth = this.endOfMonth(now);
      const startLastMonth = this.startOfMonth(this.subMonths(now, 1));
      const endLastMonth = this.endOfMonth(this.subMonths(now, 1));

      // Total contacts
      const totalContacts = await prisma.contact.count();

      // New contacts this month
      const newContactsThisMonth = await prisma.contact.count({
        where: {
          createdAt: {
            gte: startThisMonth,
            lte: endThisMonth,
          },
        },
      });

      // Active trips
      const activeTrips = await prisma.trip.count({
        where: {
          status: {
            in: ["BOOKED", "CONFIRMED"],
          },
        },
      });

      // Completed trips
      const completedTrips = await prisma.trip.count({
        where: {
          status: "COMPLETED",
        },
      });

      // Revenue this month
      const revenueThisMonth = await prisma.trip.aggregate({
        _sum: {
          finalPrice: true,
        },
        where: {
          status: "COMPLETED",
          updatedAt: {
            gte: startThisMonth,
            lte: endThisMonth,
          },
        },
      });

      // Revenue last month
      const revenueLastMonth = await prisma.trip.aggregate({
        _sum: {
          finalPrice: true,
        },
        where: {
          status: "COMPLETED",
          updatedAt: {
            gte: startLastMonth,
            lte: endLastMonth,
          },
        },
      });

      const thisMonthRevenue = revenueThisMonth._sum.finalPrice || 0;
      const lastMonthRevenue = revenueLastMonth._sum.finalPrice || 0;
      const revenueGrowth =
        lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      // Contacts by status
      const contactsByStatus = await prisma.contact.groupBy({
        by: ["status"],
        _count: true,
      });

      const statusCounts = {
        interesados: 0,
        pasajeros: 0,
        clientes: 0,
      };

      contactsByStatus.forEach((group) => {
        switch (group.status) {
          case "INTERESADO":
            statusCounts.interesados = group._count;
            break;
          case "PASAJERO":
            statusCounts.pasajeros = group._count;
            break;
          case "CLIENTE":
            statusCounts.clientes = group._count;
            break;
        }
      });

      // Conversion rate (from INTERESADO to CLIENTE)
      const conversionRate =
        statusCounts.interesados > 0
          ? (statusCounts.clientes /
              (statusCounts.interesados + statusCounts.clientes)) *
            100
          : 0;

      return {
        totalContacts,
        newContactsThisMonth,
        activeTrips,
        completedTrips,
        revenue: {
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          growth: revenueGrowth,
        },
        conversionRate,
        contactsByStatus: statusCounts,
      };
    } catch (error) {
      logger.error("Error getting dashboard stats:", error);
      throw error;
    }
  }

  // CORREGIDO: Remover parámetros no usados
  async getSalesChart(): Promise<SalesData[]> {
    try {
      const now = new Date();
      let months: Date[] = [];

      // Generate last 6 months
      for (let i = 5; i >= 0; i--) {
        months.push(this.subMonths(now, i));
      }

      const salesData: SalesData[] = [];

      for (const month of months) {
        const startDate = this.startOfMonth(month);
        const endDate = this.endOfMonth(month);

        const [trips, revenue] = await Promise.all([
          prisma.trip.count({
            where: {
              status: "COMPLETED",
              updatedAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
          prisma.trip.aggregate({
            _sum: {
              finalPrice: true,
            },
            where: {
              status: "COMPLETED",
              updatedAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
        ]);

        salesData.push({
          month: this.formatMonth(month),
          sales: revenue._sum.finalPrice || 0,
          trips,
        });
      }

      return salesData;
    } catch (error) {
      logger.error("Error getting sales chart data:", error);
      throw error;
    }
  }

  async getTopDestinations(limit: number = 5): Promise<TopDestination[]> {
    try {
      const destinations = await prisma.trip.groupBy({
        by: ["destination"],
        _count: true,
        _sum: {
          finalPrice: true,
        },
        where: {
          status: "COMPLETED",
        },
        orderBy: {
          _sum: {
            finalPrice: "desc",
          },
        },
        take: limit,
      });

      return destinations.map((dest) => ({
        destination: dest.destination,
        trips: dest._count,
        revenue: dest._sum.finalPrice || 0,
      }));
    } catch (error) {
      logger.error("Error getting top destinations:", error);
      throw error;
    }
  }

  // CORREGIDO: Remover parámetro userId no usado
  async getAgentPerformance(): Promise<AgentPerformance[]> {
    try {
      const agents = await prisma.user.findMany({
        where: {
          role: {
            in: ["AGENT", "MANAGER"],
          },
          isActive: true,
        },
        include: {
          assignedContacts: {
            include: {
              trips: {
                where: {
                  status: "COMPLETED",
                },
              },
            },
          },
        },
      });

      const performance: AgentPerformance[] = agents.map((agent) => {
        const contactsManaged = agent.assignedContacts.length;
        const tripsBooked = agent.assignedContacts.reduce(
          (total, contact) => total + contact.trips.length,
          0
        );
        const revenue = agent.assignedContacts.reduce(
          (total, contact) =>
            total +
            contact.trips.reduce(
              (tripTotal, trip) => tripTotal + (trip.finalPrice || 0),
              0
            ),
          0
        );

        const conversionRate =
          contactsManaged > 0 ? (tripsBooked / contactsManaged) * 100 : 0;

        return {
          id: agent.id,
          name: `${agent.firstName} ${agent.lastName}`,
          contactsManaged,
          tripsBooked,
          revenue,
          conversionRate,
        };
      });

      return performance.sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      logger.error("Error getting agent performance:", error);
      throw error;
    }
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const activities = await prisma.activity.findMany({
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          contact: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // CORREGIDO: Manejo seguro de metadata
      return activities.map((activity) => ({
        id: activity.id,
        type: activity.type as any,
        description: activity.description,
        timestamp: activity.createdAt.toISOString(),
        user: {
          name: `${activity.user.firstName} ${activity.user.lastName}`,
        },
        metadata: activity.metadata
          ? (activity.metadata as Record<string, any>)
          : undefined,
      }));
    } catch (error) {
      logger.error("Error getting recent activity:", error);
      throw error;
    }
  }

  async getMetricsByDateRange(startDate: Date, endDate: Date): Promise<any> {
    try {
      const [contacts, trips, revenue] = await Promise.all([
        prisma.contact.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        prisma.trip.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        prisma.trip.aggregate({
          _sum: {
            finalPrice: true,
          },
          where: {
            status: "COMPLETED",
            updatedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ]);

      return {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        contacts,
        trips,
        revenue: revenue._sum.finalPrice || 0,
      };
    } catch (error) {
      logger.error("Error getting metrics by date range:", error);
      throw error;
    }
  }
}
