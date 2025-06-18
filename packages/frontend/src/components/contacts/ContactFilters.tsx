import { Search, Filter, X } from "lucide-react";
import { useState } from "react";
import { useContactsStore } from "../../store/contacts.store";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { ContactStatusBadge } from "./ContactStatusBadge";

const statusOptions = [
  { value: "INTERESADO", label: "Interesado" },
  { value: "PASAJERO", label: "Pasajero" },
  { value: "CLIENTE", label: "Cliente" },
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

export const ContactFilters = () => {
  const { filters, setFilters, resetFilters } = useContactsStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || "");

  const handleSearch = (value: string) => {
    setSearchValue(value);
    // Debounce search
    const timer = setTimeout(() => {
      setFilters({ search: value, page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleStatusToggle = (status: string) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    setFilters({ status: newStatuses, page: 1 });
  };

  const handleSourceChange = (source: string) => {
    const currentSources = filters.source || [];
    const newSources = currentSources.includes(source)
      ? currentSources.filter((s) => s !== source)
      : [...currentSources, source];

    setFilters({ source: newSources, page: 1 });
  };

  const handleReset = () => {
    setSearchValue("");
    resetFilters();
  };

  const hasActiveFilters =
    (filters.status && filters.status.length > 0) ||
    (filters.source && filters.source.length > 0) ||
    (filters.search && filters.search.length > 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <Button
          variant="glass"
          onClick={() => setShowAdvanced(!showAdvanced)}
          leftIcon={<Filter className="w-5 h-5" />}
        >
          Filtros
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full">
              {(filters.status?.length || 0) + (filters.source?.length || 0)}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="glass"
            onClick={handleReset}
            leftIcon={<X className="w-5 h-5" />}
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Quick Status Filters */}
      <div className="flex gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusToggle(option.value)}
            className={`transition-all ${
              filters.status?.includes(option.value)
                ? "scale-105"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <ContactStatusBadge
              status={option.value as any}
              size="md"
              showIcon={true}
            />
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="card-glass p-4 space-y-4 fade-in">
          {/* Source Filter */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Fuente de contacto
            </label>
            <div className="flex flex-wrap gap-2">
              {sourceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSourceChange(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    filters.source?.includes(option.value)
                      ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                      : "glass text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Ordenar por
              </label>
              <select
                className="input-glass w-full"
                value={filters.sortBy || "createdAt"}
                onChange={(e) => setFilters({ sortBy: e.target.value })}
              >
                <option value="createdAt">Fecha de creación</option>
                <option value="updatedAt">Última actualización</option>
                <option value="firstName">Nombre</option>
                <option value="lastName">Apellido</option>
                <option value="lastContact">Último contacto</option>
                <option value="nextFollowUp">Próximo seguimiento</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Orden
              </label>
              <select
                className="input-glass w-full"
                value={filters.sortOrder || "desc"}
                onChange={(e) =>
                  setFilters({ sortOrder: e.target.value as "asc" | "desc" })
                }
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
