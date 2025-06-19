import { useState, useEffect } from "react";
import { Settings, Plus, X } from "lucide-react";
import {
  AutomationTriggerType,
  TriggerTemplate,
} from "../../services/automation.service";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface TriggerBuilderProps {
  triggerType: AutomationTriggerType;
  conditions: Record<string, any>;
  onChange: (conditions: Record<string, any>) => void;
  templates?: TriggerTemplate[];
}

export const TriggerBuilder = ({
  triggerType,
  conditions,
  onChange,
  templates,
}: TriggerBuilderProps) => {
  const [localConditions, setLocalConditions] = useState(conditions || {});

  const template = templates?.find((t) => t.type === triggerType);

  useEffect(() => {
    setLocalConditions(conditions || {});
  }, [conditions]);

  const handleConditionChange = (field: string, value: any) => {
    const newConditions = {
      ...localConditions,
      [field]: value,
    };
    setLocalConditions(newConditions);
    onChange(newConditions);
  };

  const handleRemoveCondition = (field: string) => {
    const newConditions = { ...localConditions };
    delete newConditions[field];
    setLocalConditions(newConditions);
    onChange(newConditions);
  };

  const handleAddCustomCondition = () => {
    const field = prompt("Nombre del campo:");
    if (field && !localConditions[field]) {
      handleConditionChange(field, "");
    }
  };

  const renderConditionField = (condition: any, value: any) => {
    switch (condition.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) =>
              handleConditionChange(condition.field, e.target.value)
            }
            placeholder={`Ingresa ${condition.label.toLowerCase()}`}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value || condition.default || ""}
            onChange={(e) =>
              handleConditionChange(condition.field, Number(e.target.value))
            }
            placeholder={`Ingresa ${condition.label.toLowerCase()}`}
          />
        );

      case "select":
        return (
          <select
            className="input-glass w-full"
            value={value || condition.default || ""}
            onChange={(e) =>
              handleConditionChange(condition.field, e.target.value)
            }
          >
            <option value="">
              Seleccionar {condition.label.toLowerCase()}
            </option>
            {condition.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) =>
              handleConditionChange(condition.field, e.target.value)
            }
          />
        );

      case "array":
        return (
          <div className="space-y-2">
            <Input
              value={Array.isArray(value) ? value.join(", ") : value || ""}
              onChange={(e) => {
                const arrayValue = e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean);
                handleConditionChange(condition.field, arrayValue);
              }}
              placeholder="Separar con comas"
            />
            <p className="text-xs text-white/60">
              Separar múltiples valores con comas
            </p>
          </div>
        );

      default:
        return (
          <Input
            value={value || ""}
            onChange={(e) =>
              handleConditionChange(condition.field, e.target.value)
            }
            placeholder={`Ingresa ${condition.label.toLowerCase()}`}
          />
        );
    }
  };

  if (!template) {
    return (
      <div className="text-center py-8">
        <Settings className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/60">
          No se encontró configuración para este tipo de trigger
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">
          Configurar Condiciones - {template.name}
        </h3>
        <p className="text-white/60 mb-6">{template.description}</p>
      </div>

      {/* Template Conditions */}
      <div className="space-y-4">
        {template.conditions.map((condition) => (
          <div key={condition.field} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-white/80">
                {condition.label}
                {condition.required && (
                  <span className="text-red-400 ml-1">*</span>
                )}
              </label>
              {!condition.required && (
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(condition.field)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {renderConditionField(condition, localConditions[condition.field])}
          </div>
        ))}
      </div>

      {/* Custom Conditions */}
      {Object.keys(localConditions).some(
        (key) => !template.conditions.find((c) => c.field === key)
      ) && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-white">
            Condiciones Personalizadas
          </h4>
          {Object.entries(localConditions)
            .filter(
              ([key]) => !template.conditions.find((c) => c.field === key)
            )
            .map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-white/80">
                    {key}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(key)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  value={value || ""}
                  onChange={(e) => handleConditionChange(key, e.target.value)}
                  placeholder={`Valor para ${key}`}
                />
              </div>
            ))}
        </div>
      )}

      {/* Add Custom Condition */}
      <div className="pt-4 border-t border-white/10">
        <Button
          type="button"
          variant="glass"
          onClick={handleAddCustomCondition}
          leftIcon={<Plus className="w-4 h-4" />}
          size="sm"
        >
          Agregar Condición Personalizada
        </Button>
      </div>

      {/* Examples/Help */}
      <div className="p-4 glass rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">
          💡 Ejemplos de uso:
        </h4>
        <div className="space-y-1 text-sm text-white/60">
          {triggerType === "CONTACT_CREATED" && (
            <>
              <p>• Solo contactos de Facebook: source = "SOCIAL_MEDIA"</p>
              <p>• Contactos VIP: budgetRange = "LUXURY"</p>
              <p>• Nuevos interesados: status = "INTERESADO"</p>
            </>
          )}
          {triggerType === "NO_ACTIVITY_30_DAYS" && (
            <>
              <p>• Sin actividad por 1 mes: days = 30</p>
              <p>• Solo contactos interesados: status = "INTERESADO"</p>
              <p>• Excluir VIPs: excludeTags = ["VIP"]</p>
            </>
          )}
          {triggerType === "PAYMENT_OVERDUE" && (
            <>
              <p>• Pagos vencidos por 1 día: daysOverdue = 1</p>
              <p>• Solo montos altos: minAmount = 1000</p>
            </>
          )}
          {triggerType === "BIRTHDAY" && (
            <>
              <p>• El día del cumpleaños: daysBefore = 0</p>
              <p>• Una semana antes: daysBefore = 7</p>
              <p>• Solo clientes activos: status = "CLIENTE"</p>
            </>
          )}
        </div>
      </div>

      {/* Preview */}
      {Object.keys(localConditions).length > 0 && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-sm font-medium text-blue-300 mb-2">
            Vista previa de condiciones:
          </h4>
          <pre className="text-xs text-blue-200 overflow-x-auto">
            {JSON.stringify(localConditions, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
