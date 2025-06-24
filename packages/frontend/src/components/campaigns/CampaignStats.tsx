// src/components/campaigns/CampaignStats.tsx
import { Mail, Send, Eye, MousePointer } from "lucide-react";
import React from "react";
import { StatsCard } from "../dashboard/StatsCard";

interface CampaignStatsProps {
  stats: {
    totalCampaigns: number;
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  loading?: boolean;
}

export const CampaignStats: React.FC<CampaignStatsProps> = ({
  stats,
  loading = false,
}) => {
  const statsData = [
    {
      title: "Total Campañas",
      value: loading ? "..." : stats.totalCampaigns.toString(),
      change: 12, // Porcentaje de cambio
      changeType: "positive" as const,
      icon: Mail, // Componente directamente, no JSX
      color: "purple",
      iconColor: "#8b5cf6",
    },
    {
      title: "Emails Enviados",
      value: loading ? "..." : stats.totalSent.toLocaleString(),
      change: 8,
      changeType: "positive" as const,
      icon: Send, // Componente directamente, no JSX
      color: "blue",
      iconColor: "#3b82f6",
    },
    {
      title: "Emails Abiertos",
      value: loading ? "..." : `${stats.openRate}%`,
      change: 5,
      changeType: "positive" as const,
      icon: Eye, // Componente directamente, no JSX
      color: "green",
      iconColor: "#10b981",
    },
    {
      title: "Clicks",
      value: loading ? "..." : `${stats.clickRate}%`,
      change: -2,
      changeType: "negative" as const,
      icon: MousePointer, // Componente directamente, no JSX
      color: "orange",
      iconColor: "#f59e0b",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};
