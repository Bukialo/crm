import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Users } from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";

interface PipelineChartProps {
  data: {
    interesados: number;
    pasajeros: number;
    clientes: number;
  };
  isLoading?: boolean;
}

export const PipelineChart = ({ data, isLoading }: PipelineChartProps) => {
  const chartData = [
    { name: "Interesados", value: data.interesados, color: "#3b82f6" },
    { name: "Pasajeros", value: data.pasajeros, color: "#f59e0b" },
    { name: "Clientes", value: data.clientes, color: "#10b981" },
  ];

  const total = data.interesados + data.pasajeros + data.clientes;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Contactos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="loader"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="glass-morphism p-3 rounded-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-sm text-white/80">
            {data.value} contactos ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    const percentage = ((entry.value / total) * 100).toFixed(0);
    return `${percentage}%`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pipeline de Contactos</CardTitle>
          <div className="p-2 rounded-lg bg-primary-500/20">
            <Users className="w-5 h-5 text-primary-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: "rgba(255,255,255,0.8)" }}
                formatter={(value: any, entry: any) => (
                  <span style={{ color: entry.color }}>
                    {value}: {entry.payload.value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {chartData.map((item) => (
            <div key={item.name} className="text-center">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: item.color }}
              />
              <p className="text-xs text-white/60">{item.name}</p>
              <p className="text-lg font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
