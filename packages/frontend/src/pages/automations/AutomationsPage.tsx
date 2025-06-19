import { useState } from "react";
import { Plus, Zap, BarChart3, Filter, Play, Pause } from "lucide-react";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAutomations, useAutomationStats } from "../../hooks/useAutomations";
import { useAutomationStore } from "../../store/automation.store";
import { AutomationCard } from "../../components/automations/AutomationCard";
import { AutomationForm } from "../../components/automations/AutomationForm";
import { ExecutionLog } from "../../components/automations/ExecutionLog";
import { Automation } from "../../services/automation.service";

const AutomationsPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showExecutionLog, setShowExecutionLog] = useState(false);

  const {
    filters,
    setFilters,
    resetFilters,
    showForm,
    setShowForm,
    editingAutomation,
    setEditingAutomation,
  } = useAutomationStore();

  const {
    automations,
    isLoading,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    executeAutomation,
  } = useAutomations(filters);

  const { data: stats, isLoading: statsLoading } = useAutomationStats();

  const handleCreateAutomation = async (data: any) => {
    try {
      await createAutomation(data);
      setShowForm(false);
      setEditingAutomation(null);
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleUpdateAutomation = async (data: any) => {
    if (!editingAutomation) return;

    try {
      await updateAutomation({ id: editingAutomation.id, data });
      setShowForm(false);
      setEditingAutomation(null);
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleDeleteAutomation = async (automation: Automation) => {
    if (window.confirm(`¿Estás seguro de eliminar "${automation.name}"?`)) {
      try {
        await deleteAutomation(automation.id);
      } catch (error) {
        // Error ya manejado por el hook
      }
    }
  };

  const handleToggleAutomation = async (automation: Automation) => {
    try {
      await toggleAutomation(automation.id);
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleTestAutomation = async (automation: Automation) => {
    try {
      // Datos de prueba para testing
      const testData = {
        contactId: "test-contact-id",
        userId: "current-user",
        timestamp: new Date().toISOString(),
      };

      await executeAutomation(automation.id, testData);
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleEditAutomation = (automation: Automation) => {
    setEditingAutomation(automation);
    setShowForm(true);
  };

  const activeAutomations = automations.filter((a) => a.isActive);
  const inactiveAutomations = automations.filter((a) => !a.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Automatizaciones
          </h1>
          <p className="text-white/60">
            {automations.length} automatizaciones configuradas
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="glass"
            leftIcon={<BarChart3 className="w-5 h-5" />}
            onClick={() => setShowExecutionLog(true)}
          >
            Ver Logs
          </Button>
          <Button
            variant="glass"
            leftIcon={<Filter className="w-5 h-5" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setShowForm(true)}
          >
            Nueva Automatización
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Total</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? "..." : stats?.totalAutomations || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Activas</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? "..." : stats?.activeAutomations || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/20">
                <Play className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Ejecuciones</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? "..." : stats?.totalExecutions || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/20">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? "..." : `${stats?.successRate || 0}%`}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <BarChart3 className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="fade-in">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Estado
                </label>
                <select
                  className="input-glass w-full"
                  value={
                    filters.isActive === undefined
                      ? ""
                      : String(filters.isActive)
                  }
                  onChange={(e) =>
                    setFilters({
                      isActive:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                    })
                  }
                >
                  <option value="">Todos</option>
                  <option value="true">Activas</option>
                  <option value="false">Inactivas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Tipo de Trigger
                </label>
                <select
                  className="input-glass w-full"
                  value={filters.triggerType || ""}
                  onChange={(e) =>
                    setFilters({ triggerType: e.target.value || undefined })
                  }
                >
                  <option value="">Todos los tipos</option>
                  <option value="CONTACT_CREATED">Contacto Creado</option>
                  <option value="TRIP_QUOTE_REQUESTED">
                    Cotización Solicitada
                  </option>
                  <option value="NO_ACTIVITY_30_DAYS">Sin Actividad</option>
                  <option value="PAYMENT_OVERDUE">Pago Vencido</option>
                  <option value="TRIP_COMPLETED">Viaje Completado</option>
                  <option value="BIRTHDAY">Cumpleaños</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="glass"
                  onClick={resetFilters}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automations List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-white/10 rounded mb-3" />
                <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Active Automations */}
          {activeAutomations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-green-400" />
                Automatizaciones Activas ({activeAutomations.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAutomations.map((automation) => (
                  <AutomationCard
                    key={automation.id}
                    automation={automation}
                    onEdit={handleEditAutomation}
                    onDelete={handleDeleteAutomation}
                    onToggle={handleToggleAutomation}
                    onTest={handleTestAutomation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Automations */}
          {inactiveAutomations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Pause className="w-5 h-5 text-gray-400" />
                Automatizaciones Inactivas ({inactiveAutomations.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactiveAutomations.map((automation) => (
                  <AutomationCard
                    key={automation.id}
                    automation={automation}
                    onEdit={handleEditAutomation}
                    onDelete={handleDeleteAutomation}
                    onToggle={handleToggleAutomation}
                    onTest={handleTestAutomation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {automations.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Zap className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No hay automatizaciones configuradas
                </h3>
                <p className="text-white/60 mb-6">
                  Crea tu primera automatización para optimizar tu flujo de
                  trabajo
                </p>
                <Button
                  variant="primary"
                  leftIcon={<Plus className="w-5 h-5" />}
                  onClick={() => setShowForm(true)}
                >
                  Crear Automatización
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Automation Form Modal */}
      {showForm && (
        <AutomationForm
          automation={editingAutomation}
          onSubmit={
            editingAutomation ? handleUpdateAutomation : handleCreateAutomation
          }
          onCancel={() => {
            setShowForm(false);
            setEditingAutomation(null);
          }}
        />
      )}

      {/* Execution Log Modal */}
      {showExecutionLog && (
        <ExecutionLog onClose={() => setShowExecutionLog(false)} />
      )}
    </div>
  );
};

export default AutomationsPage;
