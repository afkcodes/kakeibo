export type GoalType = 'savings' | 'debt';
export type GoalStatus = 'active' | 'completed' | 'cancelled';

export interface Goal {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  accountId?: string;
  color: string;
  icon: string;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGoalInput {
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount?: number;
  deadline?: Date;
  accountId?: string;
  color?: string;
  icon?: string;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  status?: GoalStatus;
}

export interface GoalProgress {
  goal: Goal;
  percentage: number;
  remaining: number;
  daysUntilDeadline?: number;
  requiredMonthlyContribution?: number;
  isOnTrack: boolean;
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  name: string;
  targetAmount: number;
  reachedAt?: Date;
}
