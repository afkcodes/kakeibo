import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useAccountsWithBalance } from '@/hooks/useAccounts';
import { useCurrency } from '@/hooks/useCurrency';
import { useGoalActions } from '@/hooks/useGoals';
import { useAppStore } from '@/store';
import type { Goal } from '@/types';
import { AlertCircle, Minus, Plus, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ContributeGoalModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContributeGoalModal = ({ goal, isOpen, onClose }: ContributeGoalModalProps) => {
  const { formatCurrency } = useCurrency();
  const { contributeToGoal, withdrawFromGoal } = useGoalActions();
  const { currentUserId } = useAppStore();
  const accounts = useAccountsWithBalance();
  
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isWithdraw, setIsWithdraw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get active accounts with positive balance (for contributions)
  const availableAccounts = accounts.filter(a => a.isActive);
  
  // Get the selected account
  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setIsWithdraw(false);
      setError('');
      // Pre-select first account if available
      if (availableAccounts.length > 0 && !selectedAccountId) {
        setSelectedAccountId(availableAccounts[0].id);
      }
    }
  }, [isOpen, availableAccounts.length]);

  if (!goal) return null;

  const percentage = (goal.currentAmount / goal.targetAmount) * 100;

  // Validation
  const numAmount = parseFloat(amount) || 0;
  const hasValidAmount = numAmount > 0;
  const hasSelectedAccount = !!selectedAccountId;
  
  // For contributions, check if account has enough balance
  const accountHasEnoughBalance = !isWithdraw && selectedAccount ? selectedAccount.balance >= numAmount : true;
  
  // For withdrawals, check if goal has enough amount
  const goalHasEnoughBalance = isWithdraw ? goal.currentAmount >= numAmount : true;

  const canSubmit = hasValidAmount && hasSelectedAccount && accountHasEnoughBalance && goalHasEnoughBalance && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      if (isWithdraw) {
        await withdrawFromGoal(goal.id, numAmount, selectedAccountId, currentUserId);
      } else {
        await contributeToGoal(goal.id, numAmount, selectedAccountId, currentUserId);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  // Account options for the select dropdown
  const accountOptions = availableAccounts.map(account => ({
    value: account.id,
    label: `${account.name} (${formatCurrency(account.balance)})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isWithdraw ? 'Withdraw from Goal' : 'Add to Goal'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Progress indicator with styled amount */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-surface-100 font-semibold text-[15px] font-amount">
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className="text-surface-500 text-[12px]">
              of {formatCurrency(goal.targetAmount)} ({percentage.toFixed(0)}%)
            </span>
          </div>
          <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-linear-to-r from-primary-500 to-primary-400"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Add/Withdraw Toggle */}
        <div className="flex gap-2 p-1 bg-surface-700/30 rounded-lg">
          <button
            type="button"
            onClick={() => setIsWithdraw(false)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[12px] font-medium transition-colors ${
              !isWithdraw 
                ? 'bg-success-500/20 text-success-400' 
                : 'text-surface-400 hover:text-surface-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsWithdraw(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[12px] font-medium transition-colors ${
              isWithdraw 
                ? 'bg-danger-500/20 text-danger-400' 
                : 'text-surface-400 hover:text-surface-300'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
            Withdraw
          </button>
        </div>

        {/* Account Selection */}
        <div className="space-y-1.5">
          <label className="text-surface-300 text-[12px] font-medium flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            {isWithdraw ? 'To Account' : 'From Account'}
          </label>
          {availableAccounts.length > 0 ? (
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
              options={accountOptions}
              placeholder="Select an account"
            />
          ) : (
            <div className="p-2 bg-warning-500/10 border border-warning-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-warning-400" />
              <span className="text-warning-400 text-[12px]">No accounts available</span>
            </div>
          )}
        </div>

        {/* Amount Input with Quick Amounts */}
        <div className="space-y-2">
          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            max={isWithdraw ? goal.currentAmount : selectedAccount?.balance}
            required
            error={
              !accountHasEnoughBalance 
                ? 'Insufficient balance' 
                : !goalHasEnoughBalance 
                  ? 'Exceeds goal amount'
                  : undefined
            }
          />
          <div className="flex gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                className="flex-1 py-1.5 bg-surface-700/50 hover:bg-surface-700 text-surface-300 text-[12px] font-medium rounded-md transition-colors"
              >
                {quickAmount >= 1000 ? `${quickAmount / 1000}K` : quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Preview */}
        {hasValidAmount && hasSelectedAccount && (
          <div className="p-2.5 bg-surface-700/30 rounded-lg grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-surface-500">Account:</span>
              <span className="text-surface-300">{formatCurrency(selectedAccount?.balance || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">→ New:</span>
              <span className={isWithdraw ? 'text-success-400' : 'text-danger-400'}>
                {formatCurrency(
                  isWithdraw 
                    ? (selectedAccount?.balance || 0) + numAmount
                    : (selectedAccount?.balance || 0) - numAmount
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Goal:</span>
              <span className="text-surface-300">{formatCurrency(goal.currentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">→ New:</span>
              <span className={isWithdraw ? 'text-danger-400' : 'text-success-400'}>
                {formatCurrency(
                  isWithdraw 
                    ? Math.max(0, goal.currentAmount - numAmount)
                    : goal.currentAmount + numAmount
                )}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-2 bg-danger-500/10 border border-danger-500/30 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-danger-400" />
            <span className="text-danger-400 text-[12px]">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
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
            variant={isWithdraw ? 'danger' : 'primary'}
            className="flex-1"
            disabled={!canSubmit}
          >
            {isSubmitting ? 'Processing...' : isWithdraw ? 'Withdraw' : 'Add Money'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
