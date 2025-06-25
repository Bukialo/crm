import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import Card from "../ui/Card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: "up" | "down" | "neutral";
  changeType?: "positive" | "negative" | "neutral";
}

export const StatsCard = ({
  title,
  value,
  change,
  changeLabel = "vs mes anterior",
  icon: Icon,
  iconColor,
  trend,
  changeType,
}: StatsCardProps) => {
  // Determinar tendencia automáticamente si no se proporciona
  const actualTrend =
    trend ||
    (change
      ? change > 0
        ? "up"
        : change < 0
          ? "down"
          : "neutral"
      : "neutral");

  // Usar changeType si está disponible, sino usar trend
  const actualChangeType =
    changeType ||
    (actualTrend === "up"
      ? "positive"
      : actualTrend === "down"
        ? "negative"
        : "neutral");

  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    down: {
      icon: TrendingDown,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
    neutral: {
      icon: Minus,
      color: "text-white/60",
      bgColor: "bg-white/10",
    },
  };

  const changeColorConfig = {
    positive: {
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    negative: {
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
    neutral: {
      color: "text-white/60",
      bgColor: "bg-white/10",
    },
  };

  const TrendIcon = trendConfig[actualTrend].icon;
  const changeColors = changeColorConfig[actualChangeType];

  return (
    <Card hover className="group">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-white/60 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white mb-2">
              {typeof value === "number" &&
              !value.toString().includes("%") &&
              !value.toString().includes("$")
                ? value.toLocaleString()
                : value}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                    changeColors.bgColor,
                    changeColors.color
                  )}
                >
                  <TrendIcon className="w-3 h-3" />
                  <span>
                    {change > 0 && "+"}
                    {change}%
                  </span>
                </div>
                <span className="text-xs text-white/40">{changeLabel}</span>
              </div>
            )}
          </div>
          <div
            className={clsx(
              "p-3 rounded-xl transition-transform group-hover:scale-110"
            )}
            style={{ backgroundColor: iconColor + "20" }}
          >
            <Icon className="w-6 h-6" style={{ color: iconColor }} />
          </div>
        </div>
      </div>
    </Card>
  );
};
