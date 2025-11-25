import { db, generateId } from '@/services/db';
import type { CreateGoalInput, Goal, GoalProgress } from '@/types';
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

  const contributeToGoal = async (id: string, amount: number) => {
    const goal = await db.goals.get(id);
    if (goal) {
      const newAmount = goal.currentAmount + amount;
      const isCompleted = newAmount >= goal.targetAmount;
      
      await db.goals.update(id, {
        currentAmount: newAmount,
        status: isCompleted ? 'completed' : 'active',
        updatedAt: new Date(),
      });
    }
  };

  return { addGoal, updateGoal, deleteGoal, contributeToGoal };
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
