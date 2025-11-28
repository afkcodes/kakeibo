import { Button, Checkbox, Input, Modal, Select } from '@/components/ui';
import { CategorySelect } from '@/components/ui/CategorySelect/CategorySelect';
import { useBudgetActions } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useAppStore } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  period: z.enum(['weekly', 'monthly', 'yearly']),
  rollover: z.boolean().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export const AddBudgetModal = () => {
  const { activeModal, setActiveModal, currentUserId, editingBudget, setEditingBudget } = useAppStore();
  const categories = useCategories();
  const { addBudget, updateBudget } = useBudgetActions();
  
  const isOpen = activeModal === 'add-budget';
  const isEditing = !!editingBudget;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: 'monthly',
      rollover: false,
    },
  });

  // Reset form with editing budget data when modal opens
  useEffect(() => {
    if (isOpen && editingBudget) {
      reset({
        categoryId: editingBudget.categoryId,
        amount: editingBudget.amount,
        period: editingBudget.period,
        rollover: editingBudget.rollover,
      });
    } else if (isOpen && !editingBudget) {
      reset({
        categoryId: '',
        amount: undefined as unknown as number,
        period: 'monthly',
        rollover: false,
      });
    }
  }, [isOpen, editingBudget, reset]);

  const onSubmit = async (data: BudgetFormData) => {
    if (isEditing && editingBudget) {
      // Update existing budget
      await updateBudget(editingBudget.id, {
        categoryId: data.categoryId,
        amount: data.amount,
        period: data.period,
        rollover: data.rollover,
      });
    } else {
      // Create new budget
      const now = new Date();
      let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      
      if (data.period === 'weekly') {
        const day = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - day);
      } else if (data.period === 'yearly') {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      await addBudget({
        categoryId: data.categoryId,
        amount: data.amount,
        period: data.period,
        startDate,
        rollover: data.rollover,
      }, currentUserId);
    }
    
    handleClose();
  };

  const handleClose = () => {
    reset();
    setEditingBudget(null);
    setActiveModal(null);
  };

  // Filter to expense categories only for budgets
  const categoryOptions = useMemo(() => {
    return categories
      .filter(c => c.type === 'expense')
      .map(c => ({
        value: c.id,
        label: c.name,
        icon: c.icon,
        color: c.color,
      }));
  }, [categories]);

  const periodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? "Edit Budget" : "Create Budget"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <CategorySelect
              label="Category"
              options={categoryOptions}
              placeholder="Select a category"
              value={field.value}
              onValueChange={field.onChange}
              error={errors.categoryId?.message}
            />
          )}
        />

        <Input
          label="Budget Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
        />

        <Controller
          name="period"
          control={control}
          render={({ field }) => (
            <Select
              label="Period"
              options={periodOptions}
              value={field.value}
              onValueChange={field.onChange}
              error={errors.period?.message}
            />
          )}
        />

        <Controller
          name="rollover"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="rollover"
              checked={field.value}
              onCheckedChange={field.onChange}
              label="Rollover unused budget to next period"
            />
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Budget')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
