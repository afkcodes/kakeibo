import { db, generateId } from '@/services/db';
import type { CreateTransactionInput, Transaction, TransactionFilters } from '@/types';
import { useLiveQuery } from 'dexie-react-hooks';

export const useTransactions = (filters?: TransactionFilters) => {
  const transactions = useLiveQuery(async () => {
    let query = db.transactions.orderBy('date').reverse();
    
    if (filters?.type) {
      query = db.transactions.where('type').equals(filters.type).reverse();
    }
    
    const results = await query.toArray();
    
    // Apply additional filters
    return results.filter(t => {
      if (filters?.categoryId && t.categoryId !== filters.categoryId) return false;
      if (filters?.accountId && t.accountId !== filters.accountId) return false;
      if (filters?.startDate && new Date(t.date) < filters.startDate) return false;
      if (filters?.endDate && new Date(t.date) > filters.endDate) return false;
      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!t.description.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [filters]);

  return transactions ?? [];
};

export const useTransaction = (id: string) => {
  return useLiveQuery(() => db.transactions.get(id), [id]);
};

export const useTransactionActions = () => {
  const addTransaction = async (input: CreateTransactionInput, userId: string) => {
    const now = new Date();
    const transaction: Transaction = {
      id: generateId(),
      userId,
      ...input,
      tags: input.tags ?? [],
      isRecurring: input.isRecurring ?? false,
      synced: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.transactions.add(transaction);

    // Update account balance
    const account = await db.accounts.get(input.accountId);
    if (account) {
      let balanceChange = input.amount;
      if (input.type === 'expense') {
        balanceChange = -Math.abs(input.amount);
      } else if (input.type === 'income') {
        balanceChange = Math.abs(input.amount);
      } else if (input.type === 'transfer' && input.toAccountId) {
        // Deduct from source account
        balanceChange = -Math.abs(input.amount);
        // Add to destination account
        const toAccount = await db.accounts.get(input.toAccountId);
        if (toAccount) {
          await db.accounts.update(input.toAccountId, {
            balance: toAccount.balance + Math.abs(input.amount),
            updatedAt: now,
          });
        }
      }

      await db.accounts.update(input.accountId, {
        balance: account.balance + balanceChange,
        updatedAt: now,
      });
    }

    return transaction;
  };

  const updateTransaction = async (id: string, updates: Partial<CreateTransactionInput>) => {
    await db.transactions.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteTransaction = async (id: string) => {
    const transaction = await db.transactions.get(id);
    if (transaction) {
      // Revert account balance
      const account = await db.accounts.get(transaction.accountId);
      if (account) {
        let balanceRevert = transaction.amount;
        if (transaction.type === 'expense') {
          balanceRevert = Math.abs(transaction.amount);
        } else if (transaction.type === 'income') {
          balanceRevert = -Math.abs(transaction.amount);
        }

        await db.accounts.update(transaction.accountId, {
          balance: account.balance + balanceRevert,
          updatedAt: new Date(),
        });
      }

      await db.transactions.delete(id);
    }
  };

  return { addTransaction, updateTransaction, deleteTransaction };
};

export const useTransactionStats = (userId?: string) => {
  return useLiveQuery(async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let transactions;
    if (userId) {
      transactions = await db.transactions
        .where('userId')
        .equals(userId)
        .toArray();
    } else {
      transactions = await db.transactions.toArray();
    }

    const monthlyTransactions = transactions.filter(
      t => new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth
    );

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      monthlyIncome,
      monthlyExpenses,
      savings: monthlyIncome - monthlyExpenses,
      transactionCount: monthlyTransactions.length,
    };
  }, [userId]);
};
