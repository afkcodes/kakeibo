import { Button, Input, Modal, Select } from '@/components/ui';
import { useAccountsWithBalance } from '@/hooks/useAccounts';
import { useGoalActions } from '@/hooks/useGoals';
import { useAppStore } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useEffect, useMemo } from 'react';
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
  { value: '#3b82f6', label: 'Blue', color: '#3b82f6' },
  { value: '#10b981', label: 'Green', color: '#10b981' },
  { value: '#f59e0b', label: 'Yellow', color: '#f59e0b' },
  { value: '#ef4444', label: 'Red', color: '#ef4444' },
  { value: '#8b5cf6', label: 'Purple', color: '#8b5cf6' },
  { value: '#ec4899', label: 'Pink', color: '#ec4899' },
  { value: '#06b6d4', label: 'Cyan', color: '#06b6d4' },
];

export const AddGoalModal = () => {
  const { activeModal, setActiveModal, currentUserId, editingGoal, setEditingGoal } = useAppStore();
  const accounts = useAccountsWithBalance();
  const { addGoal, updateGoal } = useGoalActions();
  
  const isOpen = activeModal === 'add-goal';
  const isEditing = !!editingGoal;

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

  // Reset form with editing goal data when modal opens
  useEffect(() => {
    if (isOpen && editingGoal) {
      reset({
        name: editingGoal.name,
        type: editingGoal.type,
        targetAmount: editingGoal.targetAmount,
        currentAmount: editingGoal.currentAmount,
        deadline: editingGoal.deadline ? format(new Date(editingGoal.deadline), 'yyyy-MM-dd') : undefined,
        accountId: editingGoal.accountId || undefined,
        color: editingGoal.color || '#3b82f6',
      });
    } else if (isOpen && !editingGoal) {
      reset({
        name: '',
        type: 'savings',
        targetAmount: undefined as unknown as number,
        currentAmount: 0,
        deadline: undefined,
        accountId: undefined,
        color: '#3b82f6',
      });
    }
  }, [isOpen, editingGoal, reset]);

  const onSubmit = async (data: GoalFormData) => {
    if (!currentUserId) return;

    if (isEditing && editingGoal) {
      // Update existing goal
      await updateGoal(editingGoal.id, {
        name: data.name,
        type: data.type,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        accountId: data.accountId || undefined,
        color: data.color,
      });
    } else {
      // Create new goal
      await addGoal({
        name: data.name,
        type: data.type,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        accountId: data.accountId || undefined,
        color: data.color,
      }, currentUserId);
    }
    
    handleClose();
  };

  const handleClose = () => {
    reset();
    setEditingGoal(null);
    setActiveModal(null);
  };

  const accountOptions = useMemo(() => {
    return accounts.map(a => ({
      value: a.id,
      label: a.name,
    }));
  }, [accounts]);

  const typeOptions = [
    { value: 'savings', label: 'Savings Goal', icon: 'piggy-bank' },
    { value: 'debt', label: 'Debt Payoff', icon: 'credit-card' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? "Edit Goal" : "Create Goal"}>
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
          leftIcon={<Calendar className="w-4 h-4" />}
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
                options={[{ value: '__none__', label: 'None' }, ...accountOptions]}
                value={field.value || '__none__'}
                onValueChange={(val) => field.onChange(val === '__none__' ? '' : val)}
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
            {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Goal')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
