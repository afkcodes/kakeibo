import { useAppStore } from '@/store';
import { cn } from '@/utils/cn';
import { Link, useLocation } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
    ArrowRightLeft,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    PiggyBank,
    Settings,
    Target,
    Wallet,
} from 'lucide-react';

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { path: '/budgets', label: 'Budgets', icon: PiggyBank },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/accounts', label: 'Accounts', icon: Wallet },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col',
          'bg-surface-900 border-r border-surface-700/50',
          'transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-700/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-white"
              >
                Budgeto
              </motion.span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  'hover:bg-surface-700/50',
                  isActive &&
                    'bg-primary-500/20 text-primary-400 border border-primary-500/30',
                  !isActive && 'text-surface-300',
                  !sidebarOpen && 'justify-center'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0')} />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-surface-700/50">
          <button
            onClick={toggleSidebar}
            className={cn(
              'flex items-center justify-center w-full gap-2 px-3 py-2 rounded-xl',
              'text-surface-400 hover:bg-surface-700/50 hover:text-surface-200',
              'transition-colors duration-200'
            )}
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Collapse</span>
              </>
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
