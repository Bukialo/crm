import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  UserPlus,
  Plane,
  ArrowUpRight,
  DollarSign,
  Activity,
} from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import { RecentActivity as RecentActivityType } from "../../services/dashboard.service";

interface RecentActivityProps {
  activities: RecentActivityType[];
  isLoading?: boolean;
}

const activityIcons = {
  contact_created: {
    icon: UserPlus,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  trip_booked: {
    icon: Plane,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  status_changed: {
    icon: ArrowUpRight,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
  },
  payment_received: {
    icon: DollarSign,
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
};

export const RecentActivity = ({
  activities,
  isLoading,
}: RecentActivityProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg glass animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 glass rounded animate-pulse" />
                  <div className="h-3 w-24 glass rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Actividad Reciente</CardTitle>
          <div className="p-2 rounded-lg bg-primary-500/20">
            <Activity className="w-5 h-5 text-primary-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity) => {
            const config = activityIcons[activity.type] || {
              icon: Activity,
              color: "text-white/60",
              bg: "bg-white/10",
            };
            const Icon = config.icon;

            return (
              <div key={activity.id} className="flex items-start gap-3 group">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-white/60">
                      {activity.user.name}
                    </p>
                    <span className="text-xs text-white/40">•</span>
                    <p className="text-xs text-white/40">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
