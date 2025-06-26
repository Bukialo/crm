import { useState } from "react";
import {
  Plus,
  Trash2,
  Mail,
  Calendar,
  Tag,
  UserCheck,
  FileText,
  MessageSquare,
  Clock,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { AutomationAction } from "../../services/automation.service";
import { clsx } from "clsx";

interface ActionBuilderProps {
  actions: AutomationAction[];
  onChange: (actions: AutomationAction[]) => void;
}

// Configuración de tipos de acciones disponibles
const actionTypes = [
  {
    type: "SEND_EMAIL",
    label: "Enviar Email",
    icon: Mail,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    description: "Envía un email automático al contacto",
    fields: [
      {
        name: "templateId",
        label: "Plantilla de Email",
        type: "select",
        required: true,
      },
      { name: "subject", label: "Asunto", type: "text", required: false },
      {
        name: "personalizeWithAI",
        label: "Personalizar con IA",
        type: "boolean",
        required: false,
      },
    ],
  },
  {
    type: "CREATE_TASK",
    label: "Crear Tarea",
    icon: Calendar,
    color: "text-green-400",
    bg: "bg-green-500/20",
    description: "Crea una tarea para el agente asignado",
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      {
        name: "description",
        label: "Descripción",
        type: "textarea",
        required: false,
      },
      {
        name: "priority",
        label: "Prioridad",
        type: "select",
        required: true,
        options: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      },
      {
        name: "dueInDays",
        label: "Vencimiento (días)",
        type: "number",
        required: false,
      },
    ],
  },
  {
    type: "SCHEDULE_CALL",
    label: "Programar Llamada",
    icon: Calendar,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    description: "Programa una llamada de seguimiento",
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      {
        name: "duration",
        label: "Duración (minutos)",
        type: "number",
        required: true,
      },
      {
        name: "scheduleInDays",
        label: "Programar en (días)",
        type: "number",
        required: true,
      },
    ],
  },
  {
    type: "ADD_TAG",
    label: "Agregar Etiqueta",
    icon: Tag,
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
    description: "Agrega una etiqueta al contacto",
    fields: [{ name: "tag", label: "Etiqueta", type: "text", required: true }],
  },
  {
    type: "UPDATE_STATUS",
    label: "Cambiar Estado",
    icon: UserCheck,
    color: "text-orange-400",
    bg: "bg-orange-500/20",
    description: "Cambia el estado del contacto",
    fields: [
      {
        name: "status",
        label: "Nuevo Estado",
        type: "select",
        required: true,
        options: ["INTERESADO", "PASAJERO", "CLIENTE"],
      },
      { name: "reason", label: "Motivo", type: "text", required: false },
    ],
  },
  {
    type: "GENERATE_QUOTE",
    label: "Generar Cotización",
    icon: FileText,
    color: "text-cyan-400",
    bg: "bg-cyan-500/20",
    description: "Genera una cotización automática",
    fields: [
      {
        name: "templateType",
        label: "Tipo de Plantilla",
        type: "select",
        required: true,
        options: ["BASIC", "PREMIUM", "LUXURY"],
      },
      {
        name: "validityDays",
        label: "Validez (días)",
        type: "number",
        required: true,
      },
    ],
  },
  {
    type: "ASSIGN_AGENT",
    label: "Asignar Agente",
    icon: UserCheck,
    color: "text-indigo-400",
    bg: "bg-indigo-500/20",
    description: "Asigna un agente específico al contacto",
    fields: [
      { name: "agentId", label: "Agente", type: "select", required: true },
      {
        name: "notifyAgent",
        label: "Notificar al agente",
        type: "boolean",
        required: false,
      },
    ],
  },
  {
    type: "SEND_WHATSAPP",
    label: "Enviar WhatsApp",
    icon: MessageSquare,
    color: "text-green-400",
    bg: "bg-green-500/20",
    description: "Envía un mensaje por WhatsApp",
    fields: [
      { name: "message", label: "Mensaje", type: "textarea", required: true },
      {
        name: "templateName",
        label: "Plantilla",
        type: "select",
        required: false,
      },
    ],
  },
];

export const ActionBuilder = ({ actions, onChange }: ActionBuilderProps) => {
  const [showAddAction, setShowAddAction] = useState(false);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const addAction = (actionType: string) => {
    const actionConfig = actionTypes.find((a) => a.type === actionType);
    if (!actionConfig) return;

    const newAction: AutomationAction = {
      id: `action_${Date.now()}`,
      type: actionType as any,
      parameters: {},
      delayMinutes: 0,
      order: actions.length,
    };

    onChange([...actions, newAction]);
    setShowAddAction(false);
    setExpandedAction(newAction.id);
  };

  const updateAction = (
    actionId: string,
    updates: Partial<AutomationAction>
  ) => {
    const updatedActions = actions.map((action) =>
      action.id === actionId ? { ...action, ...updates } : action
    );
    onChange(updatedActions);
  };

  const removeAction = (actionId: string) => {
    const filteredActions = actions
      .filter((action) => action.id !== actionId)
      .map((action, index) => ({ ...action, order: index }));
    onChange(filteredActions);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(actions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order
    const reorderedActions = items.map((action, index) => ({
      ...action,
      order: index,
    }));

    onChange(reorderedActions);
  };

  const formatDelayText = (minutes: number) => {
    if (minutes === 0) return "Inmediatamente";
    if (minutes < 60) return `${minutes} minuto${minutes > 1 ? "s" : ""}`;
    if (minutes < 1440)
      return `${Math.floor(minutes / 60)} hora${Math.floor(minutes / 60) > 1 ? "s" : ""}`;
    return `${Math.floor(minutes / 1440)} día${Math.floor(minutes / 1440) > 1 ? "s" : ""}`;
  };

  const renderActionField = (action: AutomationAction, field: any) => {
    const value = action.parameters[field.name] || "";

    switch (field.type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) =>
              updateAction(action.id, {
                parameters: {
                  ...action.parameters,
                  [field.name]: e.target.value,
                },
              })
            }
            placeholder={field.label}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) =>
              updateAction(action.id, {
                parameters: {
                  ...action.parameters,
                  [field.name]: e.target.value,
                },
              })
            }
            placeholder={field.label}
            className="input-glass w-full h-24 resize-none"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) =>
              updateAction(action.id, {
                parameters: {
                  ...action.parameters,
                  [field.name]: parseInt(e.target.value) || 0,
                },
              })
            }
            placeholder={field.label}
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) =>
              updateAction(action.id, {
                parameters: {
                  ...action.parameters,
                  [field.name]: e.target.value,
                },
              })
            }
            className="input-glass w-full"
          >
            <option value="">Seleccionar {field.label}</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "boolean":
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) =>
                updateAction(action.id, {
                  parameters: {
                    ...action.parameters,
                    [field.name]: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-white/80">{field.label}</span>
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Acciones a Ejecutar</CardTitle>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowAddAction(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Agregar Acción
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 mb-4">No hay acciones configuradas</p>
            <Button
              variant="glass"
              onClick={() => setShowAddAction(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Agregar Primera Acción
            </Button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="actions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {actions
                    .sort((a, b) => a.order - b.order)
                    .map((action, index) => {
                      const actionConfig = actionTypes.find(
                        (a) => a.type === action.type
                      );
                      if (!actionConfig) return null;

                      const Icon = actionConfig.icon;
                      const isExpanded = expandedAction === action.id;

                      return (
                        <Draggable
                          key={action.id}
                          draggableId={action.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={clsx(
                                "glass rounded-lg overflow-hidden transition-all",
                                snapshot.isDragging &&
                                  "shadow-glass-lg scale-105"
                              )}
                            >
                              {/* Header */}
                              <div className="p-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="w-4 h-4 text-white/40" />
                                  </div>

                                  <div className="flex items-center gap-3 flex-1">
                                    <div
                                      className={clsx(
                                        "p-2 rounded-lg",
                                        actionConfig.bg
                                      )}
                                    >
                                      <Icon
                                        className={clsx(
                                          "w-4 h-4",
                                          actionConfig.color
                                        )}
                                      />
                                    </div>

                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-white/60">
                                          Paso {index + 1}
                                        </span>
                                        {(action.delayMinutes || 0) > 0 && (
                                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-xs">
                                            <Clock className="w-3 h-3" />
                                            {formatDelayText(
                                              action.delayMinutes || 0
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <p className="font-medium text-white">
                                        {actionConfig.label}
                                      </p>
                                      <p className="text-sm text-white/60">
                                        {actionConfig.description}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        setExpandedAction(
                                          isExpanded ? null : action.id
                                        )
                                      }
                                      className="p-1 rounded hover:bg-white/10 transition-colors"
                                    >
                                      <ChevronDown
                                        className={clsx(
                                          "w-4 h-4 text-white/60 transition-transform",
                                          isExpanded && "rotate-180"
                                        )}
                                      />
                                    </button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => removeAction(action.id)}
                                      leftIcon={<Trash2 className="w-3 h-3" />}
                                    >
                                      Eliminar
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Configuration */}
                              {isExpanded && (
                                <div className="border-t border-white/10 p-4 space-y-4">
                                  {/* Delay Configuration */}
                                  <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                      Retraso antes de ejecutar
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                      <Input
                                        type="number"
                                        value={action.delayMinutes || 0}
                                        onChange={(e) =>
                                          updateAction(action.id, {
                                            delayMinutes:
                                              parseInt(e.target.value) || 0,
                                          })
                                        }
                                        placeholder="Minutos"
                                      />
                                      <select
                                        value={
                                          (action.delayMinutes || 0) >= 1440
                                            ? "days"
                                            : (action.delayMinutes || 0) >= 60
                                              ? "hours"
                                              : "minutes"
                                        }
                                        onChange={(e) => {
                                          const unit = e.target.value;
                                          let multiplier = 1;
                                          if (unit === "hours") multiplier = 60;
                                          if (unit === "days")
                                            multiplier = 1440;

                                          const currentValue =
                                            action.delayMinutes || 0;
                                          let newValue = currentValue;

                                          if (
                                            unit === "minutes" &&
                                            currentValue >= 60
                                          ) {
                                            newValue = Math.floor(
                                              currentValue /
                                                (currentValue >= 1440
                                                  ? 1440
                                                  : 60)
                                            );
                                          } else if (
                                            unit === "hours" &&
                                            currentValue !==
                                              Math.floor(currentValue / 60) * 60
                                          ) {
                                            newValue = Math.floor(
                                              currentValue / 60
                                            );
                                          } else if (
                                            unit === "days" &&
                                            currentValue !==
                                              Math.floor(currentValue / 1440) *
                                                1440
                                          ) {
                                            newValue = Math.floor(
                                              currentValue / 1440
                                            );
                                          }

                                          updateAction(action.id, {
                                            delayMinutes: newValue * multiplier,
                                          });
                                        }}
                                        className="input-glass"
                                      >
                                        <option value="minutes">Minutos</option>
                                        <option value="hours">Horas</option>
                                        <option value="days">Días</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Action-specific fields */}
                                  {actionConfig.fields.map((field) => (
                                    <div key={field.name}>
                                      <label className="block text-sm font-medium text-white/80 mb-2">
                                        {field.label}
                                        {field.required && (
                                          <span className="text-red-400 ml-1">
                                            *
                                          </span>
                                        )}
                                      </label>
                                      {renderActionField(action, field)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Add Action Modal */}
        {showAddAction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Seleccionar Tipo de Acción</CardTitle>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setShowAddAction(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {actionTypes.map((actionType) => {
                    const Icon = actionType.icon;
                    return (
                      <button
                        key={actionType.type}
                        onClick={() => addAction(actionType.type)}
                        className="p-4 glass rounded-lg hover:bg-white/10 transition-all text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={clsx("p-2 rounded-lg", actionType.bg)}
                          >
                            <Icon
                              className={clsx("w-5 h-5", actionType.color)}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white group-hover:text-primary-300 transition-colors">
                              {actionType.label}
                            </p>
                            <p className="text-sm text-white/60 mt-1">
                              {actionType.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
