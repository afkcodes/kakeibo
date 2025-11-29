export type TransactionType = 'expense' | 'income' | 'transfer' | 'goal-contribution' | 'goal-withdrawal';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  date: Date;
  tags: string[];
  location?: Location;
  receipt?: string;
  isRecurring: boolean;
  recurringId?: string;
  toAccountId?: string; // For transfers
  goalId?: string; // For goal contributions/withdrawals
  isEssential?: boolean; // For marking essential expenses (needs vs wants)
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionInput {
  accountId: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  date: Date;
  tags?: string[];
  location?: Location;
  receipt?: string;
  isRecurring?: boolean;
  toAccountId?: string;
  isEssential?: boolean;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {}

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  searchQuery?: string;
}

export interface TransactionSortOptions {
  field: 'date' | 'amount' | 'category';
  direction: 'asc' | 'desc';
}
