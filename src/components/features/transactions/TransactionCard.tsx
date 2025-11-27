import { CategoryIcon } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ArrowLeftRight, ArrowRight, MoreVertical, Pencil, Target, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface TransactionCardProps {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer' | 'goal-contribution' | 'goal-withdrawal';
  date: string;
  category?: {
    name: string;
    icon?: string;
    color?: string;
  };
  goalName?: string;
  accountName?: string;
  toAccountName?: string;
  formatCurrency: (amount: number) => string;
  formatDate?: (date: string) => string;
  onEdit?: () => void;
  onDelete: () => void;
  variant?: 'default' | 'compact';
}

export const TransactionCard = ({
  description,
  amount,
  type,
  date,
  category,
  goalName,
  accountName,
  toAccountName,
  formatCurrency,
  formatDate,
  onEdit,
  onDelete,
  variant = 'default',
}: TransactionCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isExpense = type === 'expense';
  const isIncome = type === 'income';
  const isTransfer = type === 'transfer';
  const isGoalContribution = type === 'goal-contribution';
  const isGoalWithdrawal = type === 'goal-withdrawal';
  const isGoalTransaction = isGoalContribution || isGoalWithdrawal;
  const isCompact = variant === 'compact';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete();
  };

  // Determine display values based on transaction type
  const getAmountColor = () => {
    if (isExpense) return 'text-danger-400';
    if (isIncome) return 'text-success-400';
    if (isGoalContribution) return 'text-primary-400';
    if (isGoalWithdrawal) return 'text-warning-400';
    if (isTransfer) return 'text-primary-400';
    return 'text-primary-400';
  };

  const getAmountPrefix = () => {
    if (isExpense || isGoalContribution) return '−';
    if (isIncome || isGoalWithdrawal) return '+';
    return '';
  };

  const getIconColor = () => {
    if (isGoalTransaction) return '#5B6EF5'; // Primary color for goals
    if (isTransfer) return '#8b5cf6'; // Purple for transfers
    return category?.color || '#6b7280';
  };

  const getDisplayName = () => {
    if (isGoalTransaction && goalName) return goalName;
    if (isTransfer) {
      // For transfers, show description as title
      return description || 'Transfer';
    }
    return description || category?.name || 'Transaction';
  };

  const getSubtitle = (): string | null => {
    if (isGoalContribution) return 'Savings Goal';
    if (isGoalWithdrawal) return 'Goal Withdrawal';
    if (isTransfer) return null; // Handled separately with icon
    return category?.name || 'Uncategorized';
  };

  const renderSubtitle = () => {
    if (isTransfer) {
      const from = accountName || 'Account';
      const to = toAccountName || 'Account';
      return (
        <span className="inline-flex items-center gap-1">
          {from}
          <ArrowRight className="w-3 h-3 text-surface-400" />
          {to}
        </span>
      );
    }
    return getSubtitle();
  };

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 bg-surface-800/40 border border-surface-700/30 transition-colors squircle',
        isCompact ? 'p-3 rounded-xl' : 'p-3.5 rounded-xl'
      )}
    >
      {/* Category/Goal/Transfer Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 squircle"
        style={{ backgroundColor: getIconColor() + '18' }}
      >
        {isGoalTransaction ? (
          <Target className="w-5 h-5" style={{ color: getIconColor() }} />
        ) : isTransfer ? (
          <ArrowLeftRight className="w-5 h-5" style={{ color: getIconColor() }} />
        ) : (
          <CategoryIcon
            icon={category?.icon || 'more-horizontal'}
            color={category?.color}
            size="sm"
          />
        )}
      </div>

      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-surface-100 font-semibold truncate leading-tight',
            isCompact ? 'text-[13px]' : 'text-[14px]'
          )}
        >
          {getDisplayName()}
        </p>
        <p className={cn('text-surface-500 mt-0.5', isCompact ? 'text-[11px] tracking-wide' : 'text-[12px]')}>
          {renderSubtitle()}
          {formatDate && ` • ${formatDate(date)}`}
        </p>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p className={cn('font-bold font-amount text-[15px]', getAmountColor())}>
          {getAmountPrefix()}
          {formatCurrency(Math.abs(amount))}
        </p>
      </div>

      {/* 3-dot Menu Button */}
      <button
        ref={buttonRef}
        onClick={handleMenuToggle}
        className="shrink-0 p-1.5 -mr-1 rounded-lg text-surface-500 active:bg-surface-700/50 transition-colors"
        aria-label="Transaction options"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-2 top-full mt-1 z-50 bg-surface-800 border border-surface-700 rounded-xl squircle shadow-xl overflow-hidden min-w-[140px] animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Only show Edit for regular transactions, not goal transactions */}
          {!isGoalTransaction && onEdit && (
            <>
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-surface-200 active:bg-surface-700/50 transition-colors"
              >
                <Pencil className="w-4 h-4 text-surface-400" />
                <span className="text-[14px] font-medium">Edit</span>
              </button>
              <div className="h-px bg-surface-700" />
            </>
          )}
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-danger-400 active:bg-surface-700/50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[14px] font-medium">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};
