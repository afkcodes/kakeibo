import { PWAPrompts } from '@/components/common/PWAPrompts';
import { AddAccountModal } from '@/components/features/accounts';
import { AddBudgetModal } from '@/components/features/budgets';
import { AddGoalModal } from '@/components/features/goals';
import { AddTransactionModal } from '@/components/features/transactions';
import { useCategoryActions } from '@/hooks';
import { useAppStore } from '@/store';
import { Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { BottomNav } from '../BottomNav';
import { FloatingActionButton } from '../FloatingActionButton';
import { Navbar } from '../Navbar';
import { Sidebar } from '../Sidebar';

export const AppShell = () => {
  const { sidebarOpen, activeModal, setActiveModal, currentUserId } = useAppStore();
  const { initializeDefaultCategories } = useCategoryActions();

  // Initialize default categories on first load
  useEffect(() => {
    initializeDefaultCategories(currentUserId);
  }, [currentUserId, initializeDefaultCategories]);

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
        {/* Top Navbar - Desktop only */}
        <Navbar className="hidden lg:flex" />

        {/* Page Content */}
        <main className="px-4 py-4 pb-24 lg:py-6 lg:pb-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Floating Action Button - Mobile only */}
      <FloatingActionButton />

      {/* Modals */}
      <AddTransactionModal
        isOpen={activeModal === 'add-transaction'}
        onClose={() => setActiveModal(null)}
      />
      <AddBudgetModal />
      <AddGoalModal />
      <AddAccountModal />
      
      {/* PWA Install/Update Prompts */}
      <PWAPrompts />
    </div>
  );
};
