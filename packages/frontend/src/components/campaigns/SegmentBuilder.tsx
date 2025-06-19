import { useState, useEffect } from "react";
import { Plus, X, Users, Filter } from "lucide-react";
import Button from "../ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";

interface SegmentCriteria {
  status?: string[];
  destinations?: string[];
  budgetRange?: string[];
  lastTripDays?: number;
  tags?: string[];
  source?: string[];
  noActivityDays?: number;
}

interface SegmentBuilderProps {
  criteria: SegmentCriteria;
  onChange: (criteria: SegmentCriteria) => void;
  onEstimateChange: (estimate: number) => void;
}

const statusOptions = [
  { value: "INTERESADO", label: "Interesado" },
  { value: "PASAJERO", label: "Pasajero" },
  { value: "CLIENTE", label: "Cliente" },
];

const budgetRangeOptions = [
  { value: "LOW", label: "Económico ($0 - $1,000)" },
  { value: "MEDIUM", label: "Medio ($1,000 - $3,000)" },
  { value: "HIGH", label: "Alto ($3,000 - $10,000)" },
  { value: "LUXURY", label: "Lujo ($10,000+)" },
];

const sourceOptions = [
  { value: "WEBSITE", label: "Sitio Web" },
  { value: "REFERRAL", label: "Referido" },
  { value: "SOCIAL_MEDIA", label: "Redes Sociales" },
  { value: "ADVERTISING", label: "Publicidad" },
  { value: "DIRECT", label: "Directo" },
  { value: "PARTNER", label: "Partner" },
  { value: "OTHER", label: "Otro" },
];

const popularDestinations = [
  "París",
  "Roma",
  "Nueva York",
  "Tokio",
  "Barcelona",
  "Londres",
  "Dubai",
  "Cancún",
  "Buenos Aires",
  "Sydney",
  "Madrid",
  "Miami",
];

const commonTags = [
  "VIP",
  "Corporativo",
  "Familiar",
  "Luna de Miel",
  "Aventura",
  "Relax",
  "Cultural",
  "Negocios",
  "Frecuente",
  "Premium",
];

export const SegmentBuilder = ({
  criteria,
  onChange,
  onEstimateChange,
}: SegmentBuilderProps) => {
  const [estimatedCount, setEstimatedCount] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Simulate API call to estimate recipients
  useEffect(() => {
    const calculateEstimate = async () => {
      setIsCalculating(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock calculation based on criteria
      let estimate = 1000; // Base number

      if (criteria.status?.length) {
        estimate = Math.floor(estimate * (criteria.status.length / 3));
      }

      if (criteria.budgetRange?.length) {
        estimate = Math.floor(estimate * (criteria.budgetRange.length / 4));
      }

      if (criteria.destinations?.length) {
        estimate = Math.floor(estimate * 0.3);
      }

      if (criteria.tags?.length) {
        estimate = Math.floor(estimate * 0.5);
      }

      if (criteria.lastTripDays) {
        estimate = Math.floor(estimate * 0.4);
      }

      if (criteria.noActivityDays) {
        estimate = Math.floor(estimate * 0.6);
      }

      // Add some randomness
      estimate = Math.floor(estimate * (0.8 + Math.random() * 0.4));

      setEstimatedCount(Math.max(0, estimate));
      onEstimateChange(Math.max(0, estimate));
      setIsCalculating(false);
    };

    calculateEstimate();
  }, [criteria, onEstimateChange]);

  const handleStatusChange = (status: string) => {
    const currentStatuses = criteria.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    onChange({ ...criteria, status: newStatuses });
  };

  const handleBudgetRangeChange = (range: string) => {
    const currentRanges = criteria.budgetRange || [];
    const newRanges = currentRanges.includes(range)
      ? currentRanges.filter((r) => r !== range)
      : [...currentRanges, range];

    onChange({ ...criteria, budgetRange: newRanges });
  };

  const handleSourceChange = (source: string) => {
    const currentSources = criteria.source || [];
    const newSources = currentSources.includes(source)
      ? currentSources.filter((s) => s !== source)
      : [...currentSources, source];

    onChange({ ...criteria, source: newSources });
  };

  const handleDestinationChange = (destination: string) => {
    const currentDestinations = criteria.destinations || [];
    const newDestinations = currentDestinations.includes(destination)
      ? currentDestinations.filter((d) => d !== destination)
      : [...currentDestinations, destination];

    onChange({ ...criteria, destinations: newDestinations });
  };

  const handleTagChange = (tag: string) => {
    const currentTags = criteria.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    onChange({ ...criteria, tags: newTags });
  };

  const clearAllFilters = () => {
    onChange({});
  };

  const hasActiveFilters = Object.keys(criteria).some((key) => {
    const value = criteria[key as keyof SegmentCriteria];
    return Array.isArray(value) ? value.length > 0 : value !== undefined;
  });

  return (
    <div className="space-y-6">
      {/* Estimated Recipients */}
      <Card variant="gradient">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-6 h-6 text-white" />
              <h3 className="text-lg font-semibold text-white">
                Destinatarios Estimados
              </h3>
            </div>
            {isCalculating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loader" />
                <span className="text-white/60">Calculando...</span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-white">
                {estimatedCount.toLocaleString()}
              </p>
            )}
            <p className="text-sm text-white/60 mt-1">
              contactos que recibirán esta campaña
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-white/60">Filtros activos aplicados</p>
          <Button
            variant="glass"
            size="sm"
            onClick={clearAllFilters}
            leftIcon={<X className="w-4 h-4" />}
          >
            Limpiar Todo
          </Button>
        </div>
      )}

      {/* Status Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado del Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  criteria.status?.includes(option.value)
                    ? "bg-primary-500 text-white"
                    : "glass text-white/60 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rango de Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {budgetRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleBudgetRangeChange(option.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  criteria.budgetRange?.includes(option.value)
                    ? "bg-primary-500 text-white"
                    : "glass text-white/60 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Source Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fuente de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sourceOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSourceChange(option.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  criteria.source?.includes(option.value)
                    ? "bg-primary-500 text-white"
                    : "glass text-white/60 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Destination Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Destinos de Interés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularDestinations.map((destination) => (
              <button
                key={destination}
                onClick={() => handleDestinationChange(destination)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  criteria.destinations?.includes(destination)
                    ? "bg-primary-500 text-white"
                    : "glass text-white/60 hover:text-white"
                }`}
              >
                {destination}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Etiquetas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {commonTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagChange(tag)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  criteria.tags?.includes(tag)
                    ? "bg-primary-500 text-white"
                    : "glass text-white/60 hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros Avanzados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Último viaje hace (días)
              </label>
              <input
                type="number"
                placeholder="Ej: 30"
                value={criteria.lastTripDays || ""}
                onChange={(e) =>
                  onChange({
                    ...criteria,
                    lastTripDays: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="input-glass w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Sin actividad hace (días)
              </label>
              <input
                type="number"
                placeholder="Ej: 60"
                value={criteria.noActivityDays || ""}
                onChange={(e) =>
                  onChange({
                    ...criteria,
                    noActivityDays: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="input-glass w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Segmentos Predefinidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="glass"
              size="sm"
              onClick={() =>
                onChange({
                  status: ["INTERESADO"],
                  noActivityDays: 30,
                })
              }
              className="justify-start"
            >
              Interesados Inactivos
            </Button>

            <Button
              variant="glass"
              size="sm"
              onClick={() =>
                onChange({
                  status: ["CLIENTE"],
                  lastTripDays: 365,
                })
              }
              className="justify-start"
            >
              Clientes Recurrentes
            </Button>

            <Button
              variant="glass"
              size="sm"
              onClick={() =>
                onChange({
                  budgetRange: ["HIGH", "LUXURY"],
                  status: ["PASAJERO", "CLIENTE"],
                })
              }
              className="justify-start"
            >
              Segmento Premium
            </Button>

            <Button
              variant="glass"
              size="sm"
              onClick={() =>
                onChange({
                  status: ["INTERESADO"],
                  source: ["WEBSITE", "SOCIAL_MEDIA"],
                })
              }
              className="justify-start"
            >
              Leads Digitales
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
