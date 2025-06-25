// src/pages/trips/TripsPage.tsx
import React, { useState } from "react";
import {
  Plane,
  MapPin,
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
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";

interface Trip {
  id: string;
  destination: string;
  contactName: string;
  contactEmail: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  status: "QUOTE" | "BOOKED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  estimatedBudget: number;
  finalPrice?: number;
  services: {
    flights: boolean;
    hotels: boolean;
    transfers: boolean;
    tours: boolean;
    insurance: boolean;
  };
  createdAt: string;
}

export const TripsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading] = useState(false);

  // Mock data para desarrollo
  const mockTrips: Trip[] = [
    {
      id: "1",
      destination: "París, Francia",
      contactName: "María García",
      contactEmail: "maria@example.com",
      departureDate: "2025-07-15",
      returnDate: "2025-07-22",
      travelers: 2,
      status: "CONFIRMED",
      estimatedBudget: 3500,
      finalPrice: 3200,
      services: {
        flights: true,
        hotels: true,
        transfers: true,
        tours: true,
        insurance: true,
      },
      createdAt: "2025-06-15",
    },
    {
      id: "2",
      destination: "Roma, Italia",
      contactName: "Juan Pérez",
      contactEmail: "juan@example.com",
      departureDate: "2025-08-10",
      returnDate: "2025-08-17",
      travelers: 4,
      status: "BOOKED",
      estimatedBudget: 5200,
      finalPrice: 4800,
      services: {
        flights: true,
        hotels: true,
        transfers: false,
        tours: true,
        insurance: true,
      },
      createdAt: "2025-06-20",
    },
    {
      id: "3",
      destination: "Bali, Indonesia",
      contactName: "Ana López",
      contactEmail: "ana@example.com",
      departureDate: "2025-09-05",
      returnDate: "2025-09-15",
      travelers: 2,
      status: "QUOTE",
      estimatedBudget: 4200,
      services: {
        flights: true,
        hotels: true,
        transfers: true,
        tours: false,
        insurance: false,
      },
      createdAt: "2025-06-22",
    },
  ];

  const filteredTrips = mockTrips.filter((trip) => {
    const matchesSearch =
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.contactName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || trip.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Trip["status"]) => {
    switch (status) {
      case "QUOTE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "BOOKED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "CONFIRMED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: Trip["status"]) => {
    switch (status) {
      case "QUOTE":
        return <Clock className="w-4 h-4" />;
      case "BOOKED":
        return <Calendar className="w-4 h-4" />;
      case "CONFIRMED":
        return <CheckCircle className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: Trip["status"]) => {
    switch (status) {
      case "QUOTE":
        return "Cotización";
      case "BOOKED":
        return "Reservado";
      case "CONFIRMED":
        return "Confirmado";
      case "COMPLETED":
        return "Completado";
      case "CANCELLED":
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  const statusStats = {
    total: mockTrips.length,
    quote: mockTrips.filter((t) => t.status === "QUOTE").length,
    booked: mockTrips.filter((t) => t.status === "BOOKED").length,
    confirmed: mockTrips.filter((t) => t.status === "CONFIRMED").length,
    completed: mockTrips.filter((t) => t.status === "COMPLETED").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
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
                  {statusStats.total}
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
                  {statusStats.quote}
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
                  {statusStats.booked}
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
                  {statusStats.confirmed}
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
                  {statusStats.completed}
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

      {/* Trips List */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
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
                        <span>{trip.contactName}</span>
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
                        <span>${trip.finalPrice || trip.estimatedBudget}</span>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="flex gap-2 mt-3">
                      {trip.services.flights && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">
                          Vuelos
                        </span>
                      )}
                      {trip.services.hotels && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300">
                          Hoteles
                        </span>
                      )}
                      {trip.services.transfers && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300">
                          Traslados
                        </span>
                      )}
                      {trip.services.tours && (
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-300">
                          Tours
                        </span>
                      )}
                      {trip.services.insurance && (
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
                  >
                    Ver
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    leftIcon={<Edit className="w-4 h-4" />}
                  >
                    Editar
                  </Button>
                  <Button variant="glass" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTrips.length === 0 && (
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
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Crear Primer Viaje
          </Button>
        </div>
      )}
    </div>
  );
};
