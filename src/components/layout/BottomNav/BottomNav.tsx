import { cn } from '@/utils/cn';
import { Link, useLocation } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  ArrowRightLeft,
  BarChart3,
  LayoutDashboard,
  PiggyBank,
  Target,
  Wallet,
} from 'lucide-react';

const navigationItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { path: '/budgets', label: 'Budgets', icon: PiggyBank },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/accounts', label: 'Accounts', icon: Wallet },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-surface-900 border-t border-surface-700 px-1 pb-safe">
        <div className="flex items-center justify-around h-14">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 py-1.5 min-w-0"
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors duration-200',
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
                    'text-[10px] mt-0.5 font-medium transition-colors duration-200 truncate',
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
