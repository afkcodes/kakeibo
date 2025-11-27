import { db, generateId } from '@/services/db';
import type { CreateGoalInput, Goal, GoalProgress, Transaction } from '@/types';
import { useLiveQuery } from 'dexie-react-hooks';

export const useGoals = (userId?: string) => {
  const goals = useLiveQuery(async () => {
    if (!userId) {
      return db.goals.toArray();
    }
    return db.goals.where('userId').equals(userId).toArray();
  }, [userId]);

  return goals ?? [];
};

export const useGoal = (id: string) => {
  return useLiveQuery(() => db.goals.get(id), [id]);
};

export const useGoalActions = () => {
  const addGoal = async (input: CreateGoalInput, userId: string) => {
    const now = new Date();
    const goal: Goal = {
      id: generateId(),
      userId,
      name: input.name,
      type: input.type,
      targetAmount: input.targetAmount,
      currentAmount: input.currentAmount ?? 0,
      deadline: input.deadline,
      accountId: input.accountId,
      color: input.color ?? '#3b82f6',
      icon: input.icon ?? 'target',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    await db.goals.add(goal);
    return goal;
  };

  const updateGoal = async (id: string, updates: Partial<CreateGoalInput & { status?: Goal['status'] }>) => {
    await db.goals.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteGoal = async (id: string) => {
    await db.goals.delete(id);
  };

  /**
   * Contribute money to a goal
   * - Deducts amount from the specified account
   * - Creates a 'goal-contribution' transaction for tracking
   * - Updates the goal's currentAmount
   */
  const contributeToGoal = async (
    goalId: string, 
    amount: number, 
    accountId: string,
    userId: string
  ) => {
    const goal = await db.goals.get(goalId);
    const account = await db.accounts.get(accountId);
    
    if (!goal || !account) {
      throw new Error('Goal or account not found');
    }

    const now = new Date();
    const newGoalAmount = goal.currentAmount + amount;
    const isCompleted = newGoalAmount >= goal.targetAmount;

    // Create transaction record
    const transaction: Transaction = {
      id: generateId(),
      userId,
      accountId,
      amount: amount,
      type: 'goal-contribution',
      categoryId: '', // No category for goal transactions
      description: `Savings: ${goal.name}`,
      date: now,
      tags: ['savings', 'goal'],
      goalId: goalId,
      isRecurring: false,
      synced: false,
      createdAt: now,
      updatedAt: now,
    };

    // Perform all updates in a transaction
    await db.transaction('rw', [db.goals, db.accounts, db.transactions], async () => {
      // Deduct from account
      await db.accounts.update(accountId, {
        balance: account.balance - amount,
        updatedAt: now,
      });

      // Update goal
      await db.goals.update(goalId, {
        currentAmount: newGoalAmount,
        status: isCompleted ? 'completed' : 'active',
        updatedAt: now,
      });

      // Create transaction
      await db.transactions.add(transaction);
    });

    return { goal, transaction };
  };

  /**
   * Withdraw money from a goal
   * - Adds amount back to the specified account
   * - Creates a 'goal-withdrawal' transaction for tracking
   * - Updates the goal's currentAmount
   */
  const withdrawFromGoal = async (
    goalId: string,
    amount: number,
    accountId: string,
    userId: string
  ) => {
    const goal = await db.goals.get(goalId);
    const account = await db.accounts.get(accountId);

    if (!goal || !account) {
      throw new Error('Goal or account not found');
    }

    if (amount > goal.currentAmount) {
      throw new Error('Cannot withdraw more than current goal amount');
    }

    const now = new Date();
    const newGoalAmount = goal.currentAmount - amount;

    // Create transaction record
    const transaction: Transaction = {
      id: generateId(),
      userId,
      accountId,
      amount: amount,
      type: 'goal-withdrawal',
      categoryId: '', // No category for goal transactions
      description: `Withdrawal: ${goal.name}`,
      date: now,
      tags: ['savings', 'goal', 'withdrawal'],
      goalId: goalId,
      isRecurring: false,
      synced: false,
      createdAt: now,
      updatedAt: now,
    };

    // Perform all updates in a transaction
    await db.transaction('rw', [db.goals, db.accounts, db.transactions], async () => {
      // Add back to account
      await db.accounts.update(accountId, {
        balance: account.balance + amount,
        updatedAt: now,
      });

      // Update goal
      await db.goals.update(goalId, {
        currentAmount: newGoalAmount,
        status: newGoalAmount >= goal.targetAmount ? 'completed' : 'active',
        updatedAt: now,
      });

      // Create transaction
      await db.transactions.add(transaction);
    });

    return { goal, transaction };
  };

  return { addGoal, updateGoal, deleteGoal, contributeToGoal, withdrawFromGoal };
};

export const useGoalProgress = (userId?: string): GoalProgress[] => {
  const goalsWithProgress = useLiveQuery(async () => {
    const goals = userId
      ? await db.goals.where('userId').equals(userId).toArray()
      : await db.goals.toArray();
    
    const now = new Date();
    
    const progressList: GoalProgress[] = goals.map((goal) => {
      const percentage = (goal.currentAmount / goal.targetAmount) * 100;
      const remaining = goal.targetAmount - goal.currentAmount;
      
      let daysUntilDeadline: number | undefined;
      let requiredMonthlyContribution: number | undefined;
      let isOnTrack = true;
      
      if (goal.deadline) {
        const deadline = new Date(goal.deadline);
        daysUntilDeadline = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        
        const monthsRemaining = daysUntilDeadline / 30;
        if (monthsRemaining > 0) {
          requiredMonthlyContribution = remaining / monthsRemaining;
        }
        
        // Calculate if on track (simple linear projection)
        const totalDays = Math.ceil((deadline.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const daysPassed = totalDays - daysUntilDeadline;
        const expectedProgress = daysPassed > 0 ? (daysPassed / totalDays) * 100 : 0;
        isOnTrack = percentage >= expectedProgress * 0.9; // Within 10% of expected
      }

      return {
        goal,
        percentage,
        remaining,
        daysUntilDeadline,
        requiredMonthlyContribution,
        isOnTrack,
      };
    });

    return progressList;
  }, [userId]);

  return goalsWithProgress ?? [];
};
