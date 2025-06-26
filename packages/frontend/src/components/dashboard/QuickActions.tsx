// src/components/dashboard/QuickActions.tsx
import React from "react";
import { Plus, Mail, Calendar, FileText, Users, Plane } from "lucide-react";

export const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: Plus,
      label: "Nuevo Contacto",
      description: "Agregar lead",
      color: "bg-purple-600 hover:bg-purple-700",
      href: "/contacts",
    },
    {
      icon: Mail,
      label: "Enviar Email",
      description: "Campaña rápida",
      color: "bg-blue-600 hover:bg-blue-700",
      href: "/emails",
    },
    {
      icon: Calendar,
      label: "Nuevo Evento",
      description: "Programar cita",
      color: "bg-green-600 hover:bg-green-700",
      href: "/calendar",
    },
    {
      icon: FileText,
      label: "Cotización",
      description: "Crear propuesta",
      color: "bg-orange-600 hover:bg-orange-700",
      href: "/quotes",
    },
    {
      icon: Users,
      label: "Ver Contactos",
      description: "Lista completa",
      color: "bg-indigo-600 hover:bg-indigo-700",
      href: "/contacts",
    },
    {
      icon: Plane,
      label: "Nuevo Viaje",
      description: "Registrar viaje",
      color: "bg-teal-600 hover:bg-teal-700",
      href: "/trips",
    },
  ];

  const handleAction = (href: string) => {
    // En una implementación real, usarías React Router
    console.log(`Navigating to: ${href}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Acciones Rápidas
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => handleAction(action.href)}
              className={`flex items-center gap-3 p-3 rounded-lg text-white transition-colors ${action.color}`}
            >
              <div className="flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Resumen de Hoy
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Nuevos leads
            </span>
            <span className="font-medium text-gray-900 dark:text-white">5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Emails enviados
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              23
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Citas programadas
            </span>
            <span className="font-medium text-gray-900 dark:text-white">3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Cotizaciones
            </span>
            <span className="font-medium text-gray-900 dark:text-white">7</span>
          </div>
        </div>
      </div>
    </div>
  );
};
