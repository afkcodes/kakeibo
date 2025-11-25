import { db, generateId } from '@/services/db';
import type { Budget, BudgetProgress, CreateBudgetInput } from '@/types';
import { useLiveQuery } from 'dexie-react-hooks';

export const useBudgets = (userId?: string) => {
  const budgets = useLiveQuery(async () => {
    if (!userId) {
      return db.budgets.toArray();
    }
    return db.budgets.where('userId').equals(userId).toArray();
  }, [userId]);

  return budgets ?? [];
};

export const useBudget = (id: string) => {
  return useLiveQuery(() => db.budgets.get(id), [id]);
};

export const useBudgetActions = () => {
  const addBudget = async (input: CreateBudgetInput, userId: string) => {
    const now = new Date();
    const budget: Budget = {
      id: generateId(),
      userId,
      categoryId: input.categoryId,
      amount: input.amount,
      spent: 0,
      period: input.period,
      startDate: input.startDate,
      endDate: input.endDate,
      rollover: input.rollover ?? false,
      alerts: input.alerts ?? { threshold: 80, enabled: true },
      createdAt: now,
      updatedAt: now,
    };

    await db.budgets.add(budget);
    return budget;
  };

  const updateBudget = async (id: string, updates: Partial<CreateBudgetInput>) => {
    await db.budgets.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteBudget = async (id: string) => {
    await db.budgets.delete(id);
  };

  return { addBudget, updateBudget, deleteBudget };
};

export const useBudgetProgress = (userId?: string): BudgetProgress[] => {
  const budgetsWithProgress = useLiveQuery(async () => {
    const budgets = userId 
      ? await db.budgets.where('userId').equals(userId).toArray()
      : await db.budgets.toArray();
    
    const now = new Date();
    
    const progressList: BudgetProgress[] = await Promise.all(
      budgets.map(async (budget) => {
        // Calculate spent amount from transactions in the budget period
        const transactions = await db.transactions
          .where('categoryId')
          .equals(budget.categoryId)
          .toArray();
        
        const periodStart = new Date(budget.startDate);
        const periodEnd = budget.endDate ? new Date(budget.endDate) : now;
        
        const spent = transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && tDate >= periodStart && tDate <= periodEnd;
          })
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const remaining = budget.amount - spent;
        const percentage = (spent / budget.amount) * 100;
        
        // Calculate days remaining
        const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
        const daysPassed = totalDays - daysRemaining;
        
        const dailyBudget = daysRemaining > 0 ? remaining / daysRemaining : 0;
        const projectedSpending = daysPassed > 0 ? (spent / daysPassed) * totalDays : spent;

        return {
          budget,
          spent,
          remaining,
          percentage,
          isOverBudget: spent > budget.amount,
          daysRemaining,
          dailyBudget,
          projectedSpending,
        };
      })
    );

    return progressList;
  }, [userId]);

  return budgetsWithProgress ?? [];
};
