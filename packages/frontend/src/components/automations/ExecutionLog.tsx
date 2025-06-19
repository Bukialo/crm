import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Pause,
  RefreshCw,
} from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import { AutomationExecution } from "../../services/automation.service";
import { clsx } from "clsx";

interface ExecutionLogProps {
  executions: AutomationExecution[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
    label: "Pendiente",
  },
  running: {
    icon: PlayCircle,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    label: "Ejecutando",
  },
  completed: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/20",
    label: "Completado",
  },
  failed: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/20",
    label: "Fallido",
  },
  paused: {
    icon: Pause,
    color: "text-gray-400",
    bg: "bg-gray-500/20",
    label: "Pausado",
  },
};

export const ExecutionLog = ({
  executions,
  isLoading,
  onRefresh,
}: ExecutionLogProps) => {
  const [expandedExecution, setExpandedExecution] = useState<string | null>(
    null
  );

  const toggleExpanded = (executionId: string) => {
    setExpandedExecution(
      expandedExecution === executionId ? null : executionId
    );
  };

  const formatDuration = (startedAt: string, completedAt?: string) => {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

    if (duration < 60) return `${duration}s`;
    if (duration < 3600)
      return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log de Ejecuciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 glass rounded-lg animate-pulse" />
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
          <CardTitle>Log de Ejecuciones</CardTitle>
          <Button
            size="sm"
            variant="glass"
            onClick={onRefresh}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No hay ejecuciones registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {executions.map((execution) => {
              const config =
                statusConfig[execution.status as keyof typeof statusConfig];
              const Icon = config.icon;
              const isExpanded = expandedExecution === execution.id;

              return (
                <div
                  key={execution.id}
                  className={clsx(
                    "glass rounded-lg overflow-hidden transition-all",
                    execution.status === "failed" && "border border-red-500/30"
                  )}
                >
                  {/* Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => toggleExpanded(execution.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-white/60" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-white/60" />
                          )}
                        </button>

                        <div className={clsx("p-2 rounded-lg", config.bg)}>
                          <Icon className={clsx("w-4 h-4", config.color)} />
                        </div>

                        <div>
                          <p className="font-medium text-white">
                            {execution.automation?.name || "Automatización"}
                          </p>
                          <p className="text-sm text-white/60">
                            {format(
                              new Date(execution.startedAt),
                              "dd MMM yyyy, HH:mm",
                              {
                                locale: es,
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={clsx(
                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
                            config.bg,
                            config.color
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </div>
                        <p className="text-xs text-white/60 mt-1">
                          {formatDuration(
                            execution.startedAt,
                            execution.completedAt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4 space-y-4">
                      {/* Trigger Info */}
                      <div>
                        <h4 className="text-sm font-medium text-white mb-2">
                          Información del Trigger
                        </h4>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <pre className="text-xs text-white/80 whitespace-pre-wrap">
                            {JSON.stringify(execution.triggeredBy, null, 2)}
                          </pre>
                        </div>
                      </div>

                      {/* Actions Executed */}
                      {execution.actionsExecuted &&
                        execution.actionsExecuted.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-white mb-2">
                              Acciones Ejecutadas (
                              {execution.actionsExecuted.length})
                            </h4>
                            <div className="space-y-2">
                              {execution.actionsExecuted.map(
                                (action: any, index: number) => (
                                  <div
                                    key={index}
                                    className="p-3 bg-white/5 rounded-lg"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-white">
                                        {action.type || `Acción ${index + 1}`}
                                      </span>
                                      {action.status && (
                                        <span
                                          className={clsx(
                                            "px-2 py-0.5 rounded-full text-xs",
                                            action.status === "success"
                                              ? "bg-green-500/20 text-green-300"
                                              : action.status === "failed"
                                                ? "bg-red-500/20 text-red-300"
                                                : "bg-yellow-500/20 text-yellow-300"
                                          )}
                                        >
                                          {action.status}
                                        </span>
                                      )}
                                    </div>
                                    {action.result && (
                                      <p className="text-xs text-white/60">
                                        {action.result}
                                      </p>
                                    )}
                                    {action.error && (
                                      <p className="text-xs text-red-400 mt-1">
                                        Error: {action.error}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Error Info */}
                      {execution.error && (
                        <div>
                          <h4 className="text-sm font-medium text-red-400 mb-2">
                            Error
                          </h4>
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-sm text-red-300">
                              {execution.error}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Execution Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                        <div>
                          <p className="text-xs text-white/60">Inicio</p>
                          <p className="text-sm text-white">
                            {format(new Date(execution.startedAt), "HH:mm:ss", {
                              locale: es,
                            })}
                          </p>
                        </div>
                        {execution.completedAt && (
                          <div>
                            <p className="text-xs text-white/60">
                              Finalización
                            </p>
                            <p className="text-sm text-white">
                              {format(
                                new Date(execution.completedAt),
                                "HH:mm:ss",
                                {
                                  locale: es,
                                }
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
