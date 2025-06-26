import React, { useState, useEffect } from "react";
import { X, Send, Mail, User } from "lucide-react";
import { EmailTemplate } from "../../services/email.service";
import { EmailTemplateHelper } from "../../utils/emailTemplateHelper";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface SendEmailRequest {
  to: string;
  subject: string;
  htmlContent: string;
  templateId?: string;
}

interface SendEmailModalProps {
  template?: EmailTemplate | null;
  contactEmail?: string;
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: SendEmailRequest) => Promise<void>;
  isLoading?: boolean;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  template,
  contactEmail = "",
  isOpen,
  onClose,
  onSend,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    htmlContent: "",
    personalizeWithAI: false,
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData((prev) => ({
        ...prev,
        subject: template.subject,
        htmlContent: template.htmlContent,
      }));
    }

    if (contactEmail) {
      setFormData((prev) => ({ ...prev, to: contactEmail }));
    }
  }, [template, contactEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailData: SendEmailRequest = {
      to: formData.to,
      subject: formData.subject,
      htmlContent: formData.htmlContent,
      templateId: template?.id,
    };

    await onSend(emailData);
    onClose();
  };

  const getPreviewContent = () => {
    // Generate preview with sample data
    return EmailTemplateHelper.generatePreview(formData.htmlContent);
  };

  const getPreviewSubject = () => {
    return EmailTemplateHelper.generatePreview(formData.subject);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Enviar Email
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Editor" : "Vista Previa"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showPreview ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Destinatario"
                  type="email"
                  value={formData.to}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, to: e.target.value }))
                  }
                  placeholder="cliente@email.com"
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />

                {template && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Template
                    </label>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm font-medium">{template.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {template.category}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Asunto"
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="Asunto del email"
                required
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Contenido del Email
                </label>
                <textarea
                  value={formData.htmlContent}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      htmlContent: e.target.value,
                    }))
                  }
                  className="w-full h-64 input-glass resize-none font-mono text-sm"
                  placeholder="Contenido HTML del email..."
                  required
                />
              </div>

              {/* AI Personalization Option */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.personalizeWithAI}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        personalizeWithAI: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Personalizar con IA
                    </label>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      La IA personalizará automáticamente el contenido usando la
                      información del contacto
                    </p>
                  </div>
                </div>
              </div>

              {/* Variables Help */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium mb-2">
                  Variables Disponibles
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {EmailTemplateHelper.getContactVariables()
                    .slice(0, 6)
                    .map((variable) => (
                      <span
                        key={variable.key}
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                      >
                        {`{{${variable.key}}}`}
                      </span>
                    ))}
                  <span className="px-2 py-1 text-gray-500">...</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Usa estas variables para personalizar el contenido. Se
                  reemplazarán automáticamente con los datos del contacto.
                </p>
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                  >
                    Vista Previa
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Enviar Email
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            /* Preview Mode */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Vista Previa del Email</h3>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Volver al Editor
                </Button>
              </div>

              {/* Email Preview */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                {/* Email Header */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-300 dark:border-gray-600">
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Para:</strong> {formData.to}
                    </div>
                    <div>
                      <strong>Asunto:</strong> {getPreviewSubject()}
                    </div>
                  </div>
                </div>

                {/* Email Content */}
                <div
                  className="p-4 bg-white dark:bg-gray-900 min-h-[400px] overflow-auto"
                  dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                />
              </div>

              {/* Preview Actions */}
              <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                  >
                    Editar
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Enviar Email
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
