import { MessageCircle, X, Sparkles } from "lucide-react";
import { useAiStore } from "../../store/ai.store";
import { clsx } from "clsx";

export const AiChatButton = () => {
  const { isOpen, toggleChat, messages } = useAiStore();
  const hasUnread =
    messages.length > 0 && messages[messages.length - 1].role === "assistant";

  return (
    <button
      onClick={toggleChat}
      className={clsx(
        "fixed bottom-6 right-6 z-40 group",
        "w-14 h-14 rounded-full",
        "bg-gradient-to-r from-purple-600 to-blue-600",
        "shadow-lg shadow-purple-500/25",
        "hover:shadow-xl hover:shadow-purple-500/30",
        "transition-all duration-300 hover:scale-110",
        "flex items-center justify-center"
      )}
      aria-label={isOpen ? "Cerrar chat IA" : "Abrir chat IA"}
    >
      {/* Sparkle animation */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-purple-400/20 to-blue-400/20" />
      </div>

      {/* Icon */}
      <div className="relative">
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform duration-300" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
          </>
        )}
      </div>

      {/* Unread indicator */}
      {!isOpen && hasUnread && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}

      {/* Tooltip */}
      <div
        className={clsx(
          "absolute bottom-full mb-2 px-3 py-1 rounded-lg",
          "bg-gray-900 text-white text-sm whitespace-nowrap",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "pointer-events-none"
        )}
      >
        {isOpen ? "Cerrar asistente IA" : "Abrir asistente IA"}
      </div>
    </button>
  );
};
