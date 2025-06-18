import { clsx } from "clsx";
import { UserCheck, Plane, Star } from "lucide-react";

interface ContactStatusBadgeProps {
  status: "INTERESADO" | "PASAJERO" | "CLIENTE";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const statusConfig = {
  INTERESADO: {
    label: "Interesado",
    color: "blue",
    icon: UserCheck,
    bgClass: "bg-blue-500/20",
    textClass: "text-blue-300",
    borderClass: "border-blue-500/30",
  },
  PASAJERO: {
    label: "Pasajero",
    color: "amber",
    icon: Plane,
    bgClass: "bg-amber-500/20",
    textClass: "text-amber-300",
    borderClass: "border-amber-500/30",
  },
  CLIENTE: {
    label: "Cliente",
    color: "green",
    icon: Star,
    bgClass: "bg-green-500/20",
    textClass: "text-green-300",
    borderClass: "border-green-500/30",
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export const ContactStatusBadge = ({
  status,
  size = "md",
  showIcon = true,
}: ContactStatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full font-medium border",
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizeClasses[size]
      )}
    >
      {showIcon && (
        <Icon className={clsx("w-3.5 h-3.5", size === "lg" && "w-4 h-4")} />
      )}
      {config.label}
    </span>
  );
};
