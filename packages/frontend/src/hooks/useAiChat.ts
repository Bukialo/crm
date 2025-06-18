import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAiStore } from "../store/ai.store";
import { aiService, AiQueryRequest } from "../services/ai.service";
import { v4 as uuidv4 } from "uuid";
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
  });

  // Obtener sugerencias
  const { data: querySuggestions } = useQuery({
    queryKey: ["ai-suggestions"],
    queryFn: () => aiService.getExampleQueries(),
    onSuccess: (data) => {
      setSuggestions(data);
    },
  });

  // Enviar mensaje
  const sendMessageMutation = useMutation({
    mutationFn: (request: AiQueryRequest) => aiService.sendQuery(request),
    onMutate: async (request) => {
      // Agregar mensaje del usuario inmediatamente
      const userMessage = {
        id: uuidv4(),
        role: "user" as const,
        content: request.query,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMessage);
      setTyping(true);
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
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }
    },
    onError: (error) => {
      toast.error("Error al procesar tu consulta");
      console.error("AI query error:", error);
    },
    onSettled: () => {
      setTyping(false);
    },
  });

  // Manejar acciones sugeridas por la IA
  const handleAction = useCallback((action: any) => {
    switch (action.type) {
      case "navigate":
        window.location.href = action.params.path;
        break;
      case "filter":
        // Implementar filtros según el contexto
        console.log("Apply filters:", action.params);
        break;
      case "create":
        // Abrir formulario de creación
        console.log("Create:", action.params);
        break;
      case "export":
        // Exportar datos
        console.log("Export:", action.params);
        break;
      default:
        console.log("Unknown action:", action);
    }
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(
    async (query: string, context?: any) => {
      if (!query.trim()) return;

      const request: AiQueryRequest = {
        query: query.trim(),
        context: {
          currentPage: window.location.pathname,
          ...context,
        },
      };

      await sendMessageMutation.mutateAsync(request);
    },
    [sendMessageMutation]
  );

  // Obtener insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: () => aiService.getInsights(),
    refetchInterval: 300000, // Actualizar cada 5 minutos
  });

  return {
    messages,
    isLoading: sendMessageMutation.isLoading,
    isTyping,
    suggestions,
    insights: insights || [],
    insightsLoading,
    sendMessage,
    clearMessages: useAiStore.getState().clearMessages,
  };
};
