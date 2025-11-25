import type { Account } from '@/types/account';
import type { Budget } from '@/types/budget';
import type { Category } from '@/types/category';
import type { Goal } from '@/types/goal';
import type { Transaction } from '@/types/transaction';
import type { User } from '@/types/user';
import Dexie, { type EntityTable } from 'dexie';

// Define the database
class BudgetoDatabase extends Dexie {
  users!: EntityTable<User, 'id'>;
  accounts!: EntityTable<Account, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  budgets!: EntityTable<Budget, 'id'>;
  goals!: EntityTable<Goal, 'id'>;

  constructor() {
    super('BudgetoDB');

    this.version(1).stores({
      users: 'id, email',
      accounts: 'id, userId, type, isActive',
      categories: 'id, userId, type, parentId, isDefault, order',
      transactions: 'id, userId, accountId, categoryId, type, date, [userId+date], [userId+categoryId], [userId+accountId]',
      budgets: 'id, userId, categoryId, period, [userId+categoryId]',
      goals: 'id, userId, type, status, [userId+status]',
    });
  }
}

// Create and export the database instance
export const db = new BudgetoDatabase();

// Helper function to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Database utility functions
export const clearDatabase = async () => {
  await db.delete();
  await db.open();
};

export const exportDatabase = async () => {
  const data = {
    users: await db.users.toArray(),
    accounts: await db.accounts.toArray(),
    categories: await db.categories.toArray(),
    transactions: await db.transactions.toArray(),
    budgets: await db.budgets.toArray(),
    goals: await db.goals.toArray(),
  };
  return JSON.stringify(data, null, 2);
};

export const importDatabase = async (jsonData: string) => {
  const data = JSON.parse(jsonData);
  
  await db.transaction('rw', [db.users, db.accounts, db.categories, db.transactions, db.budgets, db.goals], async () => {
    if (data.users) await db.users.bulkPut(data.users);
    if (data.accounts) await db.accounts.bulkPut(data.accounts);
    if (data.categories) await db.categories.bulkPut(data.categories);
    if (data.transactions) await db.transactions.bulkPut(data.transactions);
    if (data.budgets) await db.budgets.bulkPut(data.budgets);
    if (data.goals) await db.goals.bulkPut(data.goals);
  });
};
