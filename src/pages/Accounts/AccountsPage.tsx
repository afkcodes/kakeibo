import { Badge, Button, Card } from '@/components/ui';
import { useAccountStats, useAccountsWithBalance } from '@/hooks/useAccounts';
import { useAppStore } from '@/store';
import type { AccountType } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Banknote, CreditCard, MoreVertical, Plus, TrendingUp, Wallet } from 'lucide-react';

const getAccountIcon = (type: AccountType) => {
  switch (type) {
    case 'bank':
      return Wallet;
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

export const AccountsPage = () => {
  const { currentUserId, setActiveModal } = useAppStore();
  const accounts = useAccountsWithBalance(currentUserId ?? undefined);
  const stats = useAccountStats(currentUserId ?? undefined);
  
  const totalAssets = stats?.totalAssets ?? 0;
  const totalLiabilities = stats?.totalLiabilities ?? 0;
  const netWorth = stats?.netWorth ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">
            Accounts
          </h1>
          <p className="text-surface-400 mt-1">
            Manage your bank accounts and cards
          </p>
        </div>
        <Button 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setActiveModal('add-account')}
        >
          Add Account
        </Button>
      </div>

      {/* Net Worth Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Total Assets</p>
              <p className="text-xl font-bold text-success-400 font-amount">
                {formatCurrency(totalAssets)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-danger-500/20 rounded-xl">
              <CreditCard className="w-6 h-6 text-danger-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Total Liabilities</p>
              <p className="text-xl font-bold text-danger-400 font-amount">
                {formatCurrency(totalLiabilities)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-xl">
              <Wallet className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Net Worth</p>
              <p className={`text-xl font-bold font-amount ${netWorth >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => {
          const Icon = getAccountIcon(account.type);

          return (
            <Card key={account.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${account.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: account.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-100">
                      {account.name}
                    </h3>
                    <Badge size="sm">
                      {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <div className="pt-4 border-t border-surface-700">
                <p className="text-sm text-surface-400">Balance</p>
                <p
                  className={`text-2xl font-bold font-amount ${
                    account.balance >= 0
                      ? 'text-surface-100'
                      : 'text-danger-400'
                  }`}
                >
                  {formatCurrency(account.balance)}
                </p>
              </div>
            </Card>
          );
        })}

        {/* Add Account Card */}
        <Card
          hover
          className="border-2 border-dashed border-surface-600 bg-transparent flex items-center justify-center min-h-[180px] cursor-pointer"
          onClick={() => setActiveModal('add-account')}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-surface-400" />
            </div>
            <p className="font-medium text-surface-400">Add Account</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
