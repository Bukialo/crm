// src/components/emails/CreateCampaignModal.tsx
import React, { useState } from "react";
import { X, Mail, Users, Calendar, Send } from "lucide-react";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (campaignData: any) => Promise<void>;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    templateId: "",
    recipients: "all",
    customRecipients: "",
    scheduledDate: "",
    scheduledTime: "",
    sendNow: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock templates para el selector
  const mockTemplates = [
    { id: "1", name: "Bienvenida - Nuevo Lead", category: "WELCOME" },
    { id: "2", name: "Cotización de Viaje", category: "QUOTE" },
    { id: "3", name: "Seguimiento Post-Viaje", category: "POST_TRIP" },
    { id: "4", name: "Oferta Estacional", category: "SEASONAL" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.name.trim()) {
        throw new Error("El nombre de la campaña es requerido");
      }
      if (!formData.subject.trim()) {
        throw new Error("El asunto es requerido");
      }
      if (!formData.templateId) {
        throw new Error("Debes seleccionar un template");
      }

      // Preparar datos de la campaña
      const campaignData = {
        name: formData.name.trim(),
        subject: formData.subject.trim(),
        templateId: formData.templateId,
        recipients:
          formData.recipients === "custom"
            ? formData.customRecipients
                .split(",")
                .map((email) => email.trim())
                .filter(Boolean)
            : [], // Se calculará en el backend según el filtro
        status: formData.sendNow ? "SENDING" : "SCHEDULED",
        scheduledDate:
          !formData.sendNow && formData.scheduledDate && formData.scheduledTime
            ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
            : undefined,
      };

      await onSubmit(campaignData);

      // Reset form
      setFormData({
        name: "",
        subject: "",
        templateId: "",
        recipients: "all",
        customRecipients: "",
        scheduledDate: "",
        scheduledTime: "",
        sendNow: true,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Nueva Campaña de Email
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Crea y programa tu campaña de marketing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Información de la Campaña
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la Campaña *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ej: Promoción Verano 2025"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asunto del Email *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="Ej: ¡Ofertas especiales de verano!"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template de Email *
              </label>
              <select
                value={formData.templateId}
                onChange={(e) => handleChange("templateId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Selecciona un template</option>
                {mockTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destinatarios */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Destinatarios
            </h3>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipients"
                  value="all"
                  checked={formData.recipients === "all"}
                  onChange={(e) => handleChange("recipients", e.target.value)}
                  className="mr-3 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    Todos los contactos
                  </span>
                  <span className="text-sm text-gray-500">
                    (~1,250 contactos)
                  </span>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipients"
                  value="interesados"
                  checked={formData.recipients === "interesados"}
                  onChange={(e) => handleChange("recipients", e.target.value)}
                  className="mr-3 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-900 dark:text-white">
                    Solo Interesados
                  </span>
                  <span className="text-sm text-gray-500">
                    (~450 contactos)
                  </span>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipients"
                  value="clientes"
                  checked={formData.recipients === "clientes"}
                  onChange={(e) => handleChange("recipients", e.target.value)}
                  className="mr-3 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-gray-900 dark:text-white">
                    Solo Clientes
                  </span>
                  <span className="text-sm text-gray-500">
                    (~320 contactos)
                  </span>
                </div>
              </label>

              <label className="flex items-start">
                <input
                  type="radio"
                  name="recipients"
                  value="custom"
                  checked={formData.recipients === "custom"}
                  onChange={(e) => handleChange("recipients", e.target.value)}
                  className="mr-3 mt-1 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <span className="text-gray-900 dark:text-white">
                    Lista personalizada
                  </span>
                  {formData.recipients === "custom" && (
                    <textarea
                      value={formData.customRecipients}
                      onChange={(e) =>
                        handleChange("customRecipients", e.target.value)
                      }
                      placeholder="email1@example.com, email2@example.com, ..."
                      rows={3}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Programación */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Programación
            </h3>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sendTiming"
                  checked={formData.sendNow}
                  onChange={() => handleChange("sendNow", true)}
                  className="mr-3 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-green-400" />
                  <span className="text-gray-900 dark:text-white">
                    Enviar ahora
                  </span>
                </div>
              </label>

              <label className="flex items-start">
                <input
                  type="radio"
                  name="sendTiming"
                  checked={!formData.sendNow}
                  onChange={() => handleChange("sendNow", false)}
                  className="mr-3 mt-1 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-900 dark:text-white">
                      Programar para más tarde
                    </span>
                  </div>

                  {!formData.sendNow && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Fecha
                        </label>
                        <input
                          type="date"
                          value={formData.scheduledDate}
                          onChange={(e) =>
                            handleChange("scheduledDate", e.target.value)
                          }
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Hora
                        </label>
                        <input
                          type="time"
                          value={formData.scheduledTime}
                          onChange={(e) =>
                            handleChange("scheduledTime", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {loading
                ? "Creando..."
                : formData.sendNow
                  ? "Crear y Enviar"
                  : "Crear Campaña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
