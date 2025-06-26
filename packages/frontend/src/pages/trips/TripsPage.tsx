// packages/frontend/src/pages/trips/TripsPage.tsx - ACTUALIZADA
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  Calendar,
  Users,
  DollarSign,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Card, {
  CardContent
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Badge } from "../../components/ui/badge";
import Modal, { useModal } from "../../components/ui/Modal";
import TripForm from "../../components/trips/TripForm";
import {
  useTrips,
  useTripStats,
  useCreateTrip,
  useUpdateTrip,
  useDeleteTrip,
  getStatusColor,
  getStatusIcon,
  getStatusText,
} from "../../hooks/useTrips";
import { Trip, TripFilters } from "../../services/trip.service";
import { usePagination } from "../../hooks/usePagination";

export const TripsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Modales
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Paginación
  const pagination = usePagination({ initialPageSize: 10 });

  // Filtros para la API
  const filters: TripFilters = {
    search: searchTerm || undefined,
    status:
      statusFilter !== "ALL" ? [statusFilter as Trip["status"]] : undefined,
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
  };

  // Queries
  const {
    data: tripsData,
    isLoading: tripsLoading,
    error: tripsError,
  } = useTrips(filters);
  const { data: statsData, isLoading: statsLoading } = useTripStats();

  // Mutations
  const createTripMutation = useCreateTrip();
  const updateTripMutation = useUpdateTrip();
  const deleteTripMutation = useDeleteTrip();

  // Handlers
  const handleCreateTrip = async (tripData: any) => {
    try {
      await createTripMutation.mutateAsync(tripData);
      createModal.closeModal();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleEditTrip = async (tripData: any) => {
    if (!selectedTrip) return;

    try {
      await updateTripMutation.mutateAsync({
        id: selectedTrip.id,
        data: tripData,
      });
      editModal.closeModal();
      setSelectedTrip(null);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleDeleteTrip = async () => {
    if (!selectedTrip) return;

    try {
      await deleteTripMutation.mutateAsync(selectedTrip.id);
      deleteModal.closeModal();
      setSelectedTrip(null);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleViewTrip = (trip: Trip) => {
    navigate(`/trips/${trip.id}`);
  };

  const openEditModal = (trip: Trip) => {
    setSelectedTrip(trip);
    editModal.openModal();
  };

  const openDeleteModal = (trip: Trip) => {
    setSelectedTrip(trip);
    deleteModal.openModal();
  };

  // Estados de carga
  const isLoading = tripsLoading || statsLoading;
  const trips = tripsData?.items || [];
  const stats = statsData;

  // Calcular estadísticas para las cards
  const statusStats = {
    total: stats?.totalTrips || 0,
    quote: trips.filter((t) => t.status === "QUOTE").length,
    booked: trips.filter((t) => t.status === "BOOKED").length,
    confirmed: trips.filter((t) => t.status === "CONFIRMED").length,
    completed: trips.filter((t) => t.status === "COMPLETED").length,
  };

  if (tripsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Error al cargar viajes
          </h3>
          <p className="text-white/60 mb-4">
            Hubo un problema al cargar los datos. Intenta recargar la página.
          </p>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Viajes</h1>
          <p className="text-white/60">
            Gestiona todos los viajes de tus clientes
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={createModal.openModal}
          disabled={isLoading}
        >
          Nuevo Viaje
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? "..." : statusStats.total}
                </p>
              </div>
              <Plane className="w-8 h-8 text-primary-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Cotizaciones</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? "..." : statusStats.quote}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Reservados</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? "..." : statusStats.booked}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Confirmados</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? "..." : statusStats.confirmed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Completados</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? "..." : statusStats.completed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            placeholder="Buscar viajes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass px-3 py-2 rounded-lg text-white text-sm"
          >
            <option value="ALL">Todos los estados</option>
            <option value="QUOTE">Cotización</option>
            <option value="BOOKED">Reservado</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>

          <Button variant="glass" leftIcon={<Filter className="w-4 h-4" />}>
            Filtros
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Trips List */}
      {!isLoading && (
        <div className="space-y-4">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              className="glass hover:bg-white/10 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
                      <Plane className="w-6 h-6 text-primary-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white text-lg">
                          {trip.destination}
                        </h3>
                        <Badge className={getStatusColor(trip.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(trip.status)}
                            {getStatusText(trip.status)}
                          </div>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/80">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-white/60" />
                          <span>
                            {trip.contact.firstName} {trip.contact.lastName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-white/60" />
                          <span>
                            {new Date(trip.departureDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-white/60" />
                          <span>{trip.travelers} viajeros</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-white/60" />
                          <span>
                            ${trip.finalPrice || trip.estimatedBudget}
                          </span>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="flex gap-2 mt-3">
                        {trip.includesFlight && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">
                            Vuelos
                          </span>
                        )}
                        {trip.includesHotel && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300">
                            Hoteles
                          </span>
                        )}
                        {trip.includesTransfer && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300">
                            Traslados
                          </span>
                        )}
                        {trip.includesTours && (
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-300">
                            Tours
                          </span>
                        )}
                        {trip.includesInsurance && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-300">
                            Seguro
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      leftIcon={<Eye className="w-4 h-4" />}
                      onClick={() => handleViewTrip(trip)}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      leftIcon={<Edit className="w-4 h-4" />}
                      onClick={() => openEditModal(trip)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => openDeleteModal(trip)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && trips.length === 0 && (
        <div className="text-center py-12">
          <Plane className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm || statusFilter !== "ALL"
              ? "No se encontraron viajes"
              : "No hay viajes registrados"}
          </h3>
          <p className="text-white/60 mb-4">
            {searchTerm || statusFilter !== "ALL"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza creando el primer viaje"}
          </p>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={createModal.openModal}
          >
            Crear Primer Viaje
          </Button>
        </div>
      )}

      {/* Paginación */}
      {!isLoading && tripsData && tripsData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/60">
            Mostrando {(pagination.currentPage - 1) * pagination.pageSize + 1} -{" "}
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              tripsData.total
            )}{" "}
            de {tripsData.total} viajes
          </div>
          <div className="flex gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={() => pagination.setPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => pagination.setPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage === tripsData.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal para crear viaje */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        title="Crear Nuevo Viaje"
        size="xl"
      >
        <TripForm
          onSubmit={handleCreateTrip}
          onCancel={createModal.closeModal}
          isLoading={createTripMutation.isPending}
        />
      </Modal>

      {/* Modal para editar viaje */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        title="Editar Viaje"
        size="xl"
      >
        {selectedTrip && (
          <TripForm
            initialData={selectedTrip}
            onSubmit={handleEditTrip}
            onCancel={editModal.closeModal}
            isLoading={updateTripMutation.isPending}
          />
        )}
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        title="Eliminar Viaje"
        size="md"
      >
        {selectedTrip && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white">¿Estás seguro?</h4>
                <p className="text-sm text-white/60">
                  Esta acción eliminará permanentemente el viaje a{" "}
                  <strong>{selectedTrip.destination}</strong> de{" "}
                  <strong>
                    {selectedTrip.contact.firstName}{" "}
                    {selectedTrip.contact.lastName}
                  </strong>
                  .
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={deleteModal.closeModal}
                disabled={deleteTripMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteTrip}
                isLoading={deleteTripMutation.isPending}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Eliminar Viaje
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
