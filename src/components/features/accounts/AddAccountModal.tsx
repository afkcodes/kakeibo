import { Button, Input, Modal, Select } from '@/components/ui';
import { useAccountActions } from '@/hooks/useAccounts';
import { useAppStore } from '@/store';
import type { AccountType } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['bank', 'credit', 'cash', 'investment', 'wallet']),
  balance: z.number(),
  currency: z.string(),
  color: z.string(),
  icon: z.string(),
});

type AccountFormData = z.infer<typeof accountSchema>;

const typeOptions = [
  { value: 'bank', label: 'Bank Account', icon: 'landmark' },
  { value: 'credit', label: 'Credit Card', icon: 'credit-card' },
  { value: 'cash', label: 'Cash', icon: 'banknote' },
  { value: 'investment', label: 'Investment', icon: 'trending-up' },
  { value: 'wallet', label: 'Digital Wallet', icon: 'wallet' },
];

const colorOptions = [
  { value: '#3b82f6', label: 'Blue', color: '#3b82f6' },
  { value: '#10b981', label: 'Green', color: '#10b981' },
  { value: '#f59e0b', label: 'Yellow', color: '#f59e0b' },
  { value: '#ef4444', label: 'Red', color: '#ef4444' },
  { value: '#8b5cf6', label: 'Purple', color: '#8b5cf6' },
  { value: '#ec4899', label: 'Pink', color: '#ec4899' },
  { value: '#06b6d4', label: 'Cyan', color: '#06b6d4' },
  { value: '#6b7280', label: 'Gray', color: '#6b7280' },
];

export const AddAccountModal = () => {
  const { activeModal, setActiveModal, currentUserId } = useAppStore();
  const { addAccount } = useAccountActions();
  
  const isOpen = activeModal === 'add-account';

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      type: 'bank',
      balance: 0,
      currency: 'USD',
      color: '#3b82f6',
      icon: 'wallet',
    },
  });

  const onSubmit = async (data: AccountFormData) => {
    await addAccount({
      name: data.name,
      type: data.type as AccountType,
      balance: data.balance,
      currency: data.currency,
      color: data.color,
      icon: data.icon,
    }, currentUserId);
    
    reset();
    setActiveModal(null);
  };

  const handleClose = () => {
    reset();
    setActiveModal(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Account Name"
          placeholder="e.g., Main Checking, Savings"
          {...register('name')}
          error={errors.name?.message}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              label="Account Type"
              options={typeOptions}
              value={field.value}
              onValueChange={field.onChange}
              error={errors.type?.message}
            />
          )}
        />

        <Input
          label="Current Balance"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('balance', { valueAsNumber: true })}
          error={errors.balance?.message}
          helperText="For credit cards, enter negative balance if you owe money"
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <Select
              label="Color"
              options={colorOptions}
              value={field.value}
              onValueChange={field.onChange}
              error={errors.color?.message}
            />
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
