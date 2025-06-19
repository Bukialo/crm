import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Mail,
  Users,
  TrendingUp,
  Calendar,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Send,
  Pause,
  Eye,
  BarChart3,
} from "lucide-react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import { Campaign } from "../../services/campaign.service";
import { clsx } from "clsx";

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDuplicate: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => void;
  onSend: (campaign: Campaign) => void;
}

const statusConfig = {
  DRAFT: {
    label: "Borrador",
    color: "gray",
    bgClass: "bg-gray-500/20",
    textClass: "text-gray-300",
    borderClass: "border-gray-500/30",
  },
  SCHEDULED: {
    label: "Programada",
    color: "blue",
    bgClass: "bg-blue-500/20",
    textClass: "text-blue-300",
    borderClass: "border-blue-500/30",
  },
  SENDING: {
    label: "Enviando",
    color: "yellow",
    bgClass: "bg-yellow-500/20",
    textClass: "text-yellow-300",
    borderClass: "border-yellow-500/30",
  },
  SENT: {
    label: "Enviada",
    color: "green",
    bgClass: "bg-green-500/20",
    textClass: "text-green-300",
    borderClass: "border-green-500/30",
  },
  CANCELLED: {
    label: "Cancelada",
    color: "red",
    bgClass: "bg-red-500/20",
    textClass: "text-red-300",
    borderClass: "border-red-500/30",
  },
};

export const CampaignCard = ({
  campaign,
  onEdit,
  onDuplicate,
  onDelete,
  onSend,
}: CampaignCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const status = statusConfig[campaign.status];
  const openRate =
    campaign.sentCount > 0
      ? (campaign.openCount / campaign.sentCount) * 100
      : 0;
  const clickRate =
    campaign.openCount > 0
      ? (campaign.clickCount / campaign.openCount) * 100
      : 0;

  const canEdit = campaign.status === "DRAFT";
  const canSend =
    campaign.status === "DRAFT" || campaign.status === "SCHEDULED";
  const canCancel =
    campaign.status === "SCHEDULED" || campaign.status === "SENDING";

  const handleDelete = () => {
    onDelete(campaign.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card hover className="group relative">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">
                  {campaign.name}
                </h3>
                <p className="text-xs text-white/60">{campaign.type}</p>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={clsx(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                status.bgClass,
                status.textClass,
                status.borderClass
              )}
            >
              {status.label}
            </span>
          </div>

          {/* Subject */}
          <div className="mb-4">
            <p className="text-sm text-white/80 line-clamp-2">
              {campaign.subject || "Sin asunto"}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 glass rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/60">Destinatarios</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {campaign.recipientCount}
              </p>
            </div>

            <div className="p-3 glass rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/60">
                  {campaign.status === "SENT" ? "Aperturas" : "Enviados"}
                </span>
              </div>
              <p className="text-lg font-semibold text-white">
                {campaign.status === "SENT"
                  ? `${openRate.toFixed(1)}%`
                  : campaign.sentCount}
              </p>
            </div>
          </div>

          {/* Performance Metrics (only for sent campaigns) */}
          {campaign.status === "SENT" && (
            <div className="mb-4 p-3 glass rounded-lg">
              <div className="flex justify-between items-center text-xs text-white/60 mb-2">
                <span>Rendimiento</span>
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-white/80">Enviados:</span>
                  <span className="text-xs text-white">
                    {campaign.sentCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-white/80">Abiertos:</span>
                  <span className="text-xs text-white">
                    {campaign.openCount} ({openRate.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-white/80">Clics:</span>
                  <span className="text-xs text-white">
                    {campaign.clickCount} ({clickRate.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Date */}
          {campaign.scheduledDate && (
            <div className="mb-4 flex items-center gap-2 text-sm text-white/60">
              <Calendar className="w-4 h-4" />
              <span>
                {campaign.status === "SCHEDULED"
                  ? "Programada para: "
                  : "Enviada: "}
                {format(
                  new Date(campaign.scheduledDate),
                  "dd MMM yyyy, HH:mm",
                  {
                    locale: es,
                  }
                )}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {canSend && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onSend(campaign)}
                leftIcon={<Send className="w-4 h-4" />}
                className="flex-1"
              >
                {campaign.status === "SCHEDULED" ? "Enviar Ahora" : "Enviar"}
              </Button>
            )}

            {canEdit && (
              <Button
                size="sm"
                variant="glass"
                onClick={() => onEdit(campaign)}
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Editar
              </Button>
            )}

            <div className="relative">
              <Button
                size="sm"
                variant="glass"
                onClick={() => setShowMenu(!showMenu)}
                className="px-2"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 glass-morphism rounded-lg p-1 z-10 fade-in">
                  <button
                    onClick={() => {
                      // Navigate to campaign details
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalles
                  </button>

                  <button
                    onClick={() => {
                      onDuplicate(campaign);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => {
                        onEdit(campaign);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                  )}

                  {canCancel && (
                    <button
                      onClick={() => {
                        // Handle cancel campaign
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded transition-colors"
                    >
                      <Pause className="w-4 h-4" />
                      Cancelar
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-white/80 mb-6">
                ¿Estás seguro de que deseas eliminar la campaña{" "}
                <span className="font-semibold">{campaign.name}</span>? Esta
                acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="glass"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
