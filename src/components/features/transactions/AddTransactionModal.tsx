import { Button, Checkbox, Input, Modal, Select } from '@/components/ui';
import { CategorySelect } from '@/components/ui/CategorySelect/CategorySelect';
import { useAccounts, useCategories, useTransactionActions } from '@/hooks';
import { useCurrency } from '@/hooks/useCurrency';
import { useAppStore } from '@/store';
import type { TransactionType } from '@/types';
import { cn } from '@/utils/cn';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ArrowRightLeft, Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const transactionSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  type: z.enum(['expense', 'income', 'transfer']),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().optional(),
  accountId: z.string().min(1, 'Account is required'),
  date: z.string().min(1, 'Date is required'),
  toAccountId: z.string().optional(),
  isEssential: z.boolean().optional(),
}).refine((data) => {
  if (data.type !== 'transfer') {
    return data.categoryId && data.categoryId.length > 0;
  }
  return true;
}, {
  message: 'Category is required',
  path: ['categoryId'],
}).refine((data) => {
  if (data.type === 'transfer') {
    return data.toAccountId && data.toAccountId.length > 0;
  }
  return true;
}, {
  message: 'Destination account is required',
  path: ['toAccountId'],
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeConfig: Record<'expense' | 'income' | 'transfer', { icon: typeof Minus; color: string; bg: string; label: string }> = {
  expense: { icon: Minus, color: 'text-danger-400', bg: 'bg-danger-500', label: 'Expense' },
  income: { icon: Plus, color: 'text-success-400', bg: 'bg-success-500', label: 'Income' },
  transfer: { icon: ArrowRightLeft, color: 'text-primary-400', bg: 'bg-primary-500', label: 'Transfer' },
};

// Currency code to symbol mapping
const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
};

export const AddTransactionModal = ({ isOpen, onClose }: AddTransactionModalProps) => {
  const { currentUserId, editingTransaction, setEditingTransaction } = useAppStore();
  const { currency } = useCurrency();
  const currencySymbol = currencySymbols[currency] || '$';
  
  const accounts = useAccounts(currentUserId);
  const categories = useCategories(currentUserId);
  const { addTransaction, updateTransaction } = useTransactionActions();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  
  const isEditing = !!editingTransaction;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      description: '',
      categoryId: '',
      accountId: '',
      isEssential: false,
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setActiveType('expense');
      reset({
        type: 'expense',
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        description: '',
        categoryId: '',
        accountId: '',
        isEssential: false,
      });
      return;
    }

    if (editingTransaction && accounts.length > 0 && categories.length > 0) {
      const txType = editingTransaction.type;
      
      if (txType === 'goal-contribution' || txType === 'goal-withdrawal') {
        onClose();
        return;
      }
      
      setActiveType(txType);
      setTimeout(() => {
        reset({
          type: txType,
          amount: Math.abs(editingTransaction.amount).toString(),
          description: editingTransaction.description,
          categoryId: editingTransaction.categoryId || '',
          accountId: editingTransaction.accountId,
          date: format(new Date(editingTransaction.date), 'yyyy-MM-dd'),
          toAccountId: editingTransaction.toAccountId || '',
          isEssential: editingTransaction.isEssential || false,
        });
      }, 0);
    }
  }, [isOpen, editingTransaction, reset, accounts.length, categories.length, onClose]);

  const filteredCategories = categories.filter(
    (c) => c.type === (activeType === 'transfer' ? 'expense' : activeType)
  );

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      const amount = parseFloat(data.amount);
      
      if (isEditing && editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          amount: data.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
          type: data.type,
          description: data.description,
          categoryId: data.categoryId || undefined,
          accountId: data.accountId,
          date: new Date(data.date),
          toAccountId: data.toAccountId,
          isEssential: data.type === 'expense' ? data.isEssential : undefined,
        });
      } else {
        await addTransaction(
          {
            amount: data.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            type: data.type,
            description: data.description,
            categoryId: data.categoryId || 'transfer',
            accountId: data.accountId,
            date: new Date(data.date),
            toAccountId: data.toAccountId,
            isEssential: data.type === 'expense' ? data.isEssential : undefined,
          },
          currentUserId
        );
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setEditingTransaction(null);
    onClose();
  };

  const currentTypeConfig = typeConfig[activeType as 'expense' | 'income' | 'transfer'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Transaction' : 'Add Transaction'}
      size="md"
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="flex-1"
          >
            {isEditing ? 'Save' : 'Add'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type Selector - Tab style */}
        <div className="flex bg-surface-800 rounded-lg p-1">
          {(['expense', 'income', 'transfer'] as const).map((type) => {
            const config = typeConfig[type];
            const Icon = config.icon;
            const isActive = activeType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setActiveType(type);
                  reset({ ...watch(), type, categoryId: '' });
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? `${config.bg} text-white`
                    : 'text-surface-400 hover:text-surface-200'
                )}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>

        <input type="hidden" {...register('type')} value={activeType} />

        {/* Amount - With type color indicator */}
        <div className={cn(
          'flex items-center gap-2 px-3 h-11 rounded-xl border transition-colors',
          activeType === 'expense' && 'border-danger-500/50 bg-danger-500/5',
          activeType === 'income' && 'border-success-500/50 bg-success-500/5',
          activeType === 'transfer' && 'border-primary-500/50 bg-primary-500/5',
        )}>
          <span className={cn('flex items-center gap-0.5 text-base font-medium', currentTypeConfig.color)}>
            {activeType === 'expense' && <Minus className="w-4 h-4" />}
            {activeType === 'income' && <Plus className="w-4 h-4" />}
            {currencySymbol}
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('amount')}
            className={cn(
              'flex-1 bg-transparent text-base font-semibold outline-none h-full',
              currentTypeConfig.color,
              'placeholder:text-surface-500 placeholder:font-normal'
            )}
          />
        </div>
        {errors.amount && (
          <p className="text-danger-400 text-xs -mt-2">{errors.amount.message}</p>
        )}

        {/* Description - Important marker for what the transaction is for */}
        <Input
          label="Description"
          placeholder="What's this for?"
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Category or Transfer Accounts */}
        {activeType === 'transfer' ? (
          <div className="flex items-center gap-2">
            <Controller
              name="accountId"
              control={control}
              render={({ field }) => (
                <Select
                  label="From"
                  options={accounts.map((a) => ({ value: a.id, label: a.name }))}
                  placeholder="Account"
                  error={errors.accountId?.message}
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex-1"
                />
              )}
            />
            <ArrowRightLeft className="w-4 h-4 text-surface-500 mt-6 shrink-0" />
            <Controller
              name="toAccountId"
              control={control}
              render={({ field }) => (
                <Select
                  label="To"
                  options={accounts
                    .filter((a) => a.id !== watch('accountId'))
                    .map((a) => ({ value: a.id, label: a.name }))}
                  placeholder="Account"
                  error={errors.toAccountId?.message}
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  className="flex-1"
                />
              )}
            />
          </div>
        ) : (
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <CategorySelect
                label="Category"
                options={filteredCategories.map((c) => ({
                  value: c.id,
                  label: c.name,
                  icon: c.icon,
                  color: c.color,
                }))}
                placeholder="Search categories..."
                error={errors.categoryId?.message}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        )}

        {/* Account & Date - Side by side for non-transfers */}
        {activeType !== 'transfer' && (
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="accountId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Account"
                  options={accounts.map((a) => ({ value: a.id, label: a.name }))}
                  placeholder="Select"
                  error={errors.accountId?.message}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Input
              label="Date"
              type="date"
              error={errors.date?.message}
              {...register('date')}
            />
          </div>
        )}

        {/* Date for transfers */}
        {activeType === 'transfer' && (
          <Input
            label="Date"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />
        )}

        {/* Essential expense checkbox - only for expenses */}
        {activeType === 'expense' && (
          <Controller
            name="isEssential"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="Essential expense"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        )}
      </form>
    </Modal>
  );
};
