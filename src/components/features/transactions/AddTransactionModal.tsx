import { Button, Input, Modal, Select } from '@/components/ui';
import { CategorySelect } from '@/components/ui/CategorySelect/CategorySelect';
import { useAccounts, useCategories, useTransactionActions } from '@/hooks';
import { useAppStore } from '@/store';
import type { TransactionType } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useState } from 'react';
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
}).refine((data) => {
  // categoryId is required for expense and income, but not for transfer
  if (data.type !== 'transfer') {
    return data.categoryId && data.categoryId.length > 0;
  }
  return true;
}, {
  message: 'Category is required',
  path: ['categoryId'],
}).refine((data) => {
  // toAccountId is required for transfers
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

export const AddTransactionModal = ({ isOpen, onClose }: AddTransactionModalProps) => {
  const { currentUserId } = useAppStore();
  const userId = currentUserId ?? 'default-user';
  
  const accounts = useAccounts(userId);
  const categories = useCategories(userId);
  const { addTransaction } = useTransactionActions();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeType, setActiveType] = useState<TransactionType>('expense');

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
    },
  });

  const watchType = watch('type');
  const filteredCategories = categories.filter(
    (c) => c.type === (watchType === 'transfer' ? 'expense' : watchType)
  );

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      const amount = parseFloat(data.amount);
      await addTransaction(
        {
          amount: data.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
          type: data.type,
          description: data.description,
          categoryId: data.categoryId || 'transfer',
          accountId: data.accountId,
          date: new Date(data.date),
          toAccountId: data.toAccountId,
        },
        userId
      );
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to add transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Transaction"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Add Transaction
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Transaction Type Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {(['expense', 'income', 'transfer'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setActiveType(type);
                reset({ ...watch(), type });
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                activeType === type
                  ? type === 'expense'
                    ? 'bg-danger-500 text-white'
                    : type === 'income'
                      ? 'bg-success-500 text-white'
                      : 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <input type="hidden" {...register('type')} value={activeType} />

        {/* Amount */}
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount')}
        />

        {/* Description */}
        <Input
          label="Description"
          placeholder="Enter description..."
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Account */}
        <Controller
          name="accountId"
          control={control}
          render={({ field }) => (
            <Select
              label="Account"
              options={accounts.map((a) => ({ value: a.id, label: a.name }))}
              placeholder="Select account"
              error={errors.accountId?.message}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />

        {/* To Account (for transfers) */}
        {activeType === 'transfer' && (
          <Controller
            name="toAccountId"
            control={control}
            render={({ field }) => (
              <Select
                label="To Account"
                options={accounts
                  .filter((a) => a.id !== watch('accountId'))
                  .map((a) => ({ value: a.id, label: a.name }))}
                placeholder="Select destination account"
                error={errors.toAccountId?.message}
                value={field.value || ''}
                onValueChange={field.onChange}
              />
            )}
          />
        )}

        {/* Category */}
        {activeType !== 'transfer' && (
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
                placeholder="Select category"
                error={errors.categoryId?.message}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        )}

        {/* Date */}
        <Input
          label="Date"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
      </form>
    </Modal>
  );
};
