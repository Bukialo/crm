// src/pages/emails/EmailsPage.tsx
import React, { useState } from "react";
import {
  Mail,
  Plus,
  Send,
  Users,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Clock,
  Target,
  MousePointer,
} from "lucide-react";
import { useEmails } from "../../hooks/useEmails";
import { CreateCampaignModal } from "../../components/emails/CreateCampaignModal";
import { EmailTemplateModal } from "../../components/emails/EmailTemplateModal";

export const EmailsPage: React.FC = () => {
  const { campaigns, templates, loading, createCampaign } = useEmails();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"campaigns" | "templates">(
    "campaigns"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock stats para mostrar métricas
  const emailStats = {
    totalSent: 1250,
    totalOpened: 875,
    totalClicked: 156,
    openRate: 70,
    clickRate: 12.5,
    conversionRate: 8.2,
  };

  // Mock campaigns data si no hay datos reales
  const mockCampaigns = [
    {
      id: "1",
      name: "Promoción Verano 2025",
      subject: "¡Ofertas especiales de verano!",
      status: "sent" as const,
      recipients: 250,
      sentDate: "2025-06-20",
      openRate: 68,
      clickRate: 15,
      conversionRate: 8,
    },
    {
      id: "2",
      name: "Seguimiento Post-Viaje",
      subject: "¿Cómo estuvo tu viaje?",
      status: "draft" as const,
      recipients: 45,
      sentDate: null,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
    },
    {
      id: "3",
      name: "Ofertas Fin de Año",
      subject: "Últimas ofertas del año",
      status: "scheduled" as const,
      recipients: 180,
      sentDate: "2025-06-25",
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
    },
    {
      id: "4",
      name: "Bienvenida Nuevos Clientes",
      subject: "¡Bienvenido a Bukialo Travel!",
      status: "sent" as const,
      recipients: 89,
      sentDate: "2025-06-18",
      openRate: 85,
      clickRate: 22,
      conversionRate: 12,
    },
  ];

  // Mock templates data si no hay datos reales
  const mockTemplates = [
    {
      id: "1",
      name: "Bienvenida - Nuevo Lead",
      subject: "¡Bienvenido {{firstName}}! Tu próximo viaje te espera",
      category: "WELCOME",
      createdAt: "2025-06-15",
      lastUsed: "2025-06-20",
      timesUsed: 15,
    },
    {
      id: "2",
      name: "Cotización de Viaje",
      subject: "Tu cotización personalizada está lista, {{firstName}}",
      category: "QUOTE",
      createdAt: "2025-06-10",
      lastUsed: "2025-06-22",
      timesUsed: 32,
    },
    {
      id: "3",
      name: "Seguimiento Post-Viaje",
      subject: "¿Cómo estuvo tu viaje a {{destination}}, {{firstName}}?",
      category: "POST_TRIP",
      createdAt: "2025-06-05",
      lastUsed: "2025-06-19",
      timesUsed: 8,
    },
    {
      id: "4",
      name: "Oferta Estacional",
      subject: "🌴 Ofertas de {{season}} - Hasta {{discount}}% OFF",
      category: "SEASONAL",
      createdAt: "2025-06-01",
      lastUsed: "2025-06-21",
      timesUsed: 25,
    },
  ];

  const displayCampaigns = campaigns.length > 0 ? campaigns : mockCampaigns;
  const displayTemplates = templates.length > 0 ? templates : mockTemplates;

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      await createCampaign(campaignData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  const handleCreateTemplate = async (templateData: any) => {
    try {
      // Aquí iría la lógica para crear el template
      console.log("Creating template:", templateData);
      setIsTemplateModalOpen(false);
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const filteredCampaigns = displayCampaigns.filter((campaign: any) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTemplates = displayTemplates.filter(
    (template: any) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return "Enviada";
      case "draft":
        return "Borrador";
      case "scheduled":
        return "Programada";
      default:
        return "Desconocido";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "WELCOME":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "QUOTE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "POST_TRIP":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "SEASONAL":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "WELCOME":
        return "Bienvenida";
      case "QUOTE":
        return "Cotización";
      case "POST_TRIP":
        return "Post-Viaje";
      case "SEASONAL":
        return "Estacional";
      default:
        return "General";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Email Marketing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tus campañas de email y templates
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Nuevo Template
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Campaña
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Enviados
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {emailStats.totalSent.toLocaleString()}
              </p>
            </div>
            <Send className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Abiertos
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {emailStats.totalOpened.toLocaleString()}
              </p>
            </div>
            <Eye className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Clicks
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {emailStats.totalClicked.toLocaleString()}
              </p>
            </div>
            <MousePointer className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tasa Apertura
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {emailStats.openRate}%
              </p>
            </div>
            <Mail className="w-5 h-5 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tasa Click
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {emailStats.clickRate}%
              </p>
            </div>
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Conversión
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {emailStats.conversionRate}%
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "campaigns"
                ? "border-purple-500 text-purple-600 dark:text-purple-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Campañas ({filteredCampaigns.length})
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "templates"
                ? "border-purple-500 text-purple-600 dark:text-purple-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Templates ({filteredTemplates.length})
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`Buscar ${activeTab === "campaigns" ? "campañas" : "templates"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {activeTab === "campaigns" && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="sent">Enviadas</option>
              <option value="draft">Borradores</option>
              <option value="scheduled">Programadas</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === "campaigns" ? (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign: any) => (
            <div
              key={campaign.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {campaign.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}
                    >
                      {getStatusText(campaign.status)}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {campaign.subject}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {campaign.recipients} destinatarios
                    </span>

                    {campaign.sentDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(campaign.sentDate).toLocaleDateString()}
                      </span>
                    )}

                    {campaign.status === "sent" && (
                      <>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          Apertura: {campaign.openRate}%
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="w-4 h-4" />
                          Clicks: {campaign.clickRate}%
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Conversión: {campaign.conversionRate}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {campaign.status === "draft" && (
                    <button
                      className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {campaign.status === "sent" && (
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  {campaign.status === "scheduled" && (
                    <button
                      className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                      title="Programada"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Más opciones"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || statusFilter !== "all"
                  ? "No se encontraron campañas"
                  : "No hay campañas"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primera campaña de email"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Crear Campaña
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template: any) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}
                    >
                      {getCategoryText(template.category)}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {template.subject}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Creado:{" "}
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Usado: {new Date(template.lastUsed).toLocaleDateString()}
                    </span>

                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {template.timesUsed} veces
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Vista previa"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Más opciones"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Edit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm
                  ? "No se encontraron templates"
                  : "No hay templates"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm
                  ? "Intenta ajustar la búsqueda"
                  : "Crea tu primer template para emails"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Crear Template
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCampaign}
      />

      <EmailTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSubmit={handleCreateTemplate}
      />
    </div>
  );
};
