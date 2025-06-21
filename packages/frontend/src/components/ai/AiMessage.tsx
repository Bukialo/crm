import { User, Sparkles, BarChart3, Table, TrendingUp } from "lucide-react";
import { AiMessage as AiMessageType } from "../../services/ai.service";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AiMessageProps {
  message: AiMessageType;
}

export const AiMessage = ({ message }: AiMessageProps) => {
  const isUser = message.role === "user";

  const renderContent = () => {
    if (message.metadata?.type === "chart") {
      return (
        <div className="space-y-3">
          <p className="text-white/90">{message.content}</p>
          <div className="p-3 glass rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-white">
                Gráfico Generado
              </span>
            </div>
            {/* Aquí se renderizaría el gráfico real */}
            <div className="h-32 bg-white/5 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white/20" />
            </div>
          </div>
        </div>
      );
    }

    if (message.metadata?.type === "table") {
      return (
        <div className="space-y-3">
          <p className="text-white/90">{message.content}</p>
          <div className="p-3 glass rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Table className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-white">
                Tabla de Datos
              </span>
            </div>
            {/* Aquí se renderizaría la tabla real */}
            <div className="h-24 bg-white/5 rounded-lg flex items-center justify-center">
              <Table className="w-6 h-6 text-white/20" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <p className="text-white/90 whitespace-pre-wrap">{message.content}</p>
    );
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-primary-500"
            : "bg-gradient-to-br from-purple-500 to-pink-500"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block p-3 rounded-2xl ${
            isUser ? "bg-primary-500 text-white" : "glass text-white/90"
          }`}
        >
          {renderContent()}
        </div>

        {/* Timestamp */}
        <p className="text-xs text-white/40 mt-1 px-1">
          {format(new Date(message.timestamp), "HH:mm", { locale: es })}
        </p>

        {/* Actions/Suggestions for AI messages */}
        {!isUser && message.metadata?.suggestions && (
          <div className="mt-2 space-y-1">
            {message.metadata.suggestions.map(
              (suggestion: string, index: number) => (
                <button
                  key={index}
                  className="block text-left text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  onClick={() => {
                    // Handle suggestion click
                    console.log("Suggestion clicked:", suggestion);
                  }}
                >
                  → {suggestion}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
