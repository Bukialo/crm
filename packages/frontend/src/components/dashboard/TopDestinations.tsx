import { MapPin, TrendingUp } from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import { TopDestination } from "../../services/dashboard.service";

interface TopDestinationsProps {
  destinations: TopDestination[];
  isLoading?: boolean;
}

export const TopDestinations = ({
  destinations,
  isLoading,
}: TopDestinationsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Destinos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 glass rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...destinations.map((d) => d.revenue));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Destinos</CardTitle>
          <div className="p-2 rounded-lg bg-accent/20">
            <MapPin className="w-5 h-5 text-accent" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {destinations.map((destination, index) => {
            const revenuePercentage = (destination.revenue / maxRevenue) * 100;

            return (
              <div key={destination.destination} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${
                        index === 0
                          ? "bg-gradient-primary"
                          : index === 1
                            ? "bg-gradient-secondary"
                            : "glass"
                      }
                    `}
                    >
                      <span className="text-sm font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {destination.destination}
                      </p>
                      <p className="text-xs text-white/60">
                        {destination.trips} viajes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      ${destination.revenue.toLocaleString()}
                    </p>
                    {index === 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>Líder</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 glass rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${
                      index === 0
                        ? "bg-gradient-primary"
                        : index === 1
                          ? "bg-gradient-secondary"
                          : "bg-gradient-accent"
                    }`}
                    style={{ width: `${revenuePercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
