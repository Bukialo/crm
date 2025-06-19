import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Automation, AutomationFilters } from "../services/automation.service";

interface AutomationState {
  // Data
  automations: Automation[];
  selectedAutomation: Automation | null;

  // Filters
  filters: AutomationFilters;

  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Form state
  showForm: boolean;
  editingAutomation: Automation | null;

  // Builder state
  showBuilder: boolean;
  builderStep: number;
  draftAutomation: Partial<Automation> | null;

  // Actions
  setAutomations: (automations: Automation[]) => void;
  setSelectedAutomation: (automation: Automation | null) => void;
  setFilters: (filters: Partial<AutomationFilters>) => void;
  resetFilters: () => void;

  // UI Actions
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setDeleting: (deleting: boolean) => void;

  // Form Actions
  setShowForm: (show: boolean) => void;
  setEditingAutomation: (automation: Automation | null) => void;

  // Builder Actions
  setShowBuilder: (show: boolean) => void;
  setBuilderStep: (step: number) => void;
  setDraftAutomation: (automation: Partial<Automation> | null) => void;
  nextBuilderStep: () => void;
  prevBuilderStep: () => void;
  resetBuilder: () => void;

  // CRUD Operations
  addAutomation: (automation: Automation) => void;
  updateAutomation: (id: string, automation: Partial<Automation>) => void;
  removeAutomation: (id: string) => void;
}

const initialFilters: AutomationFilters = {
  isActive: undefined,
  triggerType: undefined,
  page: 1,
  pageSize: 20,
};

export const useAutomationStore = create<AutomationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      automations: [],
      selectedAutomation: null,
      filters: initialFilters,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      showForm: false,
      editingAutomation: null,
      showBuilder: false,
      builderStep: 1,
      draftAutomation: null,

      // Actions
      setAutomations: (automations) => set({ automations }),

      setSelectedAutomation: (automation) =>
        set({ selectedAutomation: automation }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () => set({ filters: initialFilters }),

      // UI Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setCreating: (creating) => set({ isCreating: creating }),
      setUpdating: (updating) => set({ isUpdating: updating }),
      setDeleting: (deleting) => set({ isDeleting: deleting }),

      // Form Actions
      setShowForm: (show) =>
        set({
          showForm: show,
          editingAutomation: show ? get().editingAutomation : null,
        }),

      setEditingAutomation: (automation) =>
        set({
          editingAutomation: automation,
          showForm: !!automation,
        }),

      // Builder Actions
      setShowBuilder: (show) =>
        set({
          showBuilder: show,
          builderStep: show ? 1 : 1,
          draftAutomation: show ? {} : null,
        }),

      setBuilderStep: (step) => set({ builderStep: step }),

      setDraftAutomation: (automation) => set({ draftAutomation: automation }),

      nextBuilderStep: () =>
        set((state) => ({
          builderStep: Math.min(state.builderStep + 1, 4),
        })),

      prevBuilderStep: () =>
        set((state) => ({
          builderStep: Math.max(state.builderStep - 1, 1),
        })),

      resetBuilder: () =>
        set({
          showBuilder: false,
          builderStep: 1,
          draftAutomation: null,
        }),

      // CRUD Operations
      addAutomation: (automation) =>
        set((state) => ({
          automations: [automation, ...state.automations],
        })),

      updateAutomation: (id, updatedData) =>
        set((state) => ({
          automations: state.automations.map((automation) =>
            automation.id === id
              ? { ...automation, ...updatedData }
              : automation
          ),
          selectedAutomation:
            state.selectedAutomation?.id === id
              ? { ...state.selectedAutomation, ...updatedData }
              : state.selectedAutomation,
        })),

      removeAutomation: (id) =>
        set((state) => ({
          automations: state.automations.filter(
            (automation) => automation.id !== id
          ),
          selectedAutomation:
            state.selectedAutomation?.id === id
              ? null
              : state.selectedAutomation,
        })),
    }),
    {
      name: "automation-storage",
    }
  )
);
