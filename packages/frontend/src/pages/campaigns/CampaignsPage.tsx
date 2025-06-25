// src/pages/campaigns/CampaignsPage.tsx
import React, { useState } from "react";
import {
  Mail,
  MessageSquare,
  Send,
  Users,
  Calendar,
  TrendingUp,
  Plus,
  Search,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Hook de campañas
import { useCampaigns } from "../../hooks/useCampaigns";
import { usePagination } from "../../hooks/usePagination";

// Tipos para campañas
interface Campaign {
  id: string;
  name: string;
  type: "EMAIL" | "SMS" | "WHATSAPP";
  status: "DRAFT" | "SCHEDULED" | "SENT" | "SENDING";
  subject?: string;
  recipients: number;
  sentDate?: string;
  scheduledDate?: string;
  openRate?: number;
  clickRate?: number;
  createdAt: string;
  updatedAt: string;
}

export const CampaignsPage: React.FC = () => {
  const { campaigns, isLoading, createCampaign, deleteCampaign } =
    useCampaigns();

  const { currentPage, pageSize, setPage } = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filtrar campañas
  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (campaign.subject &&
        campaign.subject.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === "ALL" || campaign.type === typeFilter;
    const matchesStatus =
      statusFilter === "ALL" || campaign.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Paginación
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCampaigns.length / pageSize);

  // Estadísticas
  const totalStats = {
    total: campaigns.length,
    sent: campaigns.filter((c: Campaign) => c.status === "SENT").length,
    scheduled: campaigns.filter((c: Campaign) => c.status === "SCHEDULED")
      .length,
    draft: campaigns.filter((c: Campaign) => c.status === "DRAFT").length,
  };

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "SENT":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "DRAFT":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "SENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusText = (status: Campaign["status"]) => {
    switch (status) {
      case "SENT":
        return "Enviada";
      case "DRAFT":
        return "Borrador";
      case "SCHEDULED":
        return "Programada";
      case "SENDING":
        return "Enviando";
      default:
        return "Desconocido";
    }
  };

  const getTypeIcon = (type: Campaign["type"]) => {
    switch (type) {
      case "EMAIL":
        return <Mail className="w-4 h-4" />;
      case "SMS":
        return <MessageSquare className="w-4 h-4" />;
      case "WHATSAPP":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Campaign["type"]) => {
    switch (type) {
      case "EMAIL":
        return "text-purple-600 dark:text-purple-400";
      case "SMS":
        return "text-blue-600 dark:text-blue-400";
      case "WHATSAPP":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const handleCreateCampaign = async () => {
    try {
      await createCampaign({
        name: "Nueva Campaña",
        type: "EMAIL",
        recipients: 0,
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta campaña?")) {
      try {
        await deleteCampaign(id);
      } catch (error) {
        console.error("Error deleting campaign:", error);
      }
    }
  };

  if (isLoading) {
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
            Campañas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tus campañas de marketing multicanal
          </p>
        </div>

        <Button
          onClick={handleCreateCampaign}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Campaña
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Campañas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalStats.total}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Enviadas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalStats.sent}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Programadas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalStats.scheduled}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Borradores
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalStats.draft}
                </p>
              </div>
              <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar campañas..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los tipos</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="SMS">SMS</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="DRAFT">Borrador</SelectItem>
              <SelectItem value="SCHEDULED">Programada</SelectItem>
              <SelectItem value="SENDING">Enviando</SelectItem>
              <SelectItem value="SENT">Enviada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {paginatedCampaigns.map((campaign: Campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`p-2 rounded-lg ${getTypeColor(campaign.type)}`}
                  >
                    {getTypeIcon(campaign.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {campaign.name}
                      </h3>
                      <Badge className={getStatusColor(campaign.status)}>
                        {getStatusText(campaign.status)}
                      </Badge>
                      <Badge variant="outline">{campaign.type}</Badge>
                    </div>

                    {campaign.subject && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {campaign.subject}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {campaign.recipients} destinatarios
                      </span>

                      {campaign.sentDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Enviada:{" "}
                          {new Date(campaign.sentDate).toLocaleDateString()}
                        </span>
                      )}

                      {campaign.scheduledDate &&
                        campaign.status === "SCHEDULED" && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Programada:{" "}
                            {new Date(
                              campaign.scheduledDate
                            ).toLocaleDateString()}
                          </span>
                        )}

                      {campaign.status === "SENT" &&
                        campaign.openRate !== undefined && (
                          <>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              Apertura: {campaign.openRate}%
                            </span>
                            {campaign.clickRate !== undefined && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                Clicks: {campaign.clickRate}%
                              </span>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {campaign.status === "DRAFT" && (
                    <>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  {campaign.status === "SCHEDULED" && (
                    <Button variant="outline" size="sm">
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}

                  {campaign.status === "SENT" && (
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || typeFilter !== "ALL" || statusFilter !== "ALL"
              ? "No se encontraron campañas"
              : "No hay campañas"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || typeFilter !== "ALL" || statusFilter !== "ALL"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza creando tu primera campaña"}
          </p>
          {!searchTerm && typeFilter === "ALL" && statusFilter === "ALL" && (
            <Button onClick={handleCreateCampaign}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Campaña
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};
