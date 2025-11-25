import { Button, Input, Modal, Select } from '@/components/ui';
import { useAccountsWithBalance } from '@/hooks/useAccounts';
import { useGoalActions } from '@/hooks/useGoals';
import { useAppStore } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const goalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['savings', 'debt']),
  targetAmount: z.number().positive('Target amount must be greater than 0'),
  currentAmount: z.number().min(0).optional(),
  deadline: z.string().optional(),
  accountId: z.string().optional(),
  color: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

const colorOptions = [
  { value: '#3b82f6', label: '🔵 Blue' },
  { value: '#10b981', label: '🟢 Green' },
  { value: '#f59e0b', label: '🟡 Yellow' },
  { value: '#ef4444', label: '🔴 Red' },
  { value: '#8b5cf6', label: '🟣 Purple' },
  { value: '#ec4899', label: '💗 Pink' },
  { value: '#06b6d4', label: '🩵 Cyan' },
];

export const AddGoalModal = () => {
  const { activeModal, setActiveModal, currentUserId } = useAppStore();
  const accounts = useAccountsWithBalance();
  const { addGoal } = useGoalActions();
  
  const isOpen = activeModal === 'add-goal';

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      type: 'savings',
      currentAmount: 0,
      color: '#3b82f6',
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    if (!currentUserId) return;

    await addGoal({
      name: data.name,
      type: data.type,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      accountId: data.accountId || undefined,
      color: data.color,
    }, currentUserId);
    
    reset();
    setActiveModal(null);
  };

  const handleClose = () => {
    reset();
    setActiveModal(null);
  };

  const accountOptions = useMemo(() => {
    return accounts.map(a => ({
      value: a.id,
      label: a.name,
    }));
  }, [accounts]);

  const typeOptions = [
    { value: 'savings', label: '💰 Savings Goal' },
    { value: 'debt', label: '💳 Debt Payoff' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Goal">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Goal Name"
          placeholder="e.g., Emergency Fund, New Car"
          {...register('name')}
          error={errors.name?.message}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              label="Goal Type"
              options={typeOptions}
              value={field.value}
              onValueChange={field.onChange}
              error={errors.type?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Target Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('targetAmount', { valueAsNumber: true })}
            error={errors.targetAmount?.message}
          />

          <Input
            label="Current Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('currentAmount', { valueAsNumber: true })}
            error={errors.currentAmount?.message}
          />
        </div>

        <Input
          label="Deadline (optional)"
          type="date"
          {...register('deadline')}
          error={errors.deadline?.message}
        />

        {accountOptions.length > 0 && (
          <Controller
            name="accountId"
            control={control}
            render={({ field }) => (
              <Select
                label="Link to Account (optional)"
                options={[{ value: '', label: 'None' }, ...accountOptions]}
                value={field.value || ''}
                onValueChange={field.onChange}
                error={errors.accountId?.message}
              />
            )}
          />
        )}

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <Select
              label="Color"
              options={colorOptions}
              value={field.value || ''}
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
            {isSubmitting ? 'Creating...' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
