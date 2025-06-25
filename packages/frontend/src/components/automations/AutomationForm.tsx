import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Plus,
  ChevronRight,
  ChevronLeft,
  Zap,
  Settings,
} from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { TriggerBuilder } from "./TriggerBuilder";
import {
  Automation,
  CreateAutomationDto,
  AutomationTriggerType,
  AutomationActionType,
} from "../../services/automation.service";
// ✅ CORREGIDO: Importación corregida
import {
  useTriggerTemplates,
  useActionTemplates,
} from "../../hooks/useAutomations";

const automationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  description: z.string().max(1000).optional(),
  triggerType: z.string().min(1, "El tipo de trigger es requerido"),
  triggerConditions: z.record(z.any()),
  actions: z
    .array(
      z.object({
        type: z.string().min(1, "El tipo de acción es requerido"),
        parameters: z.record(z.any()),
        delayMinutes: z.number().min(0).optional().default(0),
        order: z.number().int().min(1),
      })
    )
    .min(1, "Al menos una acción es requerida"),
});

type AutomationFormData = z.infer<typeof automationSchema>;

interface AutomationFormProps {
  automation?: Automation | null;
  onSubmit: (data: CreateAutomationDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AutomationForm = ({
  automation,
  onSubmit,
  onCancel,
  isLoading,
}: AutomationFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTrigger, setSelectedTrigger] =
    useState<AutomationTriggerType | null>(null);

  const { data: triggerTemplates } = useTriggerTemplates();
  const { data: actionTemplates } = useActionTemplates();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AutomationFormData>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      name: automation?.name || "",
      description: automation?.description || "",
      triggerType: automation?.trigger?.type || "",
      triggerConditions: automation?.trigger?.conditions || {},
      actions:
        automation?.actions?.map((action, index) => ({
          type: action.type,
          parameters: action.parameters,
          delayMinutes: action.delay || 0,
          order: index + 1,
        })) || [],
    },
  });

  const {
    fields: actionFields,
    append: addAction,
    remove: removeAction,
  } = useFieldArray({
    control,
    name: "actions",
  });

  const watchedTriggerType = watch("triggerType");
  // ✅ CORREGIDO: Variable removida que no se usaba
  // const watchedActions = watch("actions");

  useEffect(() => {
    if (watchedTriggerType) {
      setSelectedTrigger(watchedTriggerType as AutomationTriggerType);
    }
  }, [watchedTriggerType]);

  const handleFormSubmit = async (data: AutomationFormData) => {
    try {
      // ✅ CORREGIDO: Estructura correcta para CreateAutomationDto
      const automationData: CreateAutomationDto = {
        name: data.name,
        description: data.description,
        trigger: {
          type: data.triggerType as AutomationTriggerType,
          conditions: data.triggerConditions,
        },
        actions: data.actions.map((action) => ({
          type: action.type as AutomationActionType,
          parameters: action.parameters,
          delay: action.delayMinutes,
        })),
        isActive: true,
      };

      await onSubmit(automationData);
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const nextStep = () => {
    setCurrentStep(Math.min(currentStep + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const canProceedToStep = (step: number) => {
    const values = getValues();

    switch (step) {
      case 2:
        return values.name && values.triggerType;
      case 3:
        return (
          values.triggerConditions &&
          Object.keys(values.triggerConditions).length > 0
        );
      case 4:
        return values.actions && values.actions.length > 0;
      default:
        return true;
    }
  };

  const handleAddAction = () => {
    const newOrder = actionFields.length + 1;
    addAction({
      type: "",
      parameters: {},
      delayMinutes: 0,
      order: newOrder,
    });
  };

  const steps = [
    { number: 1, title: "Información Básica", icon: Settings },
    { number: 2, title: "Trigger", icon: Zap },
    { number: 3, title: "Condiciones", icon: Settings },
    { number: 4, title: "Acciones", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle>
              {automation ? "Editar Automatización" : "Nueva Automatización"}
            </CardTitle>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-medium
                    ${
                      currentStep >= step.number
                        ? "bg-primary-500 text-white"
                        : "glass text-white/60"
                    }
                  `}
                >
                  {step.number}
                </div>
                <div className="ml-3 hidden md:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? "text-white"
                        : "text-white/60"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-white/30 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <CardContent className="p-6">
            {/* Step 1: Información Básica */}
            {currentStep === 1 && (
              <div className="space-y-6 fade-in">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">
                    Información Básica
                  </h3>
                  <div className="space-y-4">
                    <Input
                      {...register("name")}
                      label="Nombre de la automatización"
                      placeholder="Ej: Bienvenida a nuevos contactos"
                      error={errors.name?.message}
                    />

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Descripción (opcional)
                      </label>
                      <textarea
                        {...register("description")}
                        placeholder="Describe qué hace esta automatización..."
                        className="input-glass w-full h-24 resize-none"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Trigger Selection */}
            {currentStep === 2 && (
              <div className="space-y-6 fade-in">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">
                    ¿Cuándo se debe ejecutar?
                  </h3>
                  <p className="text-white/60 mb-6">
                    Selecciona el evento que activará esta automatización
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {triggerTemplates?.map((template) => {
                      const isSelected = watchedTriggerType === template.type;
                      return (
                        <div
                          key={template.type}
                          className={`
                            p-4 rounded-lg border cursor-pointer transition-all
                            ${
                              isSelected
                                ? "border-primary-500/50 bg-primary-500/10"
                                : "border-white/20 hover:border-white/40 glass"
                            }
                          `}
                          onClick={() => setValue("triggerType", template.type)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`
                              w-10 h-10 rounded-lg flex items-center justify-center
                              ${isSelected ? "bg-primary-500/20" : "bg-white/10"}
                            `}
                            >
                              <span className="text-xl">{template.icon}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-white">
                                {template.name}
                              </h4>
                              <p className="text-sm text-white/60 mt-1">
                                {template.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {errors.triggerType && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.triggerType.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Trigger Conditions */}
            {currentStep === 3 && selectedTrigger && (
              <div className="space-y-6 fade-in">
                <TriggerBuilder
                  triggerType={selectedTrigger}
                  conditions={watch("triggerConditions")}
                  onChange={(conditions) =>
                    setValue("triggerConditions", conditions)
                  }
                  templates={triggerTemplates}
                />
              </div>
            )}

            {/* Step 4: Actions */}
            {currentStep === 4 && (
              <div className="space-y-6 fade-in">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">
                    ¿Qué acciones ejecutar?
                  </h3>
                  <p className="text-white/60 mb-6">
                    Define las acciones que se ejecutarán cuando se active el
                    trigger
                  </p>

                  <div className="space-y-4">
                    {actionFields.map((field, index) => (
                      <div key={field.id} className="p-4 glass rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-white">
                            Acción {index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => removeAction(index)}
                            disabled={actionFields.length === 1}
                          >
                            Eliminar
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                              Tipo de Acción
                            </label>
                            <select
                              {...register(`actions.${index}.type`)}
                              className="input-glass w-full"
                            >
                              <option value="">Seleccionar acción</option>
                              {actionTemplates?.map((template) => (
                                <option
                                  key={template.type}
                                  value={template.type}
                                >
                                  {template.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                              Retraso (minutos)
                            </label>
                            <Input
                              {...register(`actions.${index}.delayMinutes`, {
                                valueAsNumber: true,
                              })}
                              type="number"
                              min="0"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="glass"
                      onClick={handleAddAction}
                      leftIcon={<Plus className="w-4 h-4" />}
                      className="w-full"
                    >
                      Agregar Acción
                    </Button>
                  </div>

                  {errors.actions && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.actions.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="glass"
                  onClick={prevStep}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="glass"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={nextStep}
                  disabled={!canProceedToStep(currentStep + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  leftIcon={<Zap className="w-4 h-4" />}
                >
                  {automation ? "Actualizar" : "Crear"} Automatización
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
