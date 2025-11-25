import { useAppStore } from '@/store';
import { cn } from '@/utils/cn';
import { Link, useLocation } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  ArrowRightLeft,
  BarChart3,
  LayoutDashboard,
  PiggyBank,
  Plus,
} from 'lucide-react';

const navigationItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { path: '/add', label: 'Add', icon: Plus, isAction: true },
  { path: '/budgets', label: 'Budgets', icon: PiggyBank },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export const BottomNav = () => {
  const location = useLocation();
  const { setActiveModal } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-surface-900 border-t border-surface-700 px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <button
                  key={item.path}
                  className="flex items-center justify-center -mt-6"
                  onClick={() => setActiveModal('add-transaction')}
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30 transition-all duration-200 active:scale-95">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 py-2"
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-6 h-6 transition-colors duration-200',
                      isActive
                        ? 'text-primary-400'
                        : 'text-surface-500'
                    )}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-400 rounded-full"
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1 font-medium transition-colors duration-200',
                    isActive
                      ? 'text-primary-400'
                      : 'text-surface-500'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
