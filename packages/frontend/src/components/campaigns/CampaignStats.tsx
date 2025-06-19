import { Mail, Send, Eye, MousePointer, TrendingUp } from "lucide-react";
import { StatsCard } from "../dashboard/StatsCard";

interface CampaignStatsData {
  totalCampaigns: number;
  campaignsThisMonth: number;
  totalSent: number;
  sentThisMonth: number;
  averageOpenRate: number;
  averageClickRate: number;
  totalRecipients: number;
  revenueGenerated: number;
}

interface CampaignStatsProps {
  stats: CampaignStatsData | null;
  isLoading: boolean;
}

// Mock data mientras no tengamos el backend
const mockStats: CampaignStatsData = {
  totalCampaigns: 48,
  campaignsThisMonth: 8,
  totalSent: 125420,
  sentThisMonth: 15680,
  averageOpenRate: 24.8,
  averageClickRate: 3.2,
  totalRecipients: 2340,
  revenueGenerated: 45600,
};

export const CampaignStats = ({ stats, isLoading }: CampaignStatsProps) => {
  // Usar datos mock si no hay stats del backend
  const data = stats || mockStats;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 glass rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Campañas Totales"
        value={data.totalCampaigns}
        change={(data.campaignsThisMonth / data.totalCampaigns) * 100}
        changeLabel="vs total"
        icon={<Mail className="w-6 h-6 text-white" />}
        iconColor="bg-gradient-to-br from-blue-500 to-cyan-500"
      />

      <StatsCard
        title="Emails Enviados"
        value={data.totalSent.toLocaleString()}
        change={15.3}
        changeLabel="vs mes anterior"
        icon={<Send className="w-6 h-6 text-white" />}
        iconColor="bg-gradient-to-br from-purple-500 to-pink-500"
      />

      <StatsCard
        title="Tasa de Apertura"
        value={`${data.averageOpenRate}%`}
        change={2.1}
        changeLabel="vs mes anterior"
        icon={<Eye className="w-6 h-6 text-white" />}
        iconColor="bg-gradient-to-br from-green-500 to-emerald-500"
      />

      <StatsCard
        title="Tasa de Clics"
        value={`${data.averageClickRate}%`}
        change={-0.5}
        changeLabel="vs mes anterior"
        icon={<MousePointer className="w-6 h-6 text-white" />}
        iconColor="bg-gradient-to-br from-orange-500 to-red-500"
      />
    </div>
  );
};
