import React, { useState, useEffect } from "react";
import { Save, Eye, Sparkles, X } from "lucide-react";
import { EmailTemplate } from "../../services/email.service";
import { EmailTemplateHelper } from "../../utils/emailTemplateHelper";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface EmailEditorProps {
  template?: EmailTemplate | null;
  onSave: (template: Partial<EmailTemplate>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EmailEditor: React.FC<EmailEditorProps> = ({
  template,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    htmlContent: "",
    category: "WELCOME" as const,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [availableVariables, setAvailableVariables] = useState<any[]>([]);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        category: template.category,
      });
    }

    // Load available variables
    const variables = EmailTemplateHelper.getAllVariables();
    setAvailableVariables(variables);
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const templateData: Partial<EmailTemplate> = {
      name: formData.name,
      subject: formData.subject,
      htmlContent: formData.htmlContent,
      category: formData.category,
      variables: EmailTemplateHelper.extractVariables(
        formData.subject + " " + formData.htmlContent
      ),
      updatedAt: new Date(),
      ...(template ? {} : { createdAt: new Date() }),
    };

    await onSave(templateData);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById(
      "htmlContent"
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.htmlContent;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variable}}}` + after;

      setFormData((prev) => ({ ...prev, htmlContent: newText }));

      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variable.length + 4,
          start + variable.length + 4
        );
      }, 0);
    }
  };

  const getPreviewContent = () => {
    return EmailTemplateHelper.generatePreview(formData.htmlContent);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {template ? "Editar Template" : "Nuevo Template de Email"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              {showPreview ? "Editor" : "Vista Previa"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showPreview ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Editor */}
                <div className="lg:col-span-3 space-y-6">
                  <Input
                    label="Nombre del Template"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Ej: Bienvenida - Nuevo Lead"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Categoría
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value as any,
                        }))
                      }
                      className="input-glass w-full"
                    >
                      <option value="WELCOME">Bienvenida</option>
                      <option value="QUOTE">Cotización</option>
                      <option value="FOLLOW_UP">Seguimiento</option>
                      <option value="SEASONAL">Estacional</option>
                      <option value="POST_TRIP">Post-Viaje</option>
                    </select>
                  </div>

                  <Input
                    label="Asunto del Email"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Ej: ¡Bienvenido {{firstName}}! Tu próximo viaje te espera"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Contenido HTML
                    </label>
                    <textarea
                      id="htmlContent"
                      value={formData.htmlContent}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          htmlContent: e.target.value,
                        }))
                      }
                      className="w-full h-96 input-glass resize-none font-mono text-sm"
                      placeholder="Escribe tu template HTML aquí..."
                      required
                    />
                  </div>
                </div>

                {/* Variables Sidebar */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Variables Disponibles
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Haz clic en una variable para insertarla en el contenido
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Contacto</h4>
                        <div className="grid grid-cols-1 gap-1">
                          {EmailTemplateHelper.getContactVariables().map(
                            (v) => (
                              <button
                                key={v.key}
                                type="button"
                                onClick={() => insertVariable(v.key)}
                                className="text-left px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                              >
                                {v.key}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Viaje</h4>
                        <div className="grid grid-cols-1 gap-1">
                          {EmailTemplateHelper.getTripVariables().map((v) => (
                            <button
                              key={v.key}
                              type="button"
                              onClick={() => insertVariable(v.key)}
                              className="text-left px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                            >
                              {v.key}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Promociones
                        </h4>
                        <div className="grid grid-cols-1 gap-1">
                          {EmailTemplateHelper.getPromotionVariables().map(
                            (v) => (
                              <button
                                key={v.key}
                                type="button"
                                onClick={() => insertVariable(v.key)}
                                className="text-left px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors"
                              >
                                {v.key}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Empresa</h4>
                        <div className="grid grid-cols-1 gap-1">
                          {EmailTemplateHelper.getCompanyVariables().map(
                            (v) => (
                              <button
                                key={v.key}
                                type="button"
                                onClick={() => insertVariable(v.key)}
                                className="text-left px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
                              >
                                {v.key}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Consejo
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Usa variables como {`{{firstName}}`} para personalizar
                      automáticamente el contenido para cada destinatario.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Cancelar
                </Button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    leftIcon={<Eye className="w-4 h-4" />}
                  >
                    Vista Previa
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    {template ? "Actualizar" : "Guardar"} Template
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            /* Preview Mode */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Vista Previa del Template
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                  >
                    Volver al Editor
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Email Preview */}
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Vista Previa del Email
                  </h4>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 border-b border-gray-300 dark:border-gray-600">
                      <div className="text-sm">
                        <strong>Asunto:</strong>{" "}
                        {EmailTemplateHelper.generatePreview(formData.subject)}
                      </div>
                    </div>
                    <div
                      className="p-4 bg-white dark:bg-gray-900 min-h-[400px] overflow-auto"
                      dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                    />
                  </div>
                </div>

                {/* HTML Source */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Código HTML</h4>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-xs max-h-[500px] border border-gray-300 dark:border-gray-600">
                    <code>{formData.htmlContent}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
