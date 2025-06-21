import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RefreshCw, Minimize2, Maximize2 } from "lucide-react";
import { useAiStore } from "../../store/ai.store";
import { useAiChat } from "../../hooks/useAiChat";
import { MessageBubble } from "./MessageBubble";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { clsx } from "clsx";
import { X } from "lucide-react";

export const AiChat = () => {
  const { isOpen, setOpen } = useAiStore();
  const { messages, isTyping, suggestions, sendMessage, clearMessages } =
    useAiChat();
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ✅ FIX PRINCIPAL: Función de envío corregida
  const handleSend = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault(); // ¡ESTO PREVIENE EL REFRESH!
    }

    if (input.trim() && !isTyping) {
      try {
        await sendMessage(input);
        setInput("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // ✅ FIX: Manejo de teclas mejorado
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevenir comportamiento por defecto
      handleSend(); // Llamar función de envío
    }
  };

  // ✅ FIX: Función de sugerencias corregida
  const handleSuggestionClick = async (suggestion: string) => {
    try {
      await sendMessage(suggestion);
    } catch (error) {
      console.error("Error sending suggestion:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={clsx(
        "fixed z-50 transition-all duration-300",
        isExpanded ? "inset-4" : "bottom-24 right-6 w-96 h-[600px]"
      )}
    >
      <Card className="h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Asistente IA Bukialo</h3>
              <p className="text-xs text-white/60">
                Siempre listo para ayudarte
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title={isExpanded ? "Minimizar" : "Expandir"}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4 text-white/60" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white/60" />
              )}
            </button>
            <button
              onClick={clearMessages}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Limpiar chat"
            >
              <RefreshCw className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-6">
                ¡Hola! Soy tu asistente IA. Puedo ayudarte a:
              </p>
              <div className="space-y-2 text-sm text-white/40">
                <p>📊 Analizar datos y generar reportes</p>
                <p>🔍 Buscar información de contactos y viajes</p>
                <p>💡 Sugerir acciones para mejorar ventas</p>
                <p>📈 Mostrar tendencias y estadísticas</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="glass rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && messages.length === 0 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-white/60 mb-2">Sugerencias:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 rounded-full glass text-xs text-white/80 hover:text-white hover:bg-white/20 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ✅ FIX: Input con formulario corregido */}
        <div className="p-4 border-t border-white/10">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress} // Cambiado de onKeyPress a onKeyDown
              placeholder="Escribe tu pregunta..."
              className="flex-1 input-glass"
              disabled={isTyping}
            />
            <Button
              type="submit" // ✅ Importante: tipo submit
              variant="primary"
              size="sm"
              disabled={!input.trim() || isTyping}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Enviar
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
