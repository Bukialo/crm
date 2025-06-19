import { useState, useEffect } from "react";
import { X, Send, Users, Calendar, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import { EmailTemplate, SendEmailRequest } from "../../services/email.service";
import { Contact } from "../../services/contacts.service";
import { ContactStatusBadge } from "../contacts/ContactStatusBadge";
import { EmailPreview } from "./EmailPreview";

const sendEmailSchema = z.object({
  recipients: z
    .array(z.string().email())
    .min(1, "Selecciona al menos un destinatario"),
  subject: z.string().min(1, "El asunto es requerido"),
  htmlContent: z.string().min(1, "El contenido es requerido"),
  scheduledAt: z.string().optional(),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
});

type SendEmailForm = z.infer<typeof sendEmailSchema>;

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (request: SendEmailRequest) => Promise<void>;
  template?: EmailTemplate;
  preselectedContacts?: Contact[];
  availableContacts: Contact[];
}

export const SendEmailModal = ({
  isOpen,
  onClose,
  onSend,
  template,
  preselectedContacts = [],
  availableContacts,
}: SendEmailModalProps) => {
  const [selectedContacts, setSelectedContacts] =
    useState<Contact[]>(preselectedContacts);
  const [showPreview, setShowPreview] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SendEmailForm>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      subject: template?.subject || "",
      htmlContent: template?.htmlContent || "",
      trackOpens: true,
      trackClicks: true,
    },
  });

  const watchedContent = watch("htmlContent");
  const watchedSubject = watch("subject");

  useEffect(() => {
    if (template) {
      setValue("subject", template.subject);
      setValue("htmlContent", template.htmlContent);
    }
  }, [template, setValue]);

  useEffect(() => {
    setValue(
      "recipients",
      selectedContacts.map((c) => c.email)
    );
  }, [selectedContacts, setValue]);

  if (!isOpen) return null;

  const handleContactToggle = (contact: Contact) => {
    setSelectedContacts((prev) => {
      const exists = prev.find((c) => c.id === contact.id);
      if (exists) {
        return prev.filter((c) => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedContacts(availableContacts);
  };

  const handleDeselectAll = () => {
    setSelectedContacts([]);
  };

  const onSubmit = async (data: SendEmailForm) => {
    setIsLoading(true);
    try {
      // Procesar contenido con variables
      let processedContent = data.htmlContent;
      let processedSubject = data.subject;

      if (template?.variables) {
        template.variables.forEach((variable) => {
          const value = variableValues[variable.name] || `{{${variable.name}}}`;
          const regex = new RegExp(`{{${variable.name}}}`, "g");
          processedContent = processedContent.replace(regex, String(value));
          processedSubject = processedSubject.replace(regex, String(value));
        });
      }

      const request: SendEmailRequest = {
        to: data.recipients,
        templateId: template?.id,
        subject: processedSubject,
        htmlContent: processedContent,
        scheduledAt: data.scheduledAt,
        trackOpens: data.trackOpens,
        trackClicks: data.trackClicks,
        variables: variableValues,
      };

      await onSend(request);
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Enviar Email</h2>
            <div className="flex gap-2">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setShowPreview(true)}
                leftIcon={<Eye className="w-4 h-4" />}
              >
                Vista Previa
              </Button>
              <Button
                variant="glass"
                size="sm"
                onClick={onClose}
                leftIcon={<X className="w-4 h-4" />}
              >
                Cancelar
              </Button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 flex overflow-hidden"
          >
            <div className="flex-1 flex overflow-hidden">
              {/* Recipients Sidebar */}
              <div className="w-80 border-r border-white/10 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">
                    Destinatarios ({selectedContacts.length})
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="glass"
                      onClick={handleSelectAll}
                    >
                      Todos
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="glass"
                      onClick={handleDeselectAll}
                    >
                      Ninguno
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {availableContacts.map((contact) => {
                    const isSelected = selectedContacts.find(
                      (c) => c.id === contact.id
                    );
                    return (
                      <div
                        key={contact.id}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary-500/20 border-primary-500/30"
                            : "glass border-white/10 hover:border-white/20"
                        }`}
                        onClick={() => handleContactToggle(contact)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">
                              {contact.firstName} {contact.lastName}
                            </p>
                            <p className="text-sm text-white/60">
                              {contact.email}
                            </p>
                          </div>
                          <ContactStatusBadge
                            status={contact.status}
                            size="sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {errors.recipients && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.recipients.message}
                  </p>
                )}
              </div>

              {/* Email Content */}
              <div className="flex-1 flex flex-col p-6">
                <div className="space-y-4 mb-6">
                  <Input
                    {...register("subject")}
                    label="Asunto"
                    placeholder="Asunto del email"
                    error={errors.subject?.message}
                  />

                  {/* Variables */}
                  {template?.variables && template.variables.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {template.variables.map((variable) => (
                        <Input
                          key={variable.name}
                          label={`Variable: ${variable.name}`}
                          value={variableValues[variable.name] || ""}
                          onChange={(e) =>
                            setVariableValues({
                              ...variableValues,
                              [variable.name]: e.target.value,
                            })
                          }
                          placeholder={`Valor para ${variable.name}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Scheduling */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      {...register("scheduledAt")}
                      type="datetime-local"
                      label="Programar envío (opcional)"
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Opciones de seguimiento
                      </label>
                      <div className="space-y-1">
                        <label className="flex items-center">
                          <input
                            {...register("trackOpens")}
                            type="checkbox"
                            className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                          />
                          <span className="ml-2 text-sm text-white/80">
                            Rastrear aperturas
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            {...register("trackClicks")}
                            type="checkbox"
                            className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                          />
                          <span className="ml-2 text-sm text-white/80">
                            Rastrear clics
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Editor */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Contenido del Email
                  </label>
                  <textarea
                    {...register("htmlContent")}
                    className="w-full h-full input-glass resize-none"
                    placeholder="Contenido del email en HTML..."
                  />
                  {errors.htmlContent && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.htmlContent.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <Button type="button" variant="glass" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<Send className="w-4 h-4" />}
                disabled={selectedContacts.length === 0}
              >
                {watchedContent && register("scheduledAt").name
                  ? "Programar Envío"
                  : "Enviar Ahora"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <EmailPreview
          htmlContent={watchedContent}
          subject={watchedSubject}
          variables={template?.variables}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};
