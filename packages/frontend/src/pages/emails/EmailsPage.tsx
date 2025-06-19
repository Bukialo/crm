import { useState } from "react";
import { Plus, Mail, Send, BarChart, Users } from "lucide-react";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { EmailTemplateList } from "../../components/emails/EmailTemplateList";
import { EmailEditor } from "../../components/emails/EmailEditor";
import { EmailPreview } from "../../components/emails/EmailPreview";
import { SendEmailModal } from "../../components/emails/SendEmailModal";
import {
  useEmailTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useSendEmail,
  useSendTestEmail,
  useEmailStats,
} from "../../hooks/useEmails";
import { useContacts } from "../../hooks/useContacts";
import { EmailTemplate } from "../../services/email.service";
import toast from "react-hot-toast";

const EmailsPage = () => {
  const [activeTab, setActiveTab] = useState<"templates" | "history" | "stats">(
    "templates"
  );
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [previewContent, setPreviewContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);

  // Hooks
  const { data: templates = [], isLoading: templatesLoading } =
    useEmailTemplates();
  const { data: emailStats } = useEmailStats();
  const { contacts } = useContacts();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const sendEmail = useSendEmail();
  const sendTestEmail = useSendTestEmail();

  // Handlers
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDeleteTemplate = async (template: EmailTemplate) => {
    if (
      window.confirm(`¿Estás seguro de que deseas eliminar "${template.name}"?`)
    ) {
      try {
        await deleteTemplate.mutateAsync(template.id);
      } catch (error) {
        // Error manejado por el hook
      }
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const newTemplate = {
        ...template,
        name: `${template.name} (Copia)`,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        usageCount: undefined,
      };
      await createTemplate.mutateAsync(newTemplate);
      toast.success("Plantilla duplicada exitosamente");
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowSendModal(true);
  };

  const handleSaveTemplate = async (templateData: Partial<EmailTemplate>) => {
    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          template: templateData,
        });
      } else {
        await createTemplate.mutateAsync(templateData as any);
      }
      setShowEditor(false);
      setEditingTemplate(null);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handlePreview = (content: string) => {
    setPreviewContent(content);
    setShowPreview(true);
  };

  const handleSendEmail = async (request: any) => {
    try {
      await sendEmail.mutateAsync(request);
      setShowSendModal(false);
      setSelectedTemplate(null);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleSendTestEmail = async (
    email: string,
    variables: Record<string, any>
  ) => {
    if (!selectedTemplate) return;

    try {
      await sendTestEmail.mutateAsync({
        to: [email],
        templateId: selectedTemplate.id,
        subject: selectedTemplate.subject,
        htmlContent: selectedTemplate.htmlContent,
        variables,
      });
      toast.success("Email de prueba enviado");
    } catch (error) {
      // Error manejado por el hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Email Marketing
          </h1>
          <p className="text-white/60">
            Gestiona plantillas y campañas de email
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={handleCreateTemplate}
        >
          Nueva Plantilla
        </Button>
      </div>

      {/* Stats Cards */}
      {emailStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Emails Enviados</p>
                  <p className="text-2xl font-bold text-white">
                    {emailStats.totalSent}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Send className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Tasa de Apertura</p>
                  <p className="text-2xl font-bold text-white">
                    {emailStats.openRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/20">
                  <Mail className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Tasa de Clics</p>
                  <p className="text-2xl font-bold text-white">
                    {emailStats.clickRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <BarChart className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Plantillas</p>
                  <p className="text-2xl font-bold text-white">
                    {templates.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <Users className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 rounded transition-all ${
            activeTab === "templates"
              ? "bg-primary-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Plantillas
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded transition-all ${
            activeTab === "history"
              ? "bg-primary-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Historial
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 rounded transition-all ${
            activeTab === "stats"
              ? "bg-primary-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Estadísticas
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "templates" && (
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Email</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailTemplateList
                templates={templates}
                isLoading={templatesLoading}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
                onDuplicate={handleDuplicateTemplate}
                onUseTemplate={handleUseTemplate}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">
                  Historial de emails próximamente
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "stats" && (
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Detalladas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">
                  Estadísticas detalladas próximamente
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      {showEditor && (
        <EmailEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
          onPreview={handlePreview}
        />
      )}

      {showPreview && (
        <EmailPreview
          htmlContent={previewContent}
          subject="Vista Previa"
          onClose={() => setShowPreview(false)}
        />
      )}

      {showSendModal && selectedTemplate && (
        <SendEmailModal
          isOpen={showSendModal}
          onClose={() => {
            setShowSendModal(false);
            setSelectedTemplate(null);
          }}
          onSend={handleSendEmail}
          template={selectedTemplate}
          availableContacts={contacts}
        />
      )}
    </div>
  );
};

export default EmailsPage;
