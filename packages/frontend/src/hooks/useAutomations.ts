// src/hooks/useAutomations.ts
import { useState, useEffect } from "react";
import {
  automationService,
  Automation,
  AutomationStats,
  AutomationFilters,
  CreateAutomationDto,
  UpdateAutomationDto,
  ExecuteAutomationDto,
  AutomationExecution,
} from "../services/automation.service";

export interface UseAutomationsReturn {
  // Data
  automations: Automation[];
  stats: AutomationStats;
  executionHistory: AutomationExecution[];

  // Loading states
  loading: boolean;
  statsLoading: boolean;
  executionLoading: boolean;

  // Error states
  error: string | null;

  // Actions
  createAutomation: (data: CreateAutomationDto) => Promise<Automation>;
  updateAutomation: (
    id: string,
    data: UpdateAutomationDto
  ) => Promise<Automation>;
  deleteAutomation: (id: string) => Promise<void>;
  executeAutomation: (
    params: ExecuteAutomationDto
  ) => Promise<AutomationExecution>;
  toggleAutomation: (id: string, isActive: boolean) => Promise<void>;
  refreshAutomations: (filters?: AutomationFilters) => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshExecutionHistory: (automationId?: string) => Promise<void>;

  // Filters
  filters: AutomationFilters;
  setFilters: (filters: Partial<AutomationFilters>) => void;
}

export const useAutomations = (): UseAutomationsReturn => {
  // State
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [stats, setStats] = useState<AutomationStats>({
    totalAutomations: 0,
    activeAutomations: 0,
    totalExecutions: 0,
    successRate: 0,
    executionsToday: 0,
    executionsThisWeek: 0,
    executionsThisMonth: 0,
  });
  const [executionHistory, setExecutionHistory] = useState<
    AutomationExecution[]
  >([]);
  const [filters, setFiltersState] = useState<AutomationFilters>({});

  // Loading states
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [executionLoading, setExecutionLoading] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Reload automations when filters change
  useEffect(() => {
    refreshAutomations(filters);
  }, [filters]);

  const loadInitialData = async () => {
    await Promise.all([refreshAutomations(), refreshStats()]);
  };

  const refreshAutomations = async (filterOverride?: AutomationFilters) => {
    setLoading(true);
    setError(null);

    try {
      const currentFilters = filterOverride || filters;
      const data = await automationService.getAutomations(currentFilters);
      setAutomations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error loading automations"
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    setStatsLoading(true);

    try {
      const data = await automationService.getAutomationStats();
      setStats(data);
    } catch (err) {
      console.error("Error loading automation stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshExecutionHistory = async (automationId?: string) => {
    setExecutionLoading(true);

    try {
      const data = await automationService.getExecutionHistory(automationId);
      setExecutionHistory(data);
    } catch (err) {
      console.error("Error loading execution history:", err);
    } finally {
      setExecutionLoading(false);
    }
  };

  const createAutomation = async (
    data: CreateAutomationDto
  ): Promise<Automation> => {
    try {
      const newAutomation = await automationService.createAutomation(data);
      setAutomations((prev) => [newAutomation, ...prev]);
      await refreshStats();
      return newAutomation;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error creating automation";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateAutomation = async (
    id: string,
    data: UpdateAutomationDto
  ): Promise<Automation> => {
    try {
      const updatedAutomation = await automationService.updateAutomation(
        id,
        data
      );
      setAutomations((prev) =>
        prev.map((automation) =>
          automation.id === id ? updatedAutomation : automation
        )
      );
      await refreshStats();
      return updatedAutomation;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating automation";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteAutomation = async (id: string): Promise<void> => {
    try {
      await automationService.deleteAutomation(id);
      setAutomations((prev) =>
        prev.filter((automation) => automation.id !== id)
      );
      await refreshStats();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error deleting automation";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const executeAutomation = async (
    params: ExecuteAutomationDto
  ): Promise<AutomationExecution> => {
    try {
      const execution = await automationService.executeAutomation(params);

      // Update execution count for the automation
      setAutomations((prev) =>
        prev.map((automation) =>
          automation.id === params.id
            ? {
                ...automation,
                executionCount: automation.executionCount + 1,
                lastExecuted: new Date().toISOString(),
              }
            : automation
        )
      );

      await refreshStats();
      return execution;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error executing automation";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const toggleAutomation = async (
    id: string,
    isActive: boolean
  ): Promise<void> => {
    try {
      await automationService.toggleAutomation(id, isActive);
      setAutomations((prev) =>
        prev.map((automation) =>
          automation.id === id ? { ...automation, isActive } : automation
        )
      );
      await refreshStats();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error toggling automation";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const setFilters = (newFilters: Partial<AutomationFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    // Data
    automations,
    stats,
    executionHistory,

    // Loading states
    loading,
    statsLoading,
    executionLoading,

    // Error state
    error,

    // Actions
    createAutomation,
    updateAutomation,
    deleteAutomation,
    executeAutomation,
    toggleAutomation,
    refreshAutomations,
    refreshStats,
    refreshExecutionHistory,

    // Filters
    filters,
    setFilters,
  };
};
