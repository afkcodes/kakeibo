import { db, generateId } from '@/services/db';
import type { Account, CreateAccountInput } from '@/types';
import { useLiveQuery } from 'dexie-react-hooks';

export const useAccounts = (userId?: string) => {
  const accounts = useLiveQuery(async () => {
    if (!userId) return [];
    return db.accounts.where('userId').equals(userId).toArray();
  }, [userId]);

  return accounts ?? [];
};

export const useAccountsWithBalance = (userId?: string) => {
  const accounts = useLiveQuery(async () => {
    if (!userId) {
      // Get all accounts if no userId provided
      return db.accounts.toArray();
    }
    return db.accounts.where('userId').equals(userId).toArray();
  }, [userId]);

  return accounts ?? [];
};

export const useAccount = (id: string) => {
  return useLiveQuery(() => db.accounts.get(id), [id]);
};

export const useAccountActions = () => {
  const addAccount = async (input: CreateAccountInput, userId: string) => {
    const now = new Date();
    const account: Account = {
      id: generateId(),
      userId,
      ...input,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.accounts.add(account);
    return account;
  };

  const updateAccount = async (id: string, updates: Partial<CreateAccountInput>) => {
    await db.accounts.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteAccount = async (id: string) => {
    await db.accounts.delete(id);
  };

  return { addAccount, updateAccount, deleteAccount };
};

export const useAccountStats = (userId?: string) => {
  return useLiveQuery(async () => {
    if (!userId) return null;
    
    const accounts = await db.accounts
      .where('userId')
      .equals(userId)
      .toArray();

    const totalAssets = accounts
      .filter(a => a.balance > 0)
      .reduce((sum, a) => sum + a.balance, 0);

    const totalLiabilities = Math.abs(
      accounts
        .filter(a => a.balance < 0)
        .reduce((sum, a) => sum + a.balance, 0)
    );

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      accountCount: accounts.length,
    };
  }, [userId]);
};
