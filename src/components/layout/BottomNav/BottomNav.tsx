import { cn } from '@/utils/cn';
import { Link, useLocation } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  ArrowRightLeft,
  BarChart3,
  LayoutDashboard,
  PiggyBank,
  Wallet,
} from 'lucide-react';

const navigationItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { path: '/budgets', label: 'Budgets', icon: PiggyBank },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/accounts', label: 'Accounts', icon: Wallet },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-surface-900 border-t border-surface-700 px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

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
