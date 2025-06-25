import { Bot, User, Copy, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AiMessage } from "../../services/ai.service";
import { clsx } from "clsx";
import { useState } from "react";
import toast from "react-hot-toast";

interface MessageBubbleProps {
  message: AiMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  // ✅ Mejorado: Función de copiar con feedback
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("Mensaje copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying message:", error);
      toast.error("Error al copiar");
    }
  };

  // ✅ Mejorado: Renderizar contenido con mejor manejo de tipos
  const renderContent = () => {
    // Manejar contenido de tipo gráfico
    if (message.metadata?.type === "chart") {
      return (
        <div className="space-y-3">
          <p className="text-white/90">{message.content}</p>
          <div className="p-4 glass rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-sm font-medium text-white">
                Gráfico Generado
              </span>
            </div>
            <div className="h-40 flex items-center justify-center bg-white/5 rounded-lg">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 opacity-40">📊</div>
                <p className="text-white/40 text-sm">Visualización de datos</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Manejar contenido de tipo tabla
    if (message.metadata?.type === "table" && message.metadata?.data) {
      const tableData = Array.isArray(message.metadata.data)
        ? message.metadata.data
        : [];

      if (tableData.length === 0) {
        return (
          <p className="text-white whitespace-pre-wrap">{message.content}</p>
        );
      }

      return (
        <div className="space-y-3">
          <p className="text-white/90">{message.content}</p>
          <div className="overflow-x-auto">
            <div className="min-w-full glass rounded-lg border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {Object.keys(tableData[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="text-left py-3 px-4 text-white/70 font-medium"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.slice(0, 10).map((row: any, index: number) => (
                    <tr
                      key={index}
                      className={clsx(
                        "border-b border-white/5",
                        index % 2 === 0 && "bg-white/5"
                      )}
                    >
                      {Object.values(row).map((value: any, i: number) => (
                        <td key={i} className="py-3 px-4 text-white/80">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {tableData.length > 10 && (
                <div className="p-3 text-center border-t border-white/10">
                  <span className="text-xs text-white/60">
                    ... y {tableData.length - 10} filas más
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Manejar contenido con sugerencias de acciones
    if (message.metadata?.type === "suggestion") {
      return (
        <div className="space-y-3">
          <p className="text-white whitespace-pre-wrap">{message.content}</p>
          {message.metadata.data && Array.isArray(message.metadata.data) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.metadata.data.map((action: any, index: number) => (
                <button
                  key={index}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-sm transition-all",
                    "bg-primary-500/20 text-primary-300 border border-primary-500/30",
                    "hover:bg-primary-500/30 hover:text-primary-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  )}
                  onClick={() => {
                    console.log("Action clicked:", action);
                    toast.success(`Acción: ${action.label}`);
                  }}
                >
                  {action.label || action.title || "Acción"}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ✅ Mejorado: Texto normal con mejor formato y detección de enlaces
    const contentWithLinks = message.content.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>'
    );

    return (
      <div
        className="text-white whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: contentWithLinks }}
      />
    );
  };

  return (
    <div
      className={clsx(
        "flex gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar con mejor diseño */}
      <div
        className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
          isUser
            ? "bg-gradient-to-br from-primary-500 to-primary-600"
            : "bg-gradient-to-br from-purple-500 to-blue-500"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message content */}
      <div
        className={clsx(
          "max-w-[85%] space-y-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Message bubble */}
        <div className="relative group/message">
          <div
            className={clsx(
              "rounded-2xl px-4 py-3 shadow-sm",
              isUser
                ? "bg-primary-500/20 border border-primary-500/30"
                : "glass border border-white/10"
            )}
          >
            {renderContent()}
          </div>

          {/* ✅ Nuevo: Botón de copiar para mensajes de IA */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className={clsx(
                "absolute top-2 right-2 p-1.5 rounded-lg",
                "bg-white/10 hover:bg-white/20 transition-all",
                "opacity-0 group-hover/message:opacity-100",
                "focus:opacity-100 focus:outline-none"
              )}
              title="Copiar mensaje"
            >
              {copied ? (
                <CheckCircle className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-white/60" />
              )}
            </button>
          )}
        </div>

        {/* Timestamp con mejor formato */}
        <div
          className={clsx(
            "flex items-center gap-2 px-2",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <p className="text-xs text-white/40">
            {format(new Date(message.timestamp), "HH:mm", { locale: es })}
          </p>
          {/* ✅ Nuevo: Indicador de estado para mensajes del usuario */}
          {isUser && (
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            </div>
          )}
        </div>

        {/* ✅ Nuevo: Mostrar sugerencias de la IA si las hay */}
        {!isUser && message.metadata?.suggestions && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-white/50 px-2">Sugerencias:</p>
            {message.metadata.suggestions
              .slice(0, 3)
              .map((suggestion: string, index: number) => (
                <button
                  key={index}
                  className="block text-left text-xs text-primary-400 hover:text-primary-300 transition-colors px-2 py-1 rounded hover:bg-white/5"
                  onClick={() => {
                    // Aquí podrías integrar con el hook de chat para enviar la sugerencia
                    console.log("Suggestion clicked:", suggestion);
                    toast.success("Sugerencia seleccionada");
                  }}
                >
                  💡 {suggestion}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
