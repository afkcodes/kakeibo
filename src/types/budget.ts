export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface BudgetAlert {
  threshold: number; // Percentage (e.g., 80 means 80%)
  enabled: boolean;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  rollover: boolean;
  alerts: BudgetAlert;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBudgetInput {
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  rollover?: boolean;
  alerts?: BudgetAlert;
}

export interface UpdateBudgetInput extends Partial<CreateBudgetInput> {}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  daysRemaining: number;
  dailyBudget: number;
  projectedSpending: number;
}

// Budget templates
export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  allocations: {
    categoryId: string;
    percentage: number;
  }[];
}

export const defaultBudgetTemplates: Omit<BudgetTemplate, 'id'>[] = [
  {
    name: '50/30/20 Rule',
    description: '50% Needs, 30% Wants, 20% Savings',
    allocations: [
      { categoryId: 'needs', percentage: 50 },
      { categoryId: 'wants', percentage: 30 },
      { categoryId: 'savings', percentage: 20 },
    ],
  },
  {
    name: '60/20/20 Rule',
    description: '60% Essentials, 20% Financial Goals, 20% Flexible',
    allocations: [
      { categoryId: 'essentials', percentage: 60 },
      { categoryId: 'goals', percentage: 20 },
      { categoryId: 'flexible', percentage: 20 },
    ],
  },
  {
    name: 'Zero-Based Budget',
    description: 'Every dollar has a job',
    allocations: [],
  },
];
