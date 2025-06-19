import { useState } from "react";
import {
  Play,
  Pause,
  Edit,
  Trash2,
  MoreVertical,
  TestTube2,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  AlertTriangle,
  Gift,
  Calendar,
  Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import {
  Automation,
  automationService,
} from "../../services/automation.service";
import { clsx } from "clsx";

interface AutomationCardProps {
  automation: Automation;
  onEdit: (automation: Automation) => void;
  onDelete: (automation: Automation) => void;
  onToggle: (automation: Automation) => void;
  onTest: (automation: Automation) => void;
}

const triggerIcons = {
  CONTACT_CREATED: Users,
  TRIP_QUOTE_REQUESTED: FileText,
  PAYMENT_OVERDUE: AlertTriangle,
  TRIP_COMPLETED: CheckCircle,
  NO_ACTIVITY_30_DAYS: Clock,
  SEASONAL_OPPORTUNITY: Calendar,
  BIRTHDAY: Gift,
  CUSTOM: Settings,
};

export const AutomationCard = ({
  automation,
  onEdit,
  onDelete,
  onToggle,
  onTest,
}: AutomationCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const triggerConfig = automationService.getTriggerTypeConfig();
  const config = triggerConfig[automation.triggerType];
  const TriggerIcon = triggerIcons[automation.triggerType];

  const recentExecution = automation.executions?.[0];
  const executionStatusConfig = automationService.getExecutionStatusConfig();

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(automation);
    } finally {
      setIsToggling(false);
    }
  };

  const getSuccessRate = () => {
    if (!automation.executions || automation.executions.length === 0) return 0;
    const successful = automation.executions.filter(
      (e) => e.status === "completed"
    ).length;
    return Math.round((successful / automation.executions.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "running":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <Card
      hover
      className={clsx(
        "group transition-all duration-300",
        automation.isActive
          ? "border-green-500/30 hover:border-green-500/50"
          : "border-gray-500/30 hover:border-gray-500/50 opacity-75"
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={clsx(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                config?.lightColor || "bg-gray-500/20"
              )}
            >
              <TriggerIcon
                className={clsx(
                  "w-5 h-5",
                  config?.textColor || "text-gray-300"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">
                {automation.name}
              </h3>
              <p className="text-sm text-white/60 truncate">
                {config?.label || automation.triggerType}
              </p>
            </div>
          </div>

          {/* Status & Menu */}
          <div className="flex items-center gap-2">
            <div
              className={clsx(
                "w-3 h-3 rounded-full",
                automation.isActive ? "bg-green-400" : "bg-gray-400"
              )}
            />

            <div className="relative">
              <Button
                variant="glass"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity px-2"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 glass-morphism rounded-lg p-2 z-10 fade-in">
                  <button
                    onClick={() => {
                      onEdit(automation);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>

                  <button
                    onClick={() => {
                      onTest(automation);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <TestTube2 className="w-4 h-4" />
                    Probar
                  </button>

                  <button
                    onClick={handleToggle}
                    disabled={isToggling}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    {automation.isActive ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Activar
                      </>
                    )}
                  </button>

                  <hr className="my-1 border-white/10" />

                  <button
                    onClick={() => {
                      onDelete(automation);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {automation.description && (
          <p className="text-sm text-white/60 mb-4 line-clamp-2">
            {automation.description}
          </p>
        )}

        {/* Actions Summary */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/60">
              {automation.actions.length}{" "}
              {automation.actions.length === 1 ? "acción" : "acciones"}
            </span>
          </div>

          {automation.executions && automation.executions.length > 0 && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/60">
                {getSuccessRate()}% éxito
              </span>
            </div>
          )}
        </div>

        {/* Recent Execution */}
        {recentExecution && (
          <div className="p-3 glass rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {recentExecution.status === "completed" && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                {recentExecution.status === "failed" && (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                {recentExecution.status === "running" && (
                  <Clock className="w-4 h-4 text-blue-400 animate-spin" />
                )}
                <span
                  className={clsx(
                    "text-sm font-medium",
                    getStatusColor(recentExecution.status)
                  )}
                >
                  {executionStatusConfig[recentExecution.status]?.label ||
                    recentExecution.status}
                </span>
              </div>
              <span className="text-xs text-white/40">
                {formatDistanceToNow(new Date(recentExecution.startedAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
            {recentExecution.error && (
              <p className="text-xs text-red-400 mt-1 truncate">
                {recentExecution.error}
              </p>
            )}
          </div>
        )}

        {/* Conditions Preview */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
            Condiciones
          </p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(automation.triggerConditions)
              .slice(0, 3)
              .map(([key, value]) => (
                <span
                  key={key}
                  className="inline-block px-2 py-1 text-xs rounded-full glass"
                >
                  {key}: {String(value)}
                </span>
              ))}
            {Object.keys(automation.triggerConditions).length > 3 && (
              <span className="inline-block px-2 py-1 text-xs rounded-full glass">
                +{Object.keys(automation.triggerConditions).length - 3} más
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <span className="text-xs text-white/40">
            Creada{" "}
            {formatDistanceToNow(new Date(automation.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </span>

          <div className="flex items-center gap-2">
            {automation.isActive ? (
              <span className="text-xs text-green-400 font-medium">Activa</span>
            ) : (
              <span className="text-xs text-gray-400 font-medium">
                Inactiva
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
