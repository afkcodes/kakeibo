import { useAppStore } from '@/store';
import { useLocation } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { PieChart, Plus, Target, Wallet } from 'lucide-react';
import { useMemo } from 'react';

export const FloatingActionButton = () => {
  const { setActiveModal } = useAppStore();
  const location = useLocation();

  // Determine the appropriate action based on current route
  const fabConfig = useMemo(() => {
    const path = location.pathname;
    
    // Hide FAB on settings and analytics pages
    if (path.startsWith('/settings') || path.startsWith('/analytics')) {
      return null;
    }
    
    if (path.startsWith('/budgets')) {
      return {
        modal: 'add-budget' as const,
        icon: PieChart,
        color: 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/30',
      };
    }
    
    if (path.startsWith('/goals')) {
      return {
        modal: 'add-goal' as const,
        icon: Target,
        color: 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/30',
      };
    }
    
    if (path.startsWith('/accounts')) {
      return {
        modal: 'add-account' as const,
        icon: Wallet,
        color: 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/30',
      };
    }
    
    // Default: Dashboard, Transactions, or any other page
    return {
      modal: 'add-transaction' as const,
      icon: Plus,
      color: 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/30',
    };
  }, [location.pathname]);

  // Don't render if no config (settings/analytics pages)
  if (!fabConfig) return null;

  const Icon = fabConfig.icon;

  return (
    <AnimatePresence>
      <motion.button
        key={fabConfig.modal}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveModal(fabConfig.modal)}
        className={`fixed right-4 bottom-30 z-50 lg:hidden w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 ${fabConfig.color}`}
      >
        <Icon className="w-6 h-6 text-white" />
      </motion.button>
    </AnimatePresence>
  );
};
