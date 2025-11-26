import { CategoryIcon } from '@/components/ui';
import { cn } from '@/utils/cn';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface TransactionCardProps {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  date: string;
  category?: {
    name: string;
    icon?: string;
    color?: string;
  };
  formatCurrency: (amount: number) => string;
  formatDate?: (date: string) => string;
  onEdit: () => void;
  onDelete: () => void;
  variant?: 'default' | 'compact';
}

export const TransactionCard = ({
  description,
  amount,
  type,
  date,
  category,
  formatCurrency,
  formatDate,
  onEdit,
  onDelete,
  variant = 'default',
}: TransactionCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isExpense = type === 'expense';
  const isIncome = type === 'income';
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
        setShowDeleteConfirm(false);
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
    setShowDeleteConfirm(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setShowDeleteConfirm(false);
    onDelete();
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 bg-surface-800/40 border border-surface-700/30 transition-colors squircle',
        isCompact ? 'p-3 rounded-xl' : 'p-3.5 rounded-xl'
      )}
    >
      {/* Category Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 squircle"
        style={{ backgroundColor: (category?.color || '#6b7280') + '18' }}
      >
        <CategoryIcon
          icon={category?.icon || 'more-horizontal'}
          color={category?.color}
          size="sm"
        />
      </div>

      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-surface-100 font-semibold truncate leading-tight',
            isCompact ? 'text-[13px]' : 'text-[14px]'
          )}
        >
          {description || category?.name || 'Transaction'}
        </p>
        <p className={cn('text-surface-500 mt-0.5', isCompact ? 'text-[11px] tracking-wide' : 'text-[12px]')}>
          {category?.name || 'Uncategorized'}
          {formatDate && ` • ${formatDate(date)}`}
        </p>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p
          className={cn(
            'font-bold font-amount text-[15px]',
            isExpense ? 'text-danger-400' : isIncome ? 'text-success-400' : 'text-primary-400'
          )}
        >
          {isExpense ? '−' : isIncome ? '+' : ''}
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
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-surface-200 active:bg-surface-700/50 transition-colors"
              >
                <Pencil className="w-4 h-4 text-surface-400" />
                <span className="text-[14px] font-medium">Edit</span>
              </button>
              <div className="h-px bg-surface-700" />
              <button
                onClick={handleDeleteClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-danger-400 active:bg-surface-700/50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-[14px] font-medium">Delete</span>
              </button>
            </>
          ) : (
            <div className="p-3">
              <p className="text-surface-300 text-[13px] font-medium mb-3">Delete this transaction?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-3 py-2 text-[13px] font-medium text-surface-300 bg-surface-700/50 rounded-lg active:bg-surface-600/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-3 py-2 text-[13px] font-medium text-white bg-danger-500 rounded-lg active:bg-danger-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
