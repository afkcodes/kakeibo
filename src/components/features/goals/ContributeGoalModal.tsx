import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useCurrency } from '@/hooks/useCurrency';
import { useGoalActions } from '@/hooks/useGoals';
import type { Goal } from '@/types';
import { CreditCard, Minus, PiggyBank, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ContributeGoalModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContributeGoalModal = ({ goal, isOpen, onClose }: ContributeGoalModalProps) => {
  const { formatCurrency } = useCurrency();
  const { contributeToGoal } = useGoalActions();
  
  const [amount, setAmount] = useState('');
  const [isWithdraw, setIsWithdraw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setIsWithdraw(false);
    }
  }, [isOpen]);

  if (!goal) return null;

  const remaining = goal.targetAmount - goal.currentAmount;
  const percentage = (goal.currentAmount / goal.targetAmount) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    // For withdraw, check we don't go below 0
    if (isWithdraw && numAmount > goal.currentAmount) {
      return;
    }

    setIsSubmitting(true);
    try {
      await contributeToGoal(goal.id, isWithdraw ? -numAmount : numAmount);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isWithdraw ? 'Withdraw from Goal' : 'Add to Goal'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Goal Info */}
        <div className="flex items-center gap-3 p-3 bg-surface-700/30 rounded-xl">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: (goal.color || '#5B6EF5') + '18', color: goal.color || '#5B6EF5' }}
          >
            {goal.type === 'savings' ? (
              <PiggyBank className="w-5 h-5" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-surface-100 text-[14px] font-semibold truncate">{goal.name}</p>
            <p className="text-surface-500 text-[13px]">
              {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-primary-400 font-bold text-[14px]">{percentage.toFixed(0)}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300 bg-primary-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[12px] text-surface-500">
            <span>Remaining: {formatCurrency(remaining)}</span>
            <span>{percentage.toFixed(1)}% complete</span>
          </div>
        </div>

        {/* Add/Withdraw Toggle */}
        <div className="flex gap-2 p-1 bg-surface-700/30 rounded-xl">
          <button
            type="button"
            onClick={() => setIsWithdraw(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] font-medium transition-colors ${
              !isWithdraw 
                ? 'bg-success-500/20 text-success-400' 
                : 'text-surface-400 hover:text-surface-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Money
          </button>
          <button
            type="button"
            onClick={() => setIsWithdraw(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] font-medium transition-colors ${
              isWithdraw 
                ? 'bg-danger-500/20 text-danger-400' 
                : 'text-surface-400 hover:text-surface-300'
            }`}
          >
            <Minus className="w-4 h-4" />
            Withdraw
          </button>
        </div>

        {/* Amount Input */}
        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          max={isWithdraw ? goal.currentAmount : undefined}
          required
        />

        {/* Quick Amount Buttons */}
        <div className="space-y-2">
          <p className="text-surface-500 text-[12px] font-medium">Quick amounts</p>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                className="py-2 px-3 bg-surface-700/50 hover:bg-surface-700 text-surface-300 text-[13px] font-medium rounded-lg transition-colors"
              >
                {quickAmount >= 1000 ? `${quickAmount / 1000}K` : quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {amount && parseFloat(amount) > 0 && (
          <div className="p-3 bg-surface-700/30 rounded-xl space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-surface-500">Current amount</span>
              <span className="text-surface-300">{formatCurrency(goal.currentAmount)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-surface-500">{isWithdraw ? 'Withdrawing' : 'Adding'}</span>
              <span className={isWithdraw ? 'text-danger-400' : 'text-success-400'}>
                {isWithdraw ? '-' : '+'}{formatCurrency(parseFloat(amount))}
              </span>
            </div>
            <div className="border-t border-surface-700/50 pt-2 flex justify-between text-[13px]">
              <span className="text-surface-400 font-medium">New amount</span>
              <span className="text-surface-100 font-semibold">
                {formatCurrency(
                  isWithdraw 
                    ? Math.max(0, goal.currentAmount - parseFloat(amount))
                    : goal.currentAmount + parseFloat(amount)
                )}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={!amount || parseFloat(amount) <= 0 || isSubmitting || (isWithdraw && parseFloat(amount) > goal.currentAmount)}
          >
            {isSubmitting ? 'Saving...' : isWithdraw ? 'Withdraw' : 'Add Money'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
