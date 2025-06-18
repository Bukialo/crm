import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export const useDashboard = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.getDashboardData(),
    refetchInterval: 60000, // Refrescar cada minuto
    staleTime: 30000, // Considerar datos frescos por 30 segundos
  });

  return {
    stats: dashboardData?.stats || null,
    salesChart: dashboardData?.salesChart || [],
    topDestinations: dashboardData?.topDestinations || [],
    agentPerformance: dashboardData?.agentPerformance || [],
    recentActivity: dashboardData?.recentActivity || [],
    isLoading,
    error,
    refetch,
  };
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 30000,
  });
};

export const useSalesChart = (period: "week" | "month" | "year" = "month") => {
  return useQuery({
    queryKey: ["dashboard", "sales-chart", period],
    queryFn: () => dashboardService.getSalesChart(period),
  });
};

export const useTopDestinations = (limit = 5) => {
  return useQuery({
    queryKey: ["dashboard", "top-destinations", limit],
    queryFn: () => dashboardService.getTopDestinations(limit),
  });
};

export const useAgentPerformance = () => {
  return useQuery({
    queryKey: ["dashboard", "agent-performance"],
    queryFn: () => dashboardService.getAgentPerformance(),
  });
};

export const useRecentActivity = (limit = 10) => {
  return useQuery({
    queryKey: ["dashboard", "recent-activity", limit],
    queryFn: () => dashboardService.getRecentActivity(limit),
    refetchInterval: 10000, // Refrescar cada 10 segundos
  });
};
