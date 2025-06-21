import { MessageCircle, X, Sparkles } from "lucide-react";
import { useAiStore } from "../../store/ai.store";
import { clsx } from "clsx";

export const AiChatButton = () => {
  const { isOpen, toggleChat, messages } = useAiStore();

  // ✅ Mejorado: Detectar mensajes no leídos
  const hasUnread =
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    !isOpen;

  // ✅ Mejorado: Función de toggle con logging para debug
  const handleToggle = () => {
    console.log("Chat button clicked, current state:", isOpen);
    toggleChat();
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className={clsx(
          "fixed bottom-6 right-6 z-40 group",
          "w-14 h-14 rounded-full",
          "bg-gradient-to-r from-purple-600 to-blue-600",
          "shadow-lg shadow-purple-500/25",
          "hover:shadow-xl hover:shadow-purple-500/30",
          "transition-all duration-300 hover:scale-110",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50",
          // ✅ Mejora: diferentes estados visuales
          isOpen && "bg-gradient-to-r from-red-600 to-pink-600"
        )}
        aria-label={isOpen ? "Cerrar chat IA" : "Abrir chat IA"}
        type="button" // ✅ Importante: evitar que se comporte como submit
      >
        {/* Sparkle animation background */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-purple-400/20 to-blue-400/20" />
          {/* ✅ Mejora: Efecto de ondas cuando está activo */}
          {isOpen && (
            <div className="absolute inset-0 animate-ping bg-gradient-to-r from-purple-400/30 to-blue-400/30" />
          )}
        </div>

        {/* Icon with smooth transition */}
        <div className="relative z-10">
          <div
            className={clsx(
              "transition-all duration-300",
              isOpen ? "rotate-180 scale-90" : "rotate-0 scale-100"
            )}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <>
                <MessageCircle className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
              </>
            )}
          </div>
        </div>

        {/* ✅ Mejora: Unread indicator más visible */}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center">
              <span className="text-xs text-white font-bold">!</span>
            </span>
          </span>
        )}

        {/* ✅ Mejora: Tooltip más responsive */}
        <div
          className={clsx(
            "absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2",
            "px-3 py-2 rounded-lg shadow-lg",
            "bg-gray-900 text-white text-sm whitespace-nowrap",
            "opacity-0 group-hover:opacity-100 transition-all duration-200",
            "pointer-events-none",
            "before:content-[''] before:absolute before:top-full before:left-1/2",
            "before:transform before:-translate-x-1/2 before:border-4",
            "before:border-transparent before:border-t-gray-900"
          )}
        >
          {isOpen ? "Cerrar asistente IA" : "Abrir asistente IA"}
        </div>
      </button>

      {/* ✅ Nuevo: Indicator de estado en la esquina */}
      {isOpen && (
        <div className="fixed bottom-20 right-8 z-30">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-white/60">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            IA Online
          </div>
        </div>
      )}
    </>
  );
};
