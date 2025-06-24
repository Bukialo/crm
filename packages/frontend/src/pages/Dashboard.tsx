// src/pages/Dashboard.tsx
import React from "react";
import {
  Users,
  Calendar,
  Mail,
  TrendingUp,
  Plane,
  DollarSign,
  Clock,
  MapPin,
} from "lucide-react";
import { StatsCard } from "../components/dashboard/StatsCard";
import { Chart } from "../components/dashboard/Chart";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { QuickActions } from "../components/dashboard/QuickActions";

export const Dashboard: React.FC = () => {
  // Mock data para el dashboard con tipos compatibles con StatsCard
  const stats = [
    {
      title: "Total Contactos",
      value: "1,234",
      change: 12, // Número en lugar de string
      changeType: "positive" as const,
      icon: Users,
      color: "purple",
      iconColor: "#8b5cf6",
    },
    {
      title: "Viajes Activos",
      value: "87",
      change: 5, // Número en lugar de string
      changeType: "positive" as const,
      icon: Plane,
      color: "blue",
      iconColor: "#3b82f6",
    },
    {
      title: "Ingresos del Mes",
      value: "$45,678",
      change: 18, // Número en lugar de string
      changeType: "positive" as const,
      icon: DollarSign,
      color: "green",
      iconColor: "#10b981",
    },
    {
      title: "Conversión",
      value: "23.5%",
      change: -2, // Número negativo en lugar de string
      changeType: "negative" as const,
      icon: TrendingUp,
      color: "orange",
      iconColor: "#f59e0b",
    },
  ];

  const chartData = [
    { name: "Ene", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 600 },
    { name: "Abr", value: 800 },
    { name: "May", value: 500 },
    { name: "Jun", value: 900 },
  ];

  // Actividades recientes con tipos compatibles con RecentActivity
  const recentActivities = [
    {
      id: "1",
      type: "contact_created" as const, // Tipo específico esperado
      title: "Nuevo contacto registrado",
      description: "María González se registró como interesada",
      timestamp: "Hace 5 minutos",
      icon: Users,
      user: {
        name: "Sistema",
        avatar: "",
      },
    },
    {
      id: "2",
      type: "trip_booked" as const, // Tipo específico esperado
      title: "Viaje confirmado",
      description: "Carlos Mendoza confirmó su viaje a París",
      timestamp: "Hace 15 minutos",
      icon: Plane,
      user: {
        name: "Ana García",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
      },
    },
    {
      id: "3",
      type: "status_changed" as const, // Tipo específico esperado
      title: "Campaña enviada",
      description: "Promoción de verano enviada a 250 contactos",
      timestamp: "Hace 1 hora",
      icon: Mail,
      user: {
        name: "Sistema",
        avatar: "",
      },
    },
    {
      id: "4",
      type: "payment_received" as const, // Tipo específico esperado
      title: "Reunión programada",
      description: "Cita con Ana Pérez para el lunes 10:00 AM",
      timestamp: "Hace 2 horas",
      icon: Calendar,
      user: {
        name: "Juan Pérez",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Resumen de tu agencia de viajes
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          Última actualización: hace 5 minutos
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ingresos Mensuales
              </h3>
              <select className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Últimos 6 meses</option>
                <option>Último año</option>
              </select>
            </div>
            <Chart data={chartData} />
          </div>

          {/* Destinations Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Destinos Más Populares
            </h3>
            <div className="space-y-4">
              {[
                { destination: "París, Francia", percentage: 85, count: 42 },
                { destination: "Roma, Italia", percentage: 70, count: 35 },
                { destination: "Barcelona, España", percentage: 60, count: 30 },
                {
                  destination: "Londres, Reino Unido",
                  percentage: 45,
                  count: 22,
                },
                {
                  destination: "Amsterdam, Holanda",
                  percentage: 30,
                  count: 15,
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.destination}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* Recent Activity */}
          <RecentActivity activities={recentActivities} />

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Próximos Eventos
            </h3>
            <div className="space-y-3">
              {[
                {
                  title: "Reunión con cliente",
                  time: "10:00 AM",
                  date: "Hoy",
                  type: "meeting",
                },
                {
                  title: "Salida grupo París",
                  time: "06:00 AM",
                  date: "Mañana",
                  type: "departure",
                },
                {
                  title: "Seguimiento post-viaje",
                  time: "02:00 PM",
                  date: "Viernes",
                  type: "followup",
                },
              ].map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-purple-600 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {event.date} • {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
