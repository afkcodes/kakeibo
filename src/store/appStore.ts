import type { Budget, Goal, Transaction } from '@/types';
import type { UserSettings } from '@/types/user';
import { defaultUserSettings } from '@/types/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // User settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Current user ID (for offline-first app)
  currentUserId: string | null;
  setCurrentUserId: (userId: string | null) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Modal states
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  
  // Editing transaction
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;

  // Editing budget
  editingBudget: Budget | null;
  setEditingBudget: (budget: Budget | null) => void;

  // Editing goal
  editingGoal: Goal | null;
  setEditingGoal: (goal: Goal | null) => void;

  // Reset store
  resetStore: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User settings
      settings: defaultUserSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // UI state
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Current user
      currentUserId: null,
      setCurrentUserId: (userId) => set({ currentUserId: userId }),

      // Loading
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Modals
      activeModal: null,
      setActiveModal: (modal) => set({ activeModal: modal }),
      
      // Editing transaction
      editingTransaction: null,
      setEditingTransaction: (transaction) => set({ editingTransaction: transaction }),

      // Editing budget
      editingBudget: null,
      setEditingBudget: (budget) => set({ editingBudget: budget }),

      // Editing goal
      editingGoal: null,
      setEditingGoal: (goal) => set({ editingGoal: goal }),

      // Reset store to initial state
      resetStore: () => set({
        settings: defaultUserSettings,
        sidebarOpen: true,
        theme: 'system',
        currentUserId: null,
        isLoading: false,
        activeModal: null,
        editingTransaction: null,
        editingBudget: null,
        editingGoal: null,
      }),
    }),
    {
      name: 'kakeibo-app-store',
      partialize: (state) => ({
        settings: state.settings,
        theme: state.theme,
        currentUserId: state.currentUserId,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
