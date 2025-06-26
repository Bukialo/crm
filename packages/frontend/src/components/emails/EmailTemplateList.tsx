import { useState } from "react";
import { Mail, Edit, Trash2, Copy, BarChart, Plus } from "lucide-react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import { EmailTemplate } from "../../services/email.service";
import { clsx } from "clsx";

interface EmailTemplateListProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (template: EmailTemplate) => void;
  onDuplicate: (template: EmailTemplate) => void;
  onUseTemplate: (template: EmailTemplate) => void;
}

// Moved categories to component level
const categories = [
  { value: "all", label: "Todas", icon: "📧" },
  { value: "WELCOME", label: "Bienvenida", icon: "👋" },
  { value: "QUOTE", label: "Cotización", icon: "📋" },
  { value: "FOLLOW_UP", label: "Seguimiento", icon: "📞" },
  { value: "SEASONAL", label: "Temporada", icon: "🌟" },
  { value: "POST_TRIP", label: "Post-viaje", icon: "✈️" },
];

export const EmailTemplateList = ({
  templates,
  isLoading,
  onEdit,
  onDelete,
  onDuplicate,
  onUseTemplate,
}: EmailTemplateListProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-48 animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-white/10 rounded mb-3" />
              <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={clsx(
            "px-4 py-2 rounded-lg whitespace-nowrap transition-all",
            selectedCategory === "all"
              ? "bg-primary-500 text-white"
              : "glass text-white/60 hover:text-white"
          )}
        >
          Todas
        </button>
        {categories.slice(1).map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={clsx(
              "px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2",
              selectedCategory === category.value
                ? "bg-primary-500 text-white"
                : "glass text-white/60 hover:text-white"
            )}
          >
            <span>{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Create New Template Card */}
        <Card
          hover
          className="border-2 border-dashed border-white/20 cursor-pointer group"
          onClick={() => onEdit({} as EmailTemplate)}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center h-48">
            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-primary-400" />
            </div>
            <p className="text-white font-medium">Nueva Plantilla</p>
            <p className="text-sm text-white/60 text-center mt-1">
              Crea una plantilla personalizada
            </p>
          </CardContent>
        </Card>

        {filteredTemplates.map((template) => {
          const categoryInfo = categories.find(
            (c) => c.value === template.category
          );

          return (
            <Card key={template.id} hover className="group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {template.name}
                      </h3>
                      <p className="text-xs text-white/60 flex items-center gap-1">
                        {categoryInfo?.icon} {categoryInfo?.label}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300">
                    Activa
                  </span>
                </div>

                <p className="text-sm text-white/80 mb-3 line-clamp-2">
                  {template.subject}
                </p>

                <div className="flex items-center gap-3 text-xs text-white/60 mb-4">
                  <span className="flex items-center gap-1">
                    <BarChart className="w-3 h-3" />0 usos
                  </span>
                  <span>•</span>
                  <span>
                    {Array.isArray(template.variables)
                      ? template.variables.length
                      : 0}{" "}
                    variables
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onUseTemplate(template)}
                    className="flex-1"
                  >
                    Usar
                  </Button>
                  <Button
                    size="sm"
                    variant="glass"
                    onClick={() => onEdit(template)}
                    leftIcon={<Edit className="w-3 h-3" />}
                  >
                    Editar
                  </Button>
                  <div className="relative group/menu">
                    <Button size="sm" variant="glass" className="px-2">
                      •••
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-40 glass-morphism rounded-lg p-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                      <button
                        onClick={() => onDuplicate(template)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicar
                      </button>
                      <button
                        onClick={() => onDelete(template)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
