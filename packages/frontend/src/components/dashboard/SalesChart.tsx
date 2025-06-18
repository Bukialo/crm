import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Calendar } from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import { SalesData } from "../../services/dashboard.service";

interface SalesChartProps {
  data: SalesData[];
  isLoading?: boolean;
}

export const SalesChart = ({ data, isLoading }: SalesChartProps) => {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ventas y Viajes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="loader"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-morphism p-3 rounded-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name === "Ventas"
                ? `$${entry.value.toLocaleString()}`
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ventas y Viajes</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 glass rounded-lg">
              <button
                onClick={() => setPeriod("week")}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  period === "week"
                    ? "bg-primary-500 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setPeriod("month")}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  period === "month"
                    ? "bg-primary-500 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setPeriod("year")}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  period === "year"
                    ? "bg-primary-500 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Año
              </button>
            </div>

            <Button
              size="sm"
              variant="glass"
              onClick={() =>
                setChartType(chartType === "line" ? "bar" : "line")
              }
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              {chartType === "line" ? "Barras" : "Líneas"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: "rgba(255,255,255,0.6)" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: "rgba(255,255,255,0.6)" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.8)" }} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Ventas"
                  dot={{ fill: "#8b5cf6", r: 6 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="trips"
                  stroke="#00d4ff"
                  strokeWidth={3}
                  name="Viajes"
                  dot={{ fill: "#00d4ff", r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: "rgba(255,255,255,0.6)" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: "rgba(255,255,255,0.6)" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.8)" }} />
                <Bar
                  dataKey="sales"
                  fill="#8b5cf6"
                  name="Ventas"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="trips"
                  fill="#00d4ff"
                  name="Viajes"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
