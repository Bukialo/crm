// src/pages/automations/AutomationsPage.tsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Zap,
  Plus,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  BarChart3,
} from "lucide-react";
import { useAutomations } from "../../hooks/useAutomations";
import { ExecutionLog } from "../../components/automations/ExecutionLog";
import { AutomationTriggerType } from "../../services/automation.service";

export const AutomationsPage: React.FC = () => {
  const {
    automations,
    stats,
    loading,
    statsLoading,
    executeAutomation,
    toggleAutomation,
    deleteAutomation,
    filters,
    setFilters,
  } = useAutomations();

  const [searchTerm, setSearchTerm] = useState("");
  const [showExecutionLog, setShowExecutionLog] = useState(false);
  const [selectedAutomationId, setSelectedAutomationId] = useState<
    string | undefined
  >();

  const handleTestAutomation = async (automationId: string) => {
    const testData = {
      contactId: "test-contact-123",
      contactEmail: "test@example.com",
      contactName: "Test Contact",
    };

    try {
      await executeAutomation({ id: automationId, triggerData: testData });
      alert("Automatización ejecutada exitosamente");
    } catch (error) {
      alert("Error al ejecutar la automatización");
      console.error(error);
    }
  };

  // Filtrar automatizaciones por término de búsqueda
  const filteredAutomations = Array.isArray(automations)
    ? automations.filter(
        (automation) =>
          automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          automation.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : [];

  const activeAutomations = filteredAutomations.filter((a) => a.isActive);
  const inactiveAutomations = filteredAutomations.filter((a) => !a.isActive);

  const getTriggerTypeLabel = (type: AutomationTriggerType) => {
    const labels = {
      CONTACT_CREATED: "Contacto creado",
      TRIP_BOOKED: "Viaje reservado",
      PAYMENT_RECEIVED: "Pago recibido",
      EMAIL_OPENED: "Email abierto",
      FORM_SUBMITTED: "Formulario enviado",
      DATE_REACHED: "Fecha alcanzada",
      STATUS_CHANGED: "Estado cambiado",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Automatizaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {Array.isArray(automations) ? automations.length : 0}{" "}
            automatizaciones configuradas
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedAutomationId(undefined);
              setShowExecutionLog(true);
            }}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Ver Historial
          </Button>

          <Button variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Automatización
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Automatizaciones
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? "..." : stats?.totalAutomations || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Activas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? "..." : stats?.activeAutomations || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ejecuciones Totales
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? "..." : stats?.totalExecutions || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tasa de Éxito
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? "..." : `${stats?.successRate || 0}%`}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar automatizaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filters.triggerType || ""}
            onChange={(e) =>
              setFilters({
                triggerType:
                  (e.target.value as AutomationTriggerType) || undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todos los disparadores</option>
            <option value="CONTACT_CREATED">Contacto creado</option>
            <option value="TRIP_BOOKED">Viaje reservado</option>
            <option value="PAYMENT_RECEIVED">Pago recibido</option>
            <option value="EMAIL_OPENED">Email abierto</option>
            <option value="STATUS_CHANGED">Estado cambiado</option>
          </select>

          <Button
            variant="outline"
            onClick={() => setFilters({ isActive: !filters.isActive })}
          >
            <Filter className="w-4 h-4 mr-2" />
            {filters.isActive ? "Activas" : "Todas"}
          </Button>
        </div>
      </div>

      {/* Automations List */}
      <div className="space-y-6">
        {/* Active Automations */}
        {activeAutomations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Automatizaciones Activas ({activeAutomations.length})
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {activeAutomations.map((automation) => (
                <Card
                  key={automation.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {automation.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {automation.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Disparador:{" "}
                            {getTriggerTypeLabel(automation.trigger.type)}
                          </span>

                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {automation.executionCount} ejecuciones
                          </span>

                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {automation.successCount > 0
                              ? Math.round(
                                  (automation.successCount /
                                    automation.executionCount) *
                                    100
                                )
                              : 0}
                            % éxito
                          </span>

                          {automation.lastExecuted && (
                            <span>
                              Última:{" "}
                              {new Date(
                                automation.lastExecuted
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                            Activa
                          </span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs">
                            {automation.actions.length} acciones
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestAutomation(automation.id)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAutomation(automation.id, false)}
                        >
                          <Pause className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAutomationId(automation.id);
                            setShowExecutionLog(true);
                          }}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>

                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Inactive Automations */}
        {inactiveAutomations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Automatizaciones Inactivas ({inactiveAutomations.length})
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {inactiveAutomations.map((automation) => (
                <Card
                  key={automation.id}
                  className="opacity-75 hover:opacity-100 hover:shadow-md transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Pause className="w-5 h-5 text-gray-500" />
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {automation.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {automation.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Disparador:{" "}
                            {getTriggerTypeLabel(automation.trigger.type)}
                          </span>

                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {automation.executionCount} ejecuciones
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                            Inactiva
                          </span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs">
                            {automation.actions.length} acciones
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAutomation(automation.id, true)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>

                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "¿Estás seguro de que quieres eliminar esta automatización?"
                              )
                            ) {
                              deleteAutomation(automation.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && Array.isArray(automations) && automations.length === 0 && (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay automatizaciones
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Crea tu primera automatización para mejorar la eficiencia de tu
              CRM
            </p>
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Automatización
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Cargando automatizaciones...
            </span>
          </div>
        )}

        {/* No Results */}
        {!loading &&
          Array.isArray(automations) &&
          automations.length > 0 &&
          filteredAutomations.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron automatizaciones
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Intenta ajustar los filtros de búsqueda
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilters({});
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          )}
      </div>

      {/* Execution Log Modal */}
      {showExecutionLog && (
        <ExecutionLog
          onClose={() => setShowExecutionLog(false)}
          automationId={selectedAutomationId}
        />
      )}
    </div>
  );
};
