import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Campaign, CampaignFilters } from "../services/campaign.service";

interface CampaignsState {
  // Data
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  totalCampaigns: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Filters
  filters: CampaignFilters;

  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSending: boolean;

  // Actions
  setCampaigns: (
    campaigns: Campaign[],
    total: number,
    totalPages: number
  ) => void;
  setSelectedCampaign: (campaign: Campaign | null) => void;
  setFilters: (filters: Partial<CampaignFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setDeleting: (deleting: boolean) => void;
  setSending: (sending: boolean) => void;

  // CRUD Operations
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  removeCampaign: (id: string) => void;
}

const initialFilters: CampaignFilters = {
  page: 1,
  pageSize: 20,
  status: [],
  type: [],
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const useCampaignsStore = create<CampaignsState>()(
  devtools(
    (set) => ({
      // Initial state
      campaigns: [],
      selectedCampaign: null,
      totalCampaigns: 0,
      currentPage: 1,
      pageSize: 20,
      totalPages: 0,
      filters: initialFilters,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isSending: false,

      // Actions
      setCampaigns: (campaigns, total, totalPages) =>
        set({ campaigns, totalCampaigns: total, totalPages }),

      setSelectedCampaign: (campaign) => set({ selectedCampaign: campaign }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: newFilters.page || state.currentPage,
        })),

      resetFilters: () => set({ filters: initialFilters, currentPage: 1 }),

      setPage: (page) =>
        set((state) => ({
          currentPage: page,
          filters: { ...state.filters, page },
        })),

      setPageSize: (pageSize) =>
        set((state) => ({
          pageSize,
          currentPage: 1,
          filters: { ...state.filters, pageSize, page: 1 },
        })),

      setLoading: (loading) => set({ isLoading: loading }),
      setCreating: (creating) => set({ isCreating: creating }),
      setUpdating: (updating) => set({ isUpdating: updating }),
      setDeleting: (deleting) => set({ isDeleting: deleting }),
      setSending: (sending) => set({ isSending: sending }),

      // CRUD Operations
      addCampaign: (campaign) =>
        set((state) => ({
          campaigns: [campaign, ...state.campaigns],
          totalCampaigns: state.totalCampaigns + 1,
        })),

      updateCampaign: (id, updatedData) =>
        set((state) => ({
          campaigns: state.campaigns.map((campaign) =>
            campaign.id === id ? { ...campaign, ...updatedData } : campaign
          ),
          selectedCampaign:
            state.selectedCampaign?.id === id
              ? { ...state.selectedCampaign, ...updatedData }
              : state.selectedCampaign,
        })),

      removeCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
          totalCampaigns: state.totalCampaigns - 1,
          selectedCampaign:
            state.selectedCampaign?.id === id ? null : state.selectedCampaign,
        })),
    }),
    {
      name: "campaigns-storage",
    }
  )
);
