// packages/frontend/src/hooks/useTrips.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import TripService, {
  Trip,
  CreateTripDto,
  UpdateTripDto,
  TripFilters
} from "../services/trip.service";

// Keys para React Query
export const TRIP_QUERY_KEYS = {
  all: ["trips"] as const,
  lists: () => [...TRIP_QUERY_KEYS.all, "list"] as const,
  list: (filters?: TripFilters) =>
    [...TRIP_QUERY_KEYS.lists(), filters] as const,
  details: () => [...TRIP_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TRIP_QUERY_KEYS.details(), id] as const,
  stats: () => [...TRIP_QUERY_KEYS.all, "stats"] as const,
};

// Hook para obtener lista de viajes
export const useTrips = (filters?: TripFilters) => {
  return useQuery({
    queryKey: TRIP_QUERY_KEYS.list(filters),
    queryFn: () => TripService.getTrips(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener un viaje específico
export const useTrip = (id: string) => {
  return useQuery({
    queryKey: TRIP_QUERY_KEYS.detail(id),
    queryFn: () => TripService.getTripById(id),
    enabled: !!id,
  });
};

// Hook para obtener estadísticas de viajes
export const useTripStats = () => {
  return useQuery({
    queryKey: TRIP_QUERY_KEYS.stats(),
    queryFn: () => TripService.getTripStats(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para crear viaje
export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripData: CreateTripDto) => TripService.createTrip(tripData),
    onSuccess: (newTrip) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: TRIP_QUERY_KEYS.all });

      toast.success(`Viaje a ${newTrip.destination} creado exitosamente`);
    },
    onError: (error: any) => {
      console.error("Error creating trip:", error);
      toast.error(error.response?.data?.error || "Error al crear el viaje");
    },
  });
};

// Hook para actualizar viaje
export const useUpdateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTripDto }) =>
      TripService.updateTrip(id, data),
    onSuccess: (updatedTrip) => {
      // Actualizar cache específico
      queryClient.setQueryData(
        TRIP_QUERY_KEYS.detail(updatedTrip.id),
        updatedTrip
      );

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: TRIP_QUERY_KEYS.lists() });

      toast.success("Viaje actualizado exitosamente");
    },
    onError: (error: any) => {
      console.error("Error updating trip:", error);
      toast.error(
        error.response?.data?.error || "Error al actualizar el viaje"
      );
    },
  });
};

// Hook para actualizar estado del viaje
export const useUpdateTripStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: Trip["status"];
      reason?: string;
    }) => TripService.updateTripStatus(id, status, reason),
    onSuccess: (updatedTrip) => {
      // Actualizar cache específico
      queryClient.setQueryData(
        TRIP_QUERY_KEYS.detail(updatedTrip.id),
        updatedTrip
      );

      // Invalidar listas y stats
      queryClient.invalidateQueries({ queryKey: TRIP_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TRIP_QUERY_KEYS.stats() });

      toast.success(
        `Estado actualizado a ${getStatusLabel(updatedTrip.status)}`
      );
    },
    onError: (error: any) => {
      console.error("Error updating trip status:", error);
      toast.error(
        error.response?.data?.error || "Error al actualizar el estado"
      );
    },
  });
};

// Hook para eliminar viaje
export const useDeleteTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TripService.deleteTrip(id),
    onSuccess: (_, deletedId) => {
      // Remover del cache específico
      queryClient.removeQueries({
        queryKey: TRIP_QUERY_KEYS.detail(deletedId),
      });

      // Invalidar listas y stats
      queryClient.invalidateQueries({ queryKey: TRIP_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TRIP_QUERY_KEYS.stats() });

      toast.success("Viaje eliminado exitosamente");
    },
    onError: (error: any) => {
      console.error("Error deleting trip:", error);
      toast.error(error.response?.data?.error || "Error al eliminar el viaje");
    },
  });
};

// Función helper para obtener labels de estado
export const getStatusLabel = (status: Trip["status"]): string => {
  const labels = {
    QUOTE: "Cotización",
    BOOKED: "Reservado",
    CONFIRMED: "Confirmado",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
  };
  return labels[status] || status;
};

// Función helper para obtener color de estado
export const getStatusColor = (status: Trip["status"]): string => {
  const colors = {
    QUOTE: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    BOOKED:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    CONFIRMED:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    COMPLETED:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  };
  return colors[status] || colors.QUOTE;
};

// Función helper para obtener icono de estado
export const getStatusIcon = (status: Trip["status"]) => {
  const icons = {
    QUOTE: "💭",
    BOOKED: "📅",
    CONFIRMED: "✅",
    COMPLETED: "🏁",
    CANCELLED: "❌",
  };
  return icons[status] || "💭";
};

// Función helper para obtener texto de estado
export const getStatusText = (status: Trip["status"]): string => {
  return getStatusLabel(status);
};
