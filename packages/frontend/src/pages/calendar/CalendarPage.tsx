import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  TrendingUp,
  Clock,
  Users,
  Zap,
  BarChart3,
} from "lucide-react";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Calendar } from "../components/calendar/Calendar";
import { EventCard } from "../components/calendar/EventCard";
import { useAuth } from "../hooks/useAuth";
import {
  useUpcomingEvents,
  useTodayEvents,
  useCalendarStats,
  useCalendarHelpers,
} from "../hooks/useCalendar";

const CalendarPage = () => {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<"calendar" | "stats">(
    "calendar"
  );

  const { data: upcomingEvents = [], isLoading: loadingUpcoming } =
    useUpcomingEvents(7);
  const { data: todayEvents = [], isLoading: loadingToday } = useTodayEvents();
  const { data: stats, isLoading: loadingStats } = useCalendarStats();
  const { getEventTypeLabel, isEventUpcoming, isEventToday } =
    useCalendarHelpers();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Calendario</h1>
          <p className="text-white/60">
            Gestiona tus eventos, reuniones y recordatorios
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 glass rounded-lg">
            <button
              onClick={() => setSelectedView("calendar")}
              className={`px-3 py-1 rounded text-sm transition-all ${
                selectedView === "calendar"
                  ? "bg-primary-500 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Calendario
            </button>
            <button
              onClick={() => setSelectedView("stats")}
              className={`px-3 py-1 rounded text-sm transition-all ${
                selectedView === "stats"
                  ? "bg-primary-500 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Estadísticas
            </button>
          </div>
        </div>
      </div>

      {selectedView === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <Calendar userId={user?.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Eventos de Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingToday ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 glass rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : todayEvents.length === 0 ? (
                  <div className="text-center py-6">
                    <CalendarIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">No hay eventos hoy</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayEvents.slice(0, 3).map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        compact
                        showTime
                      />
                    ))}
                    {todayEvents.length > 3 && (
                      <p className="text-xs text-white/60 text-center">
                        +{todayEvents.length - 3} eventos más
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Próximos 7 Días
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingUpcoming ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-20 glass rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <div className="text-center py-6">
                    <CalendarIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">
                      No hay eventos próximos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {upcomingEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        showDate
                        showTime
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="glass"
                    size="sm"
                    className="w-full justify-start"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Nuevo Evento
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    className="w-full justify-start"
                    leftIcon={<Users className="w-4 h-4" />}
                  >
                    Reunión con Cliente
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    className="w-full justify-start"
                    leftIcon={<Zap className="w-4 h-4" />}
                  >
                    Generar Eventos IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Statistics View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Total Eventos</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalEvents || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <CalendarIcon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Próximos</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.upcomingEvents || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/20">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Vencidos</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.overdueEvents || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/20">
                  <Clock className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Este Mes</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.eventsByMonth?.[stats.eventsByMonth.length - 1]
                      ?.events || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events by Type */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Eventos por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-6 glass rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.eventsByType &&
                    Object.entries(stats.eventsByType).map(([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between"
                      >
                        <span className="text-white/80">
                          {getEventTypeLabel(type as any)}
                        </span>
                        <span className="text-white font-semibold">
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tendencia Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="loader"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats?.eventsByMonth?.map((monthData) => (
                    <div
                      key={monthData.month}
                      className="flex items-center justify-between"
                    >
                      <span className="text-white/80">{monthData.month}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 glass rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-primary transition-all"
                            style={{
                              width: `${Math.min((monthData.events / (stats.totalEvents || 1)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-white font-semibold w-8 text-right">
                          {monthData.events}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
