import { Trophy, TrendingUp } from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import { AgentPerformance as AgentPerformanceType } from "../../services/dashboard.service";

interface AgentPerformanceProps {
  agents: AgentPerformanceType[];
  isLoading?: boolean;
}

export const AgentPerformance = ({
  agents,
  isLoading,
}: AgentPerformanceProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento de Agentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 glass rounded-lg animate-pulse">
                <div className="h-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ordenar por revenue
  const sortedAgents = [...agents].sort((a, b) => b.revenue - a.revenue);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rendimiento de Agentes</CardTitle>
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedAgents.map((agent, index) => (
            <div
              key={agent.id}
              className={`p-4 rounded-lg transition-all hover:scale-[1.02] ${
                index === 0
                  ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30"
                  : "glass"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {index === 0 && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white flex items-center gap-2">
                      {agent.name}
                      {index === 0 && (
                        <span className="text-xs text-amber-400">
                          Top Vendedor
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/60">
                      {agent.contactsManaged} contactos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    ${agent.revenue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>{agent.conversionRate.toFixed(1)}% conv.</span>
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 glass rounded">
                  <p className="text-xs text-white/60">Contactos</p>
                  <p className="text-sm font-semibold text-white">
                    {agent.contactsManaged}
                  </p>
                </div>
                <div className="p-2 glass rounded">
                  <p className="text-xs text-white/60">Viajes</p>
                  <p className="text-sm font-semibold text-white">
                    {agent.tripsBooked}
                  </p>
                </div>
                <div className="p-2 glass rounded">
                  <p className="text-xs text-white/60">Conv. Rate</p>
                  <p className="text-sm font-semibold text-white">
                    {agent.conversionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
