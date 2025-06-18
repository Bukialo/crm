import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Plane,
  Mail,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { clsx } from "clsx";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contactos", href: "/contacts", icon: Users },
  { name: "Viajes", href: "/trips", icon: Plane },
  { name: "Campañas", href: "/campaigns", icon: Mail },
  { name: "Calendario", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "IA Assistant", href: "/ai", icon: Sparkles },
];

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-50 h-full transition-all duration-300 glass-dark",
          isOpen ? "w-64" : "w-20",
          "transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div
            className={clsx(
              "flex items-center",
              !isOpen && "justify-center w-full"
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            {isOpen && (
              <span className="ml-3 text-xl font-bold text-gradient">
                Bukialo
              </span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronRight className="w-5 h-5 text-white/60" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-primary text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/10",
                  !isOpen && "justify-center"
                )
              }
            >
              <item.icon
                className={clsx(
                  "flex-shrink-0",
                  isOpen ? "w-5 h-5" : "w-6 h-6"
                )}
              />
              {isOpen && <span className="ml-3 font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="p-3 border-t border-white/10">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              clsx(
                "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-gradient-primary text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10",
                !isOpen && "justify-center"
              )
            }
          >
            <Settings
              className={clsx("flex-shrink-0", isOpen ? "w-5 h-5" : "w-6 h-6")}
            />
            {isOpen && <span className="ml-3 font-medium">Configuración</span>}
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
