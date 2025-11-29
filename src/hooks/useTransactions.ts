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
    const now = new Date();
    const oldTransaction = await db.transactions.get(id);
    
    if (!oldTransaction) {
      throw new Error('Transaction not found');
    }

    // Use a database transaction to ensure atomicity
    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      // Step 1: Revert the OLD transaction's effect on account balances
      const oldSourceAccount = await db.accounts.get(oldTransaction.accountId);
      
      if (oldSourceAccount) {
        if (oldTransaction.type === 'expense') {
          // Old expense: add back the amount (expense was negative)
          await db.accounts.update(oldTransaction.accountId, {
            balance: oldSourceAccount.balance + Math.abs(oldTransaction.amount),
            updatedAt: now,
          });
        } else if (oldTransaction.type === 'income') {
          // Old income: subtract the amount
          await db.accounts.update(oldTransaction.accountId, {
            balance: oldSourceAccount.balance - Math.abs(oldTransaction.amount),
            updatedAt: now,
          });
        } else if (oldTransaction.type === 'transfer' && oldTransaction.toAccountId) {
          // Old transfer: add back to source, subtract from destination
          await db.accounts.update(oldTransaction.accountId, {
            balance: oldSourceAccount.balance + Math.abs(oldTransaction.amount),
            updatedAt: now,
          });
          
          const oldDestAccount = await db.accounts.get(oldTransaction.toAccountId);
          if (oldDestAccount) {
            await db.accounts.update(oldTransaction.toAccountId, {
              balance: oldDestAccount.balance - Math.abs(oldTransaction.amount),
              updatedAt: now,
            });
          }
        }
      }

      // Step 2: Apply the NEW transaction's effect on account balances
      const newAccountId = updates.accountId ?? oldTransaction.accountId;
      const newAmount = updates.amount ?? oldTransaction.amount;
      const newType = updates.type ?? oldTransaction.type;
      const newToAccountId = updates.toAccountId ?? oldTransaction.toAccountId;
      
      // Re-fetch account after potential changes above
      const newSourceAccount = await db.accounts.get(newAccountId);
      
      if (newSourceAccount) {
        if (newType === 'expense') {
          // New expense: subtract the amount
          await db.accounts.update(newAccountId, {
            balance: newSourceAccount.balance - Math.abs(newAmount),
            updatedAt: now,
          });
        } else if (newType === 'income') {
          // New income: add the amount
          await db.accounts.update(newAccountId, {
            balance: newSourceAccount.balance + Math.abs(newAmount),
            updatedAt: now,
          });
        } else if (newType === 'transfer' && newToAccountId) {
          // New transfer: subtract from source, add to destination
          await db.accounts.update(newAccountId, {
            balance: newSourceAccount.balance - Math.abs(newAmount),
            updatedAt: now,
          });
          
          const newDestAccount = await db.accounts.get(newToAccountId);
          if (newDestAccount) {
            await db.accounts.update(newToAccountId, {
              balance: newDestAccount.balance + Math.abs(newAmount),
              updatedAt: now,
            });
          }
        }
      }

      // Step 3: Update the transaction record
      await db.transactions.update(id, {
        ...updates,
        updatedAt: now,
      });
    });
  };

  const deleteTransaction = async (id: string) => {
    const transaction = await db.transactions.get(id);
    if (transaction) {
      const now = new Date();
      
      // Use a database transaction to ensure atomicity
      await db.transaction('rw', [db.transactions, db.accounts], async () => {
        // Revert account balance
        const account = await db.accounts.get(transaction.accountId);
        
        if (account) {
          if (transaction.type === 'expense') {
            // Expense was negative, so add back the amount
            await db.accounts.update(transaction.accountId, {
              balance: account.balance + Math.abs(transaction.amount),
              updatedAt: now,
            });
          } else if (transaction.type === 'income') {
            // Income was positive, so subtract the amount
            await db.accounts.update(transaction.accountId, {
              balance: account.balance - Math.abs(transaction.amount),
              updatedAt: now,
            });
          } else if (transaction.type === 'transfer' && transaction.toAccountId) {
            // Transfer: add back to source, subtract from destination
            await db.accounts.update(transaction.accountId, {
              balance: account.balance + Math.abs(transaction.amount),
              updatedAt: now,
            });
            
            const destAccount = await db.accounts.get(transaction.toAccountId);
            if (destAccount) {
              await db.accounts.update(transaction.toAccountId, {
                balance: destAccount.balance - Math.abs(transaction.amount),
                updatedAt: now,
              });
            }
          }
        }

        await db.transactions.delete(id);
      });
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
