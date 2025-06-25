import { useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAiStore } from "../store/ai.store";
import { aiService, AiQueryRequest } from "../services/ai.service";
import toast from "react-hot-toast";

export const useAiChat = () => {
  const {
    messages,
    isLoading,
    isTyping,
    suggestions,
    addMessage,
    setLoading,
    setTyping,
    setSuggestions,
    clearMessages,
  } = useAiStore();

  // ✅ Inicializar sugerencias solo si están vacías
  if (suggestions.length === 0) {
    setSuggestions(aiService.getExampleQueries().slice(0, 4));
  }

  // ✅ Mutation mejorada para enviar mensajes
  const sendMessageMutation = useMutation({
    mutationFn: (request: AiQueryRequest) => {
      console.log("🚀 Sending message mutation:", request);
      return aiService.sendQuery(request);
    },
    onMutate: async (request) => {
      console.log("⏳ Starting message send...");

      // ✅ Validar request antes de procesar
      if (!request.query || request.query.trim().length === 0) {
        throw new Error("No se puede enviar un mensaje vacío");
      }

      // Agregar mensaje del usuario inmediatamente
      const userMessage = aiService.createUserMessage(request.query);
      addMessage(userMessage);

      // Establecer estados de carga
      setTyping(true);
      setLoading(true);

      return { userMessage };
    },
    onSuccess: (response, _request) => {
      console.log("✅ Message sent successfully:", response);

      // ✅ Validar respuesta antes de procesarla
      if (!response || !response.message) {
        console.error("❌ Invalid response structure");
        throw new Error("Respuesta inválida del servidor");
      }

      // Agregar respuesta de la IA
      addMessage(response.message);

      // ✅ Procesar acciones sugeridas si existen
      if (response.actions && response.actions.length > 0) {
        console.log("🎯 Processing actions:", response.actions);
        response.actions.forEach((action) => {
          handleAction(action);
        });
      }

      // ✅ Actualizar sugerencias si las hay
      if (response.suggestions && response.suggestions.length > 0) {
        console.log("💡 Updating suggestions:", response.suggestions);
        setSuggestions(response.suggestions);
      }

      // ✅ Mostrar toast de éxito solo en desarrollo
      if (import.meta.env.DEV) {
        toast.success("Respuesta recibida");
      }
    },
    onError: (error: any, _request) => {
      console.error("❌ Message send failed:", error);

      // ✅ Crear mensaje de error más específico
      let errorMessage = "Lo siento, hubo un error procesando tu consulta.";

      if (error.message) {
        if (error.message.includes("empty")) {
          errorMessage = "Por favor, escribe una consulta válida.";
        } else if (error.message.includes("network")) {
          errorMessage = "Problemas de conexión. Verifica tu internet.";
        } else if (error.message.includes("timeout")) {
          errorMessage =
            "La consulta tardó demasiado. Intenta con algo más simple.";
        }
      }

      const errorAiMessage = {
        id: aiService.generateMessageId(),
        role: "assistant" as const,
        content: errorMessage,
        timestamp: new Date().toISOString(),
        metadata: {
          type: "text" as const,
          suggestions: [
            "¿Cuántos contactos tengo?",
            "Mostrar resumen de hoy",
            "¿Cómo están mis ventas?",
          ],
        },
      };

      addMessage(errorAiMessage);
      toast.error("Error al procesar consulta");
    },
    onSettled: () => {
      console.log("🏁 Message send completed");
      setTyping(false);
      setLoading(false);
    },
  });

  // ✅ Manejar acciones sugeridas por la IA
  const handleAction = useCallback((action: any) => {
    console.log("🎯 Handling action:", action);

    try {
      switch (action.type) {
        case "navigate":
          if (action.params?.path) {
            console.log("🧭 Navigating to:", action.params.path);
            // En una app real usarías useNavigate de react-router
            window.location.href = action.params.path;
          }
          break;

        case "filter":
          console.log("🔍 Applying filters:", action.params);
          toast.success(`Filtros aplicados: ${action.label}`);
          break;

        case "create":
          console.log("➕ Creating:", action.params);
          toast.success(`Creando: ${action.label}`);
          break;

        case "export":
          console.log("📤 Exporting:", action.params);
          toast.success(`Exportando: ${action.label}`);
          break;

        case "update":
          console.log("🔄 Updating:", action.params);
          toast.success(`Actualizando: ${action.label}`);
          break;

        default:
          console.log("❓ Unknown action type:", action.type);
          toast.success(`Acción disponible: ${action.label}`);
      }
    } catch (error) {
      console.error("❌ Action handling failed:", error);
      toast.error(`Error ejecutando acción: ${action.label}`);
    }
  }, []);

  // ✅ Función principal para enviar mensajes
  const sendMessage = useCallback(
    async (query: string, context?: any) => {
      console.log("📤 Send message called:", { query, context });

      // ✅ Validaciones mejoradas
      if (!query || typeof query !== "string") {
        toast.error("Por favor, escribe un mensaje válido");
        return;
      }

      const trimmedQuery = query.trim();
      if (trimmedQuery.length === 0) {
        toast.error("No se puede enviar un mensaje vacío");
        return;
      }

      if (trimmedQuery.length > 500) {
        toast.error("El mensaje es demasiado largo. Máximo 500 caracteres.");
        return;
      }

      // ✅ Prevenir envío múltiple
      if (sendMessageMutation.isPending || isLoading) {
        console.warn("⚠️ Message already sending, ignoring");
        return;
      }

      // Limpiar query y crear request
      const cleanQuery = aiService.sanitizeQuery(trimmedQuery);
      const request: AiQueryRequest = {
        query: cleanQuery,
        context: {
          ...aiService.getApplicationContext(),
          ...context,
        },
      };

      try {
        await sendMessageMutation.mutateAsync(request);
      } catch (error) {
        console.error("❌ Send message error:", error);
        // El error ya se maneja en onError del mutation
      }
    },
    [sendMessageMutation, isLoading]
  );

  // ✅ Query para insights (deshabilitado hasta que el backend esté listo)
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: () => aiService.getInsights(),
    enabled: false, // ✅ Deshabilitado hasta que funcione el backend
    refetchInterval: 5 * 60 * 1000, // 5 minutos
    staleTime: 60 * 1000, // 1 minuto
    retry: 1,
  });

  // ✅ Función mejorada para limpiar mensajes
  const handleClearMessages = useCallback(() => {
    console.log("🧹 Clearing messages");
    clearMessages();
    setSuggestions(aiService.getExampleQueries().slice(0, 4));
    toast.success("Chat limpiado");
  }, [clearMessages, setSuggestions]);

  return {
    // Estado
    messages,
    isLoading: sendMessageMutation.isPending || isLoading,
    isTyping,
    suggestions:
      suggestions.length > 0
        ? suggestions
        : aiService.getExampleQueries().slice(0, 4),
    insights: insights || [],
    insightsLoading,

    // Acciones
    sendMessage,
    clearMessages: handleClearMessages,

    // Estados adicionales útiles
    canSendMessage: !sendMessageMutation.isPending && !isLoading && !isTyping,
    hasMessages: messages.length > 0,
    isConnected: true, // Podrías implementar lógica de conexión real
    lastError: sendMessageMutation.error,

    // Métodos de utilidad
    retryLastMessage: () => {
      if (messages.length >= 2) {
        const lastUserMessage = messages[messages.length - 2];
        if (lastUserMessage.role === "user") {
          sendMessage(lastUserMessage.content);
        }
      }
    },
  };
};
