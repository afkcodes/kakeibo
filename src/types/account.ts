export type AccountType = 'bank' | 'credit' | 'cash' | 'investment' | 'wallet';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
}

export interface UpdateAccountInput extends Partial<CreateAccountInput> {
  isActive?: boolean;
}

export const accountTypeLabels: Record<AccountType, string> = {
  bank: 'Bank Account',
  credit: 'Credit Card',
  cash: 'Cash',
  investment: 'Investment',
  wallet: 'Digital Wallet',
};

export const accountTypeIcons: Record<AccountType, string> = {
  bank: 'landmark',
  credit: 'credit-card',
  cash: 'banknote',
  investment: 'trending-up',
  wallet: 'wallet',
};
