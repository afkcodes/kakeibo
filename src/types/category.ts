export type CategoryType = 'expense' | 'income';

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  parentId?: string;
  isDefault: boolean;
  order: number;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  parentId?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  order?: number;
}

// Default expense categories
export const defaultExpenseCategories: Omit<Category, 'id' | 'userId'>[] = [
  { name: 'Food & Dining', type: 'expense', color: '#ef4444', icon: 'utensils', isDefault: true, order: 1 },
  { name: 'Transportation', type: 'expense', color: '#3b82f6', icon: 'car', isDefault: true, order: 2 },
  { name: 'Shopping', type: 'expense', color: '#8b5cf6', icon: 'shopping-bag', isDefault: true, order: 3 },
  { name: 'Entertainment', type: 'expense', color: '#ec4899', icon: 'film', isDefault: true, order: 4 },
  { name: 'Bills & Utilities', type: 'expense', color: '#f59e0b', icon: 'zap', isDefault: true, order: 5 },
  { name: 'Healthcare', type: 'expense', color: '#10b981', icon: 'heart-pulse', isDefault: true, order: 6 },
  { name: 'Housing', type: 'expense', color: '#06b6d4', icon: 'home', isDefault: true, order: 7 },
  { name: 'Travel', type: 'expense', color: '#0ea5e9', icon: 'plane', isDefault: true, order: 8 },
  { name: 'Education', type: 'expense', color: '#6366f1', icon: 'graduation-cap', isDefault: true, order: 9 },
  { name: 'Personal Care', type: 'expense', color: '#d946ef', icon: 'sparkles', isDefault: true, order: 10 },
  { name: 'Other Expenses', type: 'expense', color: '#64748b', icon: 'more-horizontal', isDefault: true, order: 11 },
];

// Default income categories
export const defaultIncomeCategories: Omit<Category, 'id' | 'userId'>[] = [
  { name: 'Salary', type: 'income', color: '#10b981', icon: 'briefcase', isDefault: true, order: 1 },
  { name: 'Freelance', type: 'income', color: '#06b6d4', icon: 'laptop', isDefault: true, order: 2 },
  { name: 'Investments', type: 'income', color: '#8b5cf6', icon: 'trending-up', isDefault: true, order: 3 },
  { name: 'Gifts', type: 'income', color: '#ec4899', icon: 'gift', isDefault: true, order: 4 },
  { name: 'Rental Income', type: 'income', color: '#f59e0b', icon: 'building', isDefault: true, order: 5 },
  { name: 'Other Income', type: 'income', color: '#64748b', icon: 'plus-circle', isDefault: true, order: 6 },
];
