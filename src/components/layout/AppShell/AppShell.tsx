import { AddAccountModal } from '@/components/features/accounts';
import { AddBudgetModal } from '@/components/features/budgets';
import { AddGoalModal } from '@/components/features/goals';
import { AddTransactionModal } from '@/components/features/transactions';
import { useCategoryActions } from '@/hooks';
import { useAppStore } from '@/store';
import { Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { BottomNav } from '../BottomNav';
import { Navbar } from '../Navbar';
import { Sidebar } from '../Sidebar';

const DEFAULT_USER_ID = 'default-user';

export const AppShell = () => {
  const { sidebarOpen, activeModal, setActiveModal, currentUserId, setCurrentUserId } = useAppStore();
  const { initializeDefaultCategories } = useCategoryActions();

  // Initialize default user and data on first load
  useEffect(() => {
    const initializeApp = async () => {
      if (!currentUserId) {
        setCurrentUserId(DEFAULT_USER_ID);
      }
      
      // Initialize default categories (needed for transactions to work)
      await initializeDefaultCategories(DEFAULT_USER_ID);
    };

    initializeApp();
  }, []);

  // Apply theme
  useEffect(() => {
    const { theme } = useAppStore.getState();
    const root = document.documentElement;
    
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="px-4 py-6 pb-24 lg:pb-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Modals */}
      <AddTransactionModal
        isOpen={activeModal === 'add-transaction'}
        onClose={() => setActiveModal(null)}
      />
      <AddBudgetModal />
      <AddGoalModal />
      <AddAccountModal />
    </div>
  );
};
