import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useAccountsWithBalance } from '@/hooks/useAccounts';
import { useTransactions, useTransactionStats } from '@/hooks/useTransactions';
import { useAppStore } from '@/store';
import type { Account } from '@/types';
import { formatCurrency, formatRelativeDate } from '@/utils/formatters';
import { PiggyBank, Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useMemo } from 'react';

export const DashboardPage = () => {
  const { setActiveModal } = useAppStore();
  const transactions = useTransactions();
  const stats = useTransactionStats();
  const accounts = useAccountsWithBalance();

  // Calculate total balance from all accounts
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum: number, acc: Account) => sum + acc.balance, 0);
  }, [accounts]);

  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Quick stats with safe access
  const monthlyIncome = stats?.monthlyIncome ?? 0;
  const monthlyExpenses = stats?.monthlyExpenses ?? 0;

  const quickStats = [
    {
      label: 'Total Balance',
      value: totalBalance,
      icon: Wallet,
      color: 'primary',
    },
    {
      label: 'Monthly Income',
      value: monthlyIncome,
      icon: TrendingUp,
      color: 'success',
    },
    {
      label: 'Monthly Expenses',
      value: monthlyExpenses,
      icon: TrendingDown,
      color: 'danger',
    },
    {
      label: 'Savings',
      value: monthlyIncome - monthlyExpenses,
      icon: PiggyBank,
      color: 'warning',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">
            Welcome back! 👋
          </h1>
          <p className="text-surface-400 mt-1">
            Here's what's happening with your finances
          </p>
        </div>
        <Button 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setActiveModal('add-transaction')}
        >
          Add Transaction
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            primary: 'bg-primary-500/20 text-primary-400',
            success: 'bg-success-500/20 text-success-400',
            danger: 'bg-danger-500/20 text-danger-400',
            warning: 'bg-warning-500/20 text-warning-400',
          };

          return (
            <Card key={stat.label} hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-surface-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-surface-100 mt-1 font-amount">
                    {formatCurrency(stat.value)}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2" padding="none">
          <CardHeader className="p-4 sm:p-6 pb-0">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-surface-400 mb-4">
                  No transactions yet
                </p>
                <Button
                  variant="outline"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setActiveModal('add-transaction')}
                >
                  Add your first transaction
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-800/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income'
                            ? 'bg-success-500/20'
                            : 'bg-danger-500/20'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-success-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-danger-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-surface-100">
                          {transaction.description || 'Transaction'}
                        </p>
                        <p className="text-sm text-surface-400">
                          {formatRelativeDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold font-amount ${
                        transaction.type === 'income'
                          ? 'text-success-400'
                          : 'text-danger-400'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accounts Overview */}
        <Card padding="none">
          <CardHeader className="p-4 sm:p-6 pb-0">
            <CardTitle>Accounts</CardTitle>
            <Button variant="ghost" size="sm">Manage</Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {accounts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-surface-400 text-sm">
                  No accounts yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: account.color + '20' }}
                      >
                        <Wallet className="w-5 h-5" style={{ color: account.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-surface-100">
                          {account.name}
                        </p>
                        <p className="text-xs text-surface-400 capitalize">
                          {account.type}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold font-amount text-surface-100">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
