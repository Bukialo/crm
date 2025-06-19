import { useState } from "react";
import {
  Plus,
  Mail,
  MessageSquare,
  MessageCircle,
  Filter,
  Search,
} from "lucide-react";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { CampaignCard } from "../../components/campaigns/CampaignCard";
import { CampaignForm } from "../../components/campaigns/CampaignForm";
import { useCampaigns } from "../../hooks/useCampaigns";
import { useCampaignsStore } from "../../store/campaigns.store";
import { Campaign, CreateCampaignDto } from "../../services/campaign.service";
import { clsx } from "clsx";

const CampaignsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    campaigns,
    totalCampaigns,
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    duplicateCampaign,
    updateCampaignStatus,
  } = useCampaigns();

  const { filters, setFilters, currentPage, pageSize, setPage } =
    useCampaignsStore();

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Implementar búsqueda cuando esté disponible en el backend
  };

  // Handle type filter
  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    const newTypes = type === "all" ? [] : [type];
    setFilters({ type: newTypes, page: 1 });
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    const newStatuses = status === "all" ? [] : [status];
    setFilters({ status: newStatuses, page: 1 });
  };

  // Handle create/update campaign
  const handleCreateCampaign = async (data: CreateCampaignDto) => {
    try {
      await createCampaign(data);
      setShowForm(false);
      setEditingCampaign(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUpdateCampaign = async (data: CreateCampaignDto) => {
    if (!editingCampaign) return;

    try {
      await updateCampaign({ id: editingCampaign.id, data });
      setShowForm(false);
      setEditingCampaign(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowForm(true);
  };

  const handleDelete = async (campaign: Campaign) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar la campaña "${campaign.name}"?`
      )
    ) {
      try {
        await deleteCampaign(campaign.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleSend = async (campaign: Campaign) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas enviar la campaña "${campaign.name}" a ${campaign.recipientCount} destinatarios?`
      )
    ) {
      try {
        await sendCampaign(campaign.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      await duplicateCampaign(campaign.id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleStatusChange = async (
    campaign: Campaign,
    newStatus: Campaign["status"]
  ) => {
    try {
      await updateCampaignStatus({ id: campaign.id, status: newStatus });
    } catch (error) {
      // Error handled by hook
    }
  };

  // Campaign type stats
  const typeStats = {
    all: campaigns.length,
    EMAIL: campaigns.filter((c) => c.type === "EMAIL").length,
    SMS: campaigns.filter((c) => c.type === "SMS").length,
    WHATSAPP: campaigns.filter((c) => c.type === "WHATSAPP").length,
  };

  // Status stats
  const statusStats = {
    all: campaigns.length,
    DRAFT: campaigns.filter((c) => c.status === "DRAFT").length,
    SCHEDULED: campaigns.filter((c) => c.status === "SCHEDULED").length,
    SENT: campaigns.filter((c) => c.status === "SENT").length,
    SENDING: campaigns.filter((c) => c.status === "SENDING").length,
  };

  const totalPages = Math.ceil(totalCampaigns / pageSize);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Campañas</h1>
          <p className="text-white/60">{totalCampaigns} campañas en total</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => setShowForm(true)}
        >
          Nueva Campaña
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Total Campañas</p>
                <p className="text-2xl font-bold text-white">
                  {totalCampaigns}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary-500/20">
                <Mail className="w-6 h-6 text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Enviadas</p>
                <p className="text-2xl font-bold text-white">
                  {statusStats.SENT}
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
                <p className="text-sm text-white/60 mb-1">Programadas</p>
                <p className="text-2xl font-bold text-white">
                  {statusStats.SCHEDULED}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Borradores</p>
                <p className="text-2xl font-bold text-white">
                  {statusStats.DRAFT}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-500/20">
                <Mail className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Buscar campañas..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  leftIcon={<Search className="w-5 h-5" />}
                />
              </div>
              <Button variant="glass" leftIcon={<Filter className="w-5 h-5" />}>
                Filtros Avanzados
              </Button>
            </div>

            {/* Type Filter */}
            <div>
              <p className="text-sm font-medium text-white/80 mb-2">
                Tipo de Campaña
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTypeFilter("all")}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    selectedType === "all"
                      ? "bg-primary-500 text-white"
                      : "glass text-white/60 hover:text-white"
                  )}
                >
                  Todas ({typeStats.all})
                </button>
                <button
                  onClick={() => handleTypeFilter("EMAIL")}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    selectedType === "EMAIL"
                      ? "bg-primary-500 text-white"
                      : "glass text-white/60 hover:text-white"
                  )}
                >
                  <Mail className="w-4 h-4" />
                  Email ({typeStats.EMAIL})
                </button>
                <button
                  onClick={() => handleTypeFilter("SMS")}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    selectedType === "SMS"
                      ? "bg-primary-500 text-white"
                      : "glass text-white/60 hover:text-white"
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                  SMS ({typeStats.SMS})
                </button>
                <button
                  onClick={() => handleTypeFilter("WHATSAPP")}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    selectedType === "WHATSAPP"
                      ? "bg-primary-500 text-white"
                      : "glass text-white/60 hover:text-white"
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp ({typeStats.WHATSAPP})
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <p className="text-sm font-medium text-white/80 mb-2">Estado</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusFilter("all")}
                  className={clsx(
                    "px-4 py-2 rounded-lg transition-all",
                    selectedStatus === "all"
                      ? "bg-primary-500 text-white"
                      : "glass text-white/60 hover:text-white"
                  )}
                >
                  Todas ({statusStats.all})
                </button>
                <button
                  onClick={() => handleStatusFilter("DRAFT")}
                  className={clsx(
                    "px-4 py-2 rounded-lg transition-all",
                    selectedStatus === "DRAFT"
                      ? "bg-primary-500 text-white"
                      : "glass text-white/60 hover:text-white"
                  )}
                >
                  Borradores ({statusStats.DRAFT})
                </button>
                <button
                  onClick={() => handleStatusFilter("SCHEDULED")}
                  className={clsx(
                    "px-4 py-2 rounded-lg transition-all",
                    selectedStatus === "SCHEDULED"
                      ? "bg-primary-500 text-white"
                      : "glass text-white/60 hover:text-white"
                  )}
                >
                  Programadas ({statusStats.SCHEDULED})
                </button>
                <button
                  onClick={() => handleStatusFilter("SENT")}
                  className={clsx(
                    "px-4 py-2 rounded-lg transition-all",
                    selectedStatus === "SENT"
                      ? "bg-primary-500 text-white"
                      : "glass text-white/60 hover:text-white"
                  )}
                >
                  Enviadas ({statusStats.SENT})
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-white/10 rounded mb-3" />
                <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay campañas
            </h3>
            <p className="text-white/60 mb-6">
              Crea tu primera campaña para comenzar a enviar emails a tus
              contactos
            </p>
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Crear Primera Campaña
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSend={handleSend}
              onDuplicate={handleDuplicate}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={clsx(
                    "w-8 h-8 rounded-lg transition-all",
                    currentPage === pageNum
                      ? "bg-primary-500 text-white"
                      : "glass text-white/60 hover:text-white"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Campaign Form Modal */}
      {showForm && (
        <CampaignForm
          campaign={editingCampaign}
          onSubmit={
            editingCampaign ? handleUpdateCampaign : handleCreateCampaign
          }
          onCancel={() => {
            setShowForm(false);
            setEditingCampaign(null);
          }}
          isLoading={false}
        />
      )}
    </div>
  );
};

export default CampaignsPage;
