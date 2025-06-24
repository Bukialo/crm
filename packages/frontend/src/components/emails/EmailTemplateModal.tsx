// src/components/emails/EmailTemplateModal.tsx
import React, { useState } from "react";
import { X, Mail, Eye, Code, Type } from "lucide-react";

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (templateData: any) => Promise<void>;
  template?: any; // Para edición
}

export const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  template,
}) => {
  const [formData, setFormData] = useState({
    name: template?.name || "",
    subject: template?.subject || "",
    category: template?.category || "WELCOME",
    htmlContent: template?.htmlContent || "",
    textContent: template?.textContent || "",
  });
  const [activeTab, setActiveTab] = useState<"content" | "preview">("content");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    {
      value: "WELCOME",
      label: "Bienvenida",
      description: "Para nuevos leads y contactos",
    },
    {
      value: "QUOTE",
      label: "Cotización",
      description: "Para enviar cotizaciones de viajes",
    },
    {
      value: "FOLLOW_UP",
      label: "Seguimiento",
      description: "Para seguimiento comercial",
    },
    {
      value: "POST_TRIP",
      label: "Post-Viaje",
      description: "Para feedback después del viaje",
    },
    {
      value: "SEASONAL",
      label: "Estacional",
      description: "Para ofertas y promociones",
    },
  ];

  const defaultTemplate = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">¡Hola {{firstName}}!</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Tu próximo viaje te espera</p>
  </div>
  
  <div style="padding: 30px 20px; background: white;">
    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      Escribe aquí el contenido de tu email...
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Botón de Acción
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; text-align: center;">
      ¿Tienes alguna pregunta? Responde a este email o llámanos al {{companyPhone}}
    </p>
  </div>
</div>
  `.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.name.trim()) {
        throw new Error("El nombre del template es requerido");
      }
      if (!formData.subject.trim()) {
        throw new Error("El asunto es requerido");
      }
      if (!formData.htmlContent.trim()) {
        throw new Error("El contenido HTML es requerido");
      }

      // Preparar datos del template
      const templateData = {
        name: formData.name.trim(),
        subject: formData.subject.trim(),
        category: formData.category,
        htmlContent: formData.htmlContent.trim(),
        textContent:
          formData.textContent.trim() ||
          extractTextFromHtml(formData.htmlContent),
        variables: extractVariables(
          formData.htmlContent + " " + formData.subject
        ),
      };

      await onSubmit(templateData);

      // Reset form si no es edición
      if (!template) {
        setFormData({
          name: "",
          subject: "",
          category: "WELCOME",
          htmlContent: "",
          textContent: "",
        });
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving template");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const insertTemplate = () => {
    setFormData((prev) => ({ ...prev, htmlContent: defaultTemplate }));
  };

  const insertVariable = (variable: string) => {
    const textarea = document.querySelector(
      "#htmlContent"
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variable}}}` + after;

      handleChange("htmlContent", newText);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variable.length + 4,
          start + variable.length + 4
        );
      }, 0);
    }
  };

  const extractTextFromHtml = (html: string): string => {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  };

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{(\s*\w+\s*)\}\}/g;
    const matches = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      const variable = match[1].trim();
      if (!matches.includes(variable)) {
        matches.push(variable);
      }
    }

    return matches;
  };

  const commonVariables = [
    "firstName",
    "lastName",
    "fullName",
    "email",
    "phone",
    "destination",
    "departureDate",
    "returnDate",
    "totalPrice",
    "companyName",
    "companyPhone",
    "companyEmail",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {template ? "Editar Template" : "Nuevo Template de Email"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Crea un template reutilizable para tus campañas
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

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {error && (
            <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Form */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Información Básica
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre del Template *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Ej: Bienvenida Nuevos Clientes"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Asunto *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      placeholder="¡Bienvenido {{firstName}}!"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoría
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {
                        categories.find((c) => c.value === formData.category)
                          ?.description
                      }
                    </p>
                  </div>
                </div>

                {/* Variables disponibles */}
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Variables Disponibles
                  </h4>
                  <p className="text-xs text-gray-500">
                    Haz clic para insertar en el contenido
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {commonVariables.map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => insertVariable(variable)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template base */}
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Template Base
                  </h4>
                  <button
                    type="button"
                    onClick={insertTemplate}
                    className="w-full px-3 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors text-sm"
                  >
                    Insertar Template Base
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab("content")}
                    className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === "content"
                        ? "border-purple-500 text-purple-600 dark:text-purple-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    Contenido HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === "preview"
                        ? "border-purple-500 text-purple-600 dark:text-purple-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Vista Previa
                  </button>
                </nav>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6 overflow-hidden">
                {activeTab === "content" ? (
                  <div className="h-full flex flex-col space-y-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contenido HTML *
                      </label>
                      <textarea
                        id="htmlContent"
                        value={formData.htmlContent}
                        onChange={(e) =>
                          handleChange("htmlContent", e.target.value)
                        }
                        placeholder="Escribe el HTML de tu email aquí..."
                        className="w-full h-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contenido de Texto (opcional)
                      </label>
                      <textarea
                        value={formData.textContent}
                        onChange={(e) =>
                          handleChange("textContent", e.target.value)
                        }
                        placeholder="Versión de texto plano (se genera automáticamente si se deja vacío)"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vista Previa del Email
                    </label>
                    <div className="h-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-auto bg-white">
                      <div
                        className="p-4"
                        dangerouslySetInnerHTML={{
                          __html:
                            formData.htmlContent ||
                            '<p class="text-gray-500">Escribe contenido HTML para ver la vista previa</p>',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
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
                <Type className="w-4 h-4" />
              )}
              {loading
                ? "Guardando..."
                : template
                  ? "Actualizar Template"
                  : "Crear Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
