import { Bot, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AiMessage } from "../../services/ai.service";
import { clsx } from "clsx";

interface MessageBubbleProps {
  message: AiMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  // Renderizar contenido según el tipo
  const renderContent = () => {
    if (message.metadata?.type === "chart") {
      // Aquí se podría renderizar un gráfico
      return (
        <div className="p-4 glass rounded-lg">
          <p className="text-sm text-white/60 mb-2">📊 Gráfico generado</p>
          <div className="h-40 flex items-center justify-center">
            <p className="text-white/40">Visualización de datos</p>
          </div>
        </div>
      );
    }

    if (message.metadata?.type === "table") {
      // Renderizar tabla
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {Object.keys(message.metadata.data[0] || {}).map((key) => (
                  <th key={key} className="text-left py-2 px-3 text-white/60">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {message.metadata.data.map((row: any, index: number) => (
                <tr key={index} className="border-b border-white/5">
                  {Object.values(row).map((value: any, i: number) => (
                    <td key={i} className="py-2 px-3 text-white/80">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (message.metadata?.type === "suggestion") {
      return (
        <div className="space-y-2">
          <p className="text-white whitespace-pre-wrap">{message.content}</p>
          {message.metadata.data && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.metadata.data.map((action: any, index: number) => (
                <button
                  key={index}
                  className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-300 text-sm hover:bg-primary-500/30 transition-colors"
                  onClick={() => console.log("Action:", action)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Texto normal con formato
    return <p className="text-white whitespace-pre-wrap">{message.content}</p>;
  };

  return (
    <div
      className={clsx("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div
        className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser
            ? "bg-primary-500"
            : "bg-gradient-to-br from-accent to-blue-500"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message */}
      <div
        className={clsx(
          "max-w-[80%] space-y-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={clsx(
            "rounded-2xl px-4 py-3",
            isUser ? "bg-primary-500/20 border border-primary-500/30" : "glass"
          )}
        >
          {renderContent()}
        </div>

        {/* Timestamp */}
        <p
          className={clsx(
            "text-xs text-white/40 px-2",
            isUser ? "text-right" : "text-left"
          )}
        >
          {format(new Date(message.timestamp), "HH:mm", { locale: es })}
        </p>
      </div>
    </div>
  );
};
