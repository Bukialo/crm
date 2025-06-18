import {
  Users,
  Plane,
  DollarSign,
  TrendingUp,
  Calendar,
  Mail,
  RefreshCw,
} from "lucide-react";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import { StatsCard } from "../components/dashboard/StatsCard";
import { SalesChart } from "../components/dashboard/SalesChart";
import { PipelineChart } from "../components/dashboard/PipelineChart";
import { TopDestinations } from "../components/dashboard/TopDestinations";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { AgentPerformance } from "../components/dashboard/AgentPerformance";

// Datos de ejemplo mientras no tengamos el backend conectado
const mockData = {
  stats: {
    totalContacts: 1234,
    newContactsThisMonth: 87,
    activeTrips: 42,
    completedTrips: 156,
    revenue: {
      thisMonth: 45678,
      lastMonth: 38945,
      growth: 17.3,
    },
    conversionRate: 24.5,
    contactsByStatus: {
      interesados: 543,
      pasajeros: 289,
      clientes: 402,
    },
  },
  salesChart: [
    { month: "Ene", sales: 32000, trips: 28 },
    { month: "Feb", sales: 38000, trips: 32 },
    { month: "Mar", sales: 35000, trips: 30 },
    { month: "Abr", sales: 42000, trips: 38 },
    { month: "May", sales: 48000, trips: 42 },
    { month: "Jun", sales: 45678, trips: 35 },
  ],
  topDestinations: [
    { destination: "París", trips: 45, revenue: 67500 },
    { destination: "Roma", trips: 38, revenue: 52300 },
    { destination: "Nueva York", trips: 32, revenue: 48900 },
    { destination: "Tokio", trips: 28, revenue: 42700 },
    { destination: "Barcelona", trips: 25, revenue: 31250 },
  ],
  agentPerformance: [
    {
      id: "1",
      name: "María García",
      contactsManaged: 125,
      tripsBooked: 28,
      revenue: 42300,
      conversionRate: 22.4,
    },
    {
      id: "2",
      name: "Carlos López",
      contactsManaged: 98,
      tripsBooked: 19,
      revenue: 31200,
      conversionRate: 19.4,
    },
    {
      id: "3",
      name: "Ana Martínez",
      contactsManaged: 87,
      tripsBooked: 15,
      revenue: 28900,
      conversionRate: 17.2,
    },
  ],
  recentActivity: [
    {
      id: "1",
      type: "contact_created" as const,
      description: "Nuevo contacto: Roberto Silva",
      timestamp: new Date().toISOString(),
      user: { name: "María García" },
    },
    {
      id: "2",
      type: "trip_booked" as const,
      description: "Viaje reservado a París - 2 personas",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: { name: "Carlos López" },
    },
    {
      id: "3",
      type: "status_changed" as const,
      description: "Juan Pérez cambió a Pasajero",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: { name: "Ana Martínez" },
    },
    {
      id: "4",
      type: "payment_received" as const,
      description: "Pago recibido: $1,500 - Viaje a Roma",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      user: { name: "María García" },
    },
  ],
};

const Dashboard = () => {
  const { user } = useAuth();

  // Cuando tengamos el backend, usar:
  // const { stats, salesChart, topDestinations, agentPerformance, recentActivity, isLoading, refetch } = useDashboard()

  // Por ahora usamos datos mock
  const {
    stats,
    salesChart,
    topDestinations,
    agentPerformance,
    recentActivity,
  } = mockData;
  const isLoading = false;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido, {user?.firstName} 👋
          </h1>
          <p className="text-white/60">
            Este es el resumen de tu actividad de hoy
          </p>
        </div>
        <Button
          variant="glass"
          leftIcon={<RefreshCw className="w-5 h-5" />}
          onClick={() => {}} // refetch cuando tengamos el hook
        >
          Actualizar
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Contactos"
          value={stats.totalContacts}
          change={12}
          icon={<Users className="w-6 h-6 text-white" />}
          iconColor="bg-gradient-to-br from-blue-500 to-cyan-500"
        />

        <StatsCard
          title="Viajes Activos"
          value={stats.activeTrips}
          change={18}
          icon={<Plane className="w-6 h-6 text-white" />}
          iconColor="bg-gradient-to-br from-purple-500 to-pink-500"
        />

        <StatsCard
          title="Ingresos del Mes"
          value={`${stats.revenue.thisMonth.toLocaleString()}`}
          change={stats.revenue.growth}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          iconColor="bg-gradient-to-br from-green-500 to-emerald-500"
        />

        <StatsCard
          title="Tasa de Conversión"
          value={`${stats.conversionRate}%`}
          change={4.2}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          iconColor="bg-gradient-to-br from-orange-500 to-red-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={salesChart} isLoading={isLoading} />
        </div>
        <div>
          <PipelineChart data={stats.contactsByStatus} isLoading={isLoading} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Destinations */}
        <TopDestinations destinations={topDestinations} isLoading={isLoading} />

        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} isLoading={isLoading} />

        {/* Agent Performance */}
        <AgentPerformance agents={agentPerformance} isLoading={isLoading} />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="glass"
              className="justify-start"
              leftIcon={<Users className="w-5 h-5" />}
              onClick={() => (window.location.href = "/contacts")}
            >
              Nuevo Contacto
            </Button>
            <Button
              variant="glass"
              className="justify-start"
              leftIcon={<Plane className="w-5 h-5" />}
            >
              Crear Viaje
            </Button>
            <Button
              variant="glass"
              className="justify-start"
              leftIcon={<Mail className="w-5 h-5" />}
            >
              Nueva Campaña
            </Button>
            <Button
              variant="glass"
              className="justify-start"
              leftIcon={<Calendar className="w-5 h-5" />}
            >
              Ver Calendario
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
