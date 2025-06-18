import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { AiMessage } from "../services/ai.service";

interface AiState {
  // Chat state
  messages: AiMessage[];
  isOpen: boolean;
  isLoading: boolean;
  isTyping: boolean;

  // Suggestions
  suggestions: string[];

  // Actions
  addMessage: (message: AiMessage) => void;
  setMessages: (messages: AiMessage[]) => void;
  clearMessages: () => void;
  toggleChat: () => void;
  setOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  setSuggestions: (suggestions: string[]) => void;
}

export const useAiStore = create<AiState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        messages: [],
        isOpen: false,
        isLoading: false,
        isTyping: false,
        suggestions: [],

        // Actions
        addMessage: (message) =>
          set((state) => ({
            messages: [...state.messages, message],
          })),

        setMessages: (messages) => set({ messages }),

        clearMessages: () => set({ messages: [] }),

        toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

        setOpen: (isOpen) => set({ isOpen }),

        setLoading: (isLoading) => set({ isLoading }),

        setTyping: (isTyping) => set({ isTyping }),

        setSuggestions: (suggestions) => set({ suggestions }),
      }),
      {
        name: "ai-chat-storage",
        partialize: (state) => ({ messages: state.messages.slice(-20) }), // Solo guardar últimos 20 mensajes
      }
    )
  )
);
