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
    setMessages,
    setLoading,
    setTyping,
    setSuggestions,
  } = useAiStore();

  // Cargar historial de chat
  const { data: chatHistory } = useQuery({
    queryKey: ["ai-chat-history"],
    queryFn: () => aiService.getChatHistory(),
    onSuccess: (data) => {
      if (messages.length === 0 && data.length > 0) {
        setMessages(data);
      }
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
  });

  // Obtener sugerencias
  const { data: querySuggestions } = useQuery({
    queryKey: ["ai-suggestions"],
    queryFn: () => aiService.getExampleQueries(),
    onSuccess: (data) => {
      if (suggestions.length === 0) {
        setSuggestions(data);
      }
    },
    staleTime: 10 * 60 * 1000, // Cache por 10 minutos
  });

  // Enviar mensaje
  const sendMessageMutation = useMutation({
    mutationFn: (request: AiQueryRequest) => aiService.sendQuery(request),
    onMutate: async (request) => {
      // Agregar mensaje del usuario inmediatamente
      const userMessage = aiService.createUserMessage(request.query);
      addMessage(userMessage);
      setTyping(true);
      setLoading(true);
      return { userMessage };
    },
    onSuccess: (response) => {
      // Agregar respuesta de la IA
      addMessage(response.message);

      // Manejar acciones sugeridas
      if (response.actions && response.actions.length > 0) {
        response.actions.forEach((action) => {
          handleAction(action);
        });
      }

      // Actualizar sugerencias si las hay
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    },
    onError: (error: any) => {
      console.error("AI query error:", error);

      // Agregar mensaje de error para el usuario
      const errorMessage = {
        id: aiService.generateMessageId(),
        role: "assistant" as const,
        content:
          "Lo siento, hubo un error procesando tu consulta. Por favor, intenta de nuevo.",
        timestamp: new Date().toISOString(),
        metadata: { type: "text" as const },
      };
      addMessage(errorMessage);

      toast.error("Error al procesar tu consulta");
    },
    onSettled: () => {
      setTyping(false);
      setLoading(false);
    },
  });

  // Manejar acciones sugeridas por la IA
  const handleAction = useCallback((action: any) => {
    switch (action.type) {
      case "navigate":
        if (action.params?.path) {
          window.location.href = action.params.path;
        }
        break;
      case "filter":
        // Implementar filtros según el contexto
        console.log("Apply filters:", action.params);
        toast.info(`Aplicando filtros: ${action.label}`);
        break;
      case "create":
        // Abrir formulario de creación
        console.log("Create:", action.params);
        toast.info(`Crear: ${action.label}`);
        break;
      case "export":
        // Exportar datos
        console.log("Export:", action.params);
        toast.info(`Exportando: ${action.label}`);
        break;
      case "update":
        // Actualizar datos
        console.log("Update:", action.params);
        toast.info(`Actualizando: ${action.label}`);
        break;
      default:
        console.log("Unknown action:", action);
    }
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(
    async (query: string, context?: any) => {
      if (!query.trim()) {
        toast.error("Por favor, escribe un mensaje");
        return;
      }

      // Limpiar query
      const cleanQuery = aiService.sanitizeQuery(query);

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
        console.error("Error sending message:", error);
      }
    },
    [sendMessageMutation]
  );

  // Obtener insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: () => aiService.getInsights(),
    refetchInterval: 5 * 60 * 1000, // Actualizar cada 5 minutos
    staleTime: 60 * 1000, // Cache por 1 minuto
    onError: (error) => {
      console.error("Error loading insights:", error);
    },
  });

  return {
    messages,
    isLoading: sendMessageMutation.isLoading || isLoading,
    isTyping,
    suggestions:
      suggestions.length > 0 ? suggestions : aiService.getExampleQueries(),
    insights: insights || [],
    insightsLoading,
    sendMessage,
    clearMessages: useAiStore.getState().clearMessages,

    // Estados adicionales
    canSendMessage: !sendMessageMutation.isLoading && !isLoading,
    hasMessages: messages.length > 0,
  };
};
