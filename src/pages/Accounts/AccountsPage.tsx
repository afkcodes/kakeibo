import { Button } from '@/components/ui';
import { useAccountStats, useAccountsWithBalance } from '@/hooks/useAccounts';
import { useCurrency } from '@/hooks/useCurrency';
import { useAppStore } from '@/store';
import type { AccountType } from '@/types';
import {
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    Building2,
    CreditCard,
    MoreHorizontal,
    Plus,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useMemo } from 'react';

const getAccountIcon = (type: AccountType) => {
  switch (type) {
    case 'bank':
      return Building2;
    case 'credit':
      return CreditCard;
    case 'cash':
      return Banknote;
    case 'investment':
      return TrendingUp;
    default:
      return Wallet;
  }
};

const getAccountTypeLabel = (type: AccountType) => {
  switch (type) {
    case 'bank':
      return 'Bank Account';
    case 'credit':
      return 'Credit Card';
    case 'cash':
      return 'Cash';
    case 'investment':
      return 'Investment';
    default:
      return 'Account';
  }
};

export const AccountsPage = () => {
  const { currentUserId, setActiveModal } = useAppStore();
  const { formatCurrency } = useCurrency();
  const accounts = useAccountsWithBalance(currentUserId ?? undefined);
  const stats = useAccountStats(currentUserId ?? undefined);

  const totalAssets = stats?.totalAssets ?? 0;
  const totalLiabilities = stats?.totalLiabilities ?? 0;
  const netWorth = stats?.netWorth ?? 0;

  // Group accounts by type
  const groupedAccounts = useMemo(() => {
    const groups: Record<AccountType, typeof accounts> = {
      bank: [],
      credit: [],
      cash: [],
      investment: [],
      wallet: [],
    };

    accounts.forEach((account) => {
      if (groups[account.type]) {
        groups[account.type].push(account);
      }
    });

    return groups;
  }, [accounts]);

  // Calculate percentage of net worth for assets vs liabilities
  const assetsPercentage = totalAssets > 0 ? (totalAssets / (totalAssets + Math.abs(totalLiabilities))) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-surface-50">Accounts</h1>
        <p className="text-sm text-surface-400 mt-0.5">
          Manage your financial accounts
        </p>
      </div>

      {/* Net Worth Overview Card */}
      <div className="bg-surface-800/60 border border-surface-700/50 rounded-2xl p-5">
        <div className="flex flex-col gap-4">
          {/* Net Worth Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-400">Net Worth</p>
              <p
                className={`text-3xl font-bold font-mono mt-1 ${
                  netWorth >= 0 ? 'text-surface-50' : 'text-danger-400'
                }`}
              >
                {formatCurrency(netWorth)}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                netWorth >= 0
                  ? 'bg-success-500/20 text-success-400'
                  : 'bg-danger-500/20 text-danger-400'
              }`}
            >
              {netWorth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {netWorth >= 0 ? 'Positive' : 'Negative'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-2 bg-surface-700 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-success-500 rounded-l-full transition-all duration-500"
                style={{ width: `${assetsPercentage}%` }}
              />
              <div
                className="h-full bg-danger-500 rounded-r-full transition-all duration-500"
                style={{ width: `${100 - assetsPercentage}%` }}
              />
            </div>

            {/* Assets vs Liabilities */}
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success-500" />
                <span className="text-surface-400">Assets</span>
                <span className="font-mono font-medium text-success-400">
                  {formatCurrency(totalAssets)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-danger-400">
                  {formatCurrency(totalLiabilities)}
                </span>
                <span className="text-surface-400">Liabilities</span>
                <div className="w-2 h-2 rounded-full bg-danger-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Bank Accounts',
            count: groupedAccounts.bank.length,
            icon: Building2,
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
          },
          {
            label: 'Credit Cards',
            count: groupedAccounts.credit.length,
            icon: CreditCard,
            color: 'text-purple-400',
            bg: 'bg-purple-500/20',
          },
          {
            label: 'Cash',
            count: groupedAccounts.cash.length,
            icon: Banknote,
            color: 'text-success-400',
            bg: 'bg-success-500/20',
          },
          {
            label: 'Investments',
            count: groupedAccounts.investment.length,
            icon: TrendingUp,
            color: 'text-warning-400',
            bg: 'bg-warning-500/20',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-800/40 border border-surface-700/30 rounded-xl p-3 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-50">
                {stat.count}
              </p>
              <p className="text-xs text-surface-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-surface-50">
            All Accounts
          </h2>
          <span className="text-sm text-surface-400">
            {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
          </span>
        </div>

        <div className="grid gap-3">
          {accounts.map((account) => {
            const Icon = getAccountIcon(account.type);
            const isNegative = account.balance < 0;
            const isCredit = account.type === 'credit';

            return (
              <div
                key={account.id}
                className="bg-surface-800/60 border border-surface-700/50 rounded-2xl p-4 hover:border-surface-600/70 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Icon & Details */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${account.color}20` }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: account.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-surface-50">
                        {account.name}
                      </h3>
                      <p className="text-sm text-surface-400">
                        {getAccountTypeLabel(account.type)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Balance & Menu */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold font-mono ${
                          isCredit
                            ? isNegative
                              ? 'text-danger-400'
                              : 'text-surface-50'
                            : isNegative
                              ? 'text-danger-400'
                              : 'text-surface-50'
                        }`}
                      >
                        {formatCurrency(account.balance)}
                      </p>
                      {isCredit && account.balance < 0 && (
                        <p className="text-xs text-surface-400">Outstanding</p>
                      )}
                    </div>
                    <button
                      className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Open account options menu
                      }}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Account Card */}
          <button
            onClick={() => setActiveModal('add-account')}
            className="border-2 border-dashed border-surface-600 hover:border-surface-500 rounded-2xl p-6 flex items-center justify-center gap-3 transition-all duration-200 group"
          >
            <div className="w-10 h-10 bg-surface-700/50 group-hover:bg-surface-700 rounded-xl flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-surface-400 group-hover:text-surface-300" />
            </div>
            <span className="font-medium text-surface-400 group-hover:text-surface-300">
              Add New Account
            </span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {accounts.length === 0 && (
        <div className="bg-surface-800/40 border border-surface-700/30 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-surface-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-surface-400" />
          </div>
          <h3 className="text-lg font-medium text-surface-50 mb-2">
            No accounts yet
          </h3>
          <p className="text-surface-400 text-sm mb-4 max-w-sm mx-auto">
            Add your bank accounts, credit cards, and other financial accounts
            to track your complete financial picture.
          </p>
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setActiveModal('add-account')}
          >
            Add Your First Account
          </Button>
        </div>
      )}
    </div>
  );
};
