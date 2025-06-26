// src/components/ai/AiChat.tsx - VERSIÓN MEJORADA
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  RefreshCw,
  Minimize2,
  Maximize2,
  X,
} from "lucide-react";
import { useAiStore } from "../../store/ai.store";
import { useAiChat } from "../../hooks/useAiChat";
import { MessageBubble } from "./MessageBubble";
import Button from "../ui/Button";
import { clsx } from "clsx";

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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
      {/* ✅ FONDO SÓLIDO MEJORADO - Mucho más visible */}
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header con gradiente sólido */}
        <div className="p-4 bg-gradient-to-r from-purple-600/90 to-blue-600/90 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Asistente IA Bukialo</h3>
              <p className="text-xs text-white/80">
                Siempre listo para ayudarte
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title={isExpanded ? "Minimizar" : "Expandir"}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4 text-white" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={clearMessages}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Limpiar chat"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Messages Area con fondo sólido */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/90">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-white/90 mb-6 font-medium">
                ¡Hola! Soy tu asistente IA. Puedo ayudarte a:
              </p>
              <div className="space-y-2 text-sm text-white/70">
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-lg">📊</span>
                  <span>Analizar datos y generar reportes</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-lg">🔍</span>
                  <span>Buscar información de contactos y viajes</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-lg">💡</span>
                  <span>Sugerir acciones para mejorar ventas</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-lg">📈</span>
                  <span>Mostrar tendencias y estadísticas</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="bg-gray-700/90 rounded-2xl px-4 py-3 border border-white/10">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
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

        {/* Suggestions con fondo visible */}
        {suggestions.length > 0 && messages.length === 0 && (
          <div className="px-4 pb-2 bg-gray-800/90">
            <p className="text-xs text-white/70 mb-2">Sugerencias:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 rounded-full bg-gray-700/80 border border-white/20 text-xs text-white/90 hover:text-white hover:bg-gray-600/80 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area con fondo sólido y mejor contraste */}
        <div className="p-4 bg-gray-800/95 border-t border-white/20">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe tu pregunta..."
              className="flex-1 px-4 py-3 bg-gray-700/90 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              disabled={isTyping}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!input.trim() || isTyping}
              leftIcon={<Send className="w-4 h-4" />}
              className="px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Enviar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
