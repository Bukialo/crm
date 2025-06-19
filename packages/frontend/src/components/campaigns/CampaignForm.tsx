import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Mail, Users, Calendar, Sparkles, Send, Save } from "lucide-react";
import { Campaign, CreateCampaignDto } from "../../services/campaign.service";
import { SegmentBuilder } from "./SegmentBuilder";
import { useEmailTemplates } from "../../hooks/useEmails";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";

const campaignSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
  type: z.enum(["EMAIL", "SMS", "WHATSAPP"]),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres"),
  templateId: z.string().optional(),
  useAiPersonalization: z.boolean().optional(),
  scheduledDate: z.coerce.date().optional(),
  timezone: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  campaign?: Campaign | null;
  onSubmit: (data: CreateCampaignDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CampaignForm = ({
  campaign,
  onSubmit,
  onCancel,
  isLoading,
}: CampaignFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [targetCriteria, setTargetCriteria] = useState(
    campaign?.targetCriteria || {}
  );
  const [estimatedRecipients, setEstimatedRecipients] = useState(0);
  const [submitType, setSubmitType] = useState<"draft" | "schedule" | "send">(
    "draft"
  );

  const { data: templates } = useEmailTemplates();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: campaign?.name || "",
      subject: campaign?.subject || "",
      type: campaign?.type || "EMAIL",
      content: campaign?.content || "",
      templateId: campaign?.templateId || "",
      useAiPersonalization: campaign?.useAiPersonalization || false,
      scheduledDate: campaign?.scheduledDate
        ? new Date(campaign.scheduledDate)
        : undefined,
      timezone: campaign?.timezone || "America/Argentina/Buenos_Aires",
    },
  });

  const selectedTemplateId = watch("templateId");
  const useAiPersonalization = watch("useAiPersonalization");

  // Load template content when template is selected
  useEffect(() => {
    if (selectedTemplateId && templates) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template) {
        setValue("subject", template.subject);
        setValue("content", template.htmlContent);
      }
    }
  }, [selectedTemplateId, templates, setValue]);

  const handleFormSubmit = async (data: CampaignFormData) => {
    const formattedData: CreateCampaignDto = {
      ...data,
      targetCriteria,
      recipientCount: estimatedRecipients,
      status:
        submitType === "draft"
          ? "DRAFT"
          : submitType === "schedule"
            ? "SCHEDULED"
            : "SENDING",
    };

    await onSubmit(formattedData);
  };

  const steps = [
    { id: 1, title: "Información Básica", icon: Mail },
    { id: 2, title: "Audiencia", icon: Users },
    { id: 3, title: "Contenido", icon: Mail },
    { id: 4, title: "Programación", icon: Calendar },
  ];

  const currentStepData = steps.find((step) => step.id === currentStep);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {campaign ? "Editar Campaña" : "Nueva Campaña"}
            </h2>
            <p className="text-white/60 mt-1">
              Paso {currentStep} de {steps.length}: {currentStepData?.title}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex items-center ${step.id < steps.length ? "flex-1" : ""}`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                      isActive
                        ? "bg-primary-500 text-white"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "glass text-white/60"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      isActive ? "text-white" : "text-white/60"
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.id < steps.length && (
                    <div
                      className={`flex-1 h-0.5 ml-4 transition-all ${
                        isCompleted ? "bg-green-500" : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Información Básica
                </h3>
                <div className="space-y-4">
                  <Input
                    {...register("name")}
                    label="Nombre de la Campaña"
                    placeholder="Ej: Promoción Verano 2025"
                    error={errors.name?.message}
                  />

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Tipo de Campaña
                    </label>
                    <select
                      {...register("type")}
                      className="input-glass w-full"
                    >
                      <option value="EMAIL">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="WHATSAPP">WhatsApp</option>
                    </select>
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <Input
                    {...register("subject")}
                    label="Asunto del Email"
                    placeholder="Ej: Ofertas especiales de verano - Hasta 30% de descuento"
                    error={errors.subject?.message}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Audience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Seleccionar Audiencia
                </h3>
                <SegmentBuilder
                  criteria={targetCriteria}
                  onChange={setTargetCriteria}
                  onEstimateChange={setEstimatedRecipients}
                />
              </div>
            </div>
          )}

          {/* Step 3: Content */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Contenido de la Campaña
                </h3>

                {/* Template Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Plantilla (Opcional)
                  </label>
                  <select
                    {...register("templateId")}
                    className="input-glass w-full"
                  >
                    <option value="">Crear desde cero</option>
                    {templates?.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AI Personalization */}
                <div className="mb-6 p-4 glass rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      {...register("useAiPersonalization")}
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                    />
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary-400" />
                      <label className="text-sm font-medium text-white">
                        Personalización con IA
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-white/60 mt-2 ml-7">
                    La IA personalizará el contenido para cada destinatario
                    basándose en sus preferencias y historial.
                  </p>
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Contenido del Email
                  </label>
                  <textarea
                    {...register("content")}
                    className="w-full h-64 input-glass resize-none"
                    placeholder="Escribe el contenido de tu email aquí..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.content.message}
                    </p>
                  )}
                </div>

                {/* Content Preview */}
                {useAiPersonalization && (
                  <div className="p-4 glass rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-400" />
                      Vista Previa con IA
                    </h4>
                    <p className="text-xs text-white/60">
                      El contenido será personalizado automáticamente para cada
                      destinatario usando variables como:
                      {"{firstName}"}, {"{destination}"}, {"{lastTrip}"}, etc.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Scheduling */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Programación y Envío
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Fecha y Hora de Envío
                    </label>
                    <input
                      {...register("scheduledDate")}
                      type="datetime-local"
                      className="input-glass w-full"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-xs text-white/60 mt-1">
                      Deja vacío para enviar inmediatamente
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Zona Horaria
                    </label>
                    <select
                      {...register("timezone")}
                      className="input-glass w-full"
                    >
                      <option value="America/Argentina/Buenos_Aires">
                        Buenos Aires (GMT-3)
                      </option>
                      <option value="America/New_York">
                        Nueva York (GMT-5)
                      </option>
                      <option value="Europe/Madrid">Madrid (GMT+1)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                    </select>
                  </div>
                </div>

                {/* Campaign Summary */}
                <div className="mt-6 p-6 glass rounded-lg">
                  <h4 className="text-lg font-medium text-white mb-4">
                    Resumen de la Campaña
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Destinatarios:</span>
                      <span className="text-white ml-2 font-medium">
                        {estimatedRecipients} contactos
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Tipo:</span>
                      <span className="text-white ml-2 font-medium">
                        {watch("type")}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Personalización IA:</span>
                      <span className="text-white ml-2 font-medium">
                        {useAiPersonalization ? "Activada" : "Desactivada"}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Programación:</span>
                      <span className="text-white ml-2 font-medium">
                        {watch("scheduledDate") ? "Programada" : "Inmediata"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="glass"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="glass" onClick={onCancel}>
                Cancelar
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Siguiente
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="glass"
                    isLoading={isLoading && submitType === "draft"}
                    leftIcon={<Save className="w-4 h-4" />}
                    onClick={() => setSubmitType("draft")}
                  >
                    Guardar Borrador
                  </Button>

                  {watch("scheduledDate") ? (
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading && submitType === "schedule"}
                      leftIcon={<Calendar className="w-4 h-4" />}
                      onClick={() => setSubmitType("schedule")}
                    >
                      Programar
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading && submitType === "send"}
                      leftIcon={<Send className="w-4 h-4" />}
                      onClick={() => setSubmitType("send")}
                    >
                      Enviar Ahora
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
