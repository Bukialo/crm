// src/components/automations/ExecutionLog.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import { useAutomations } from "../../hooks/useAutomations";
import { AutomationExecution } from "../../services/automation.service";

export interface ExecutionLogProps {
  onClose: () => void;
  automationId?: string;
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({
  onClose,
  automationId,
}) => {
  const { executionHistory, executionLoading, refreshExecutionHistory } =
    useAutomations();

  const [selectedExecution, setSelectedExecution] =
    useState<AutomationExecution | null>(null);

  useEffect(() => {
    refreshExecutionHistory(automationId);
  }, [automationId, refreshExecutionHistory]);

  const getStatusIcon = (status: AutomationExecution["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "RUNNING":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: AutomationExecution["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "RUNNING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (execution: AutomationExecution) => {
    if (!execution.completedAt) return "En progreso...";

    const start = new Date(execution.triggeredAt);
    const end = new Date(execution.completedAt);
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);

    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.round(duration / 60)}m`;
    return `${Math.round(duration / 3600)}h`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Historial de Ejecuciones
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {automationId
                ? "Ejecuciones de esta automatización"
                : "Todas las ejecuciones"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshExecutionHistory(automationId)}
              disabled={executionLoading}
            >
              <RefreshCw
                className={`w-4 h-4 ${executionLoading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Execution List */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Ejecuciones ({executionHistory.length})
              </h3>

              {executionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : executionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay ejecuciones registradas
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {executionHistory.map((execution) => (
                    <div
                      key={execution.id}
                      onClick={() => setSelectedExecution(execution)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedExecution?.id === execution.id
                          ? "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}
                          >
                            {execution.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {calculateDuration(execution)}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Ejecución #{execution.id.slice(-8)}
                      </p>

                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(execution.triggeredAt)}
                      </p>

                      {execution.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 truncate">
                          Error: {execution.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Execution Details */}
          <div className="w-1/2 overflow-y-auto">
            <div className="p-4">
              {selectedExecution ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Detalles de Ejecución
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            {getStatusIcon(selectedExecution.status)}
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              Estado: {selectedExecution.status}
                            </h4>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                ID:
                              </span>
                              <span className="ml-2 font-mono text-gray-900 dark:text-white">
                                {selectedExecution.id}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Iniciado:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {formatDate(selectedExecution.triggeredAt)}
                              </span>
                            </div>

                            {selectedExecution.completedAt && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Completado:
                                </span>
                                <span className="ml-2 text-gray-900 dark:text-white">
                                  {formatDate(selectedExecution.completedAt)}
                                </span>
                              </div>
                            )}

                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Duración:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {calculateDuration(selectedExecution)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Trigger Data */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            Datos del Disparador
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto">
                            {JSON.stringify(
                              selectedExecution.triggerData,
                              null,
                              2
                            )}
                          </pre>
                        </CardContent>
                      </Card>

                      {/* Execution Log */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            Log de Ejecución
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {selectedExecution.executionLog.length > 0 ? (
                            <div className="space-y-2">
                              {selectedExecution.executionLog.map(
                                (logEntry, index) => (
                                  <div
                                    key={index}
                                    className="text-xs bg-gray-50 dark:bg-gray-700/50 p-2 rounded font-mono"
                                  >
                                    {logEntry}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              No hay entradas de log disponibles
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Error Details */}
                      {selectedExecution.error && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base text-red-600 dark:text-red-400">
                              Error
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                              <p className="text-sm text-red-800 dark:text-red-200">
                                {selectedExecution.error}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Selecciona una ejecución para ver los detalles
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
