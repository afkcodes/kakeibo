import { Button, CategoryIcon, ProgressBar } from '@/components/ui';
import { useAccountsWithBalance } from '@/hooks/useAccounts';
import { useBudgetProgress } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';
import { useGoalProgress } from '@/hooks/useGoals';
import { useTransactions, useTransactionStats } from '@/hooks/useTransactions';
import { useAppStore } from '@/store';
import type { Account, Transaction } from '@/types';
import { formatRelativeDate } from '@/utils/formatters';
import { Link } from '@tanstack/react-router';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  Settings,
  Sparkles,
  Target,
  Wallet
} from 'lucide-react';
import { useMemo, useState } from 'react';

export const DashboardPage = () => {
  const { setActiveModal } = useAppStore();
  const { formatCurrency } = useCurrency();
  const transactions = useTransactions();
  const stats = useTransactionStats();
  const accounts = useAccountsWithBalance();
  const budgetProgress = useBudgetProgress();
  const goalProgress = useGoalProgress();
  const categories = useCategories();
  const [showBalance, setShowBalance] = useState(true);

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
  const savings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  // Get spending by category for this month
  const spendingByCategory = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyExpenseTransactions = transactions.filter(
      (t: Transaction) => t.type === 'expense' && new Date(t.date) >= startOfMonth
    );

    const categorySpending: Record<string, number> = {};
    monthlyExpenseTransactions.forEach((t: Transaction) => {
      if (t.categoryId) {
        categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + Math.abs(t.amount);
      }
    });

    return Object.entries(categorySpending)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          categoryId,
          name: category?.name || 'Other',
          icon: category?.icon || '💰',
          color: category?.color || '#6b7280',
          amount,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [transactions, categories]);

  // Top budgets at risk
  const budgetsAtRisk = useMemo(() => {
    return budgetProgress
      .filter(bp => bp.percentage >= 70 && !bp.isOverBudget)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }, [budgetProgress]);

  // Active goals
  const activeGoals = useMemo(() => {
    return goalProgress
      .filter(gp => gp.goal.status === 'active')
      .slice(0, 2);
  }, [goalProgress]);

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      {/* Top Header - User & Settings */}
      <div className="flex items-center justify-between">
        <img 
          src="https://api.dicebear.com/9.x/notionists/svg?seed=budgeto&backgroundColor=b6e3f4" 
          alt="User" 
          className="w-10 h-10 rounded-full bg-surface-700"
        />
        <Link 
          to="/settings"
          className="p-2 hover:bg-surface-800/50 rounded-full transition-colors"
        >
          <Settings className="w-5 h-5 text-surface-400" />
        </Link>
      </div>

      {/* Hero Balance Card - Dark elegant style */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-800 border border-surface-700/50 p-5">
        {/* Subtle decorative gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-surface-700/20 via-transparent to-surface-900/30" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-surface-400 text-[13px] font-medium tracking-wide uppercase">Total Balance</span>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="w-8 h-8 rounded-full bg-surface-700/50 flex items-center justify-center hover:bg-surface-600/50 transition-colors"
            >
              {showBalance ? (
                <Eye className="w-4 h-4 text-surface-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-surface-400" />
              )}
            </button>
          </div>
          
          <div className="mb-6">
            <h1 className="text-[32px] font-bold text-surface-50 font-amount tracking-tight leading-none">
              {showBalance ? formatCurrency(totalBalance) : '••••••'}
            </h1>
            {accounts.length > 0 && (
              <p className="text-surface-500 text-[13px] mt-1.5 tracking-wide">
                {accounts.length} account{accounts.length > 1 ? 's' : ''} · November 2025
              </p>
            )}
          </div>

          {/* Income/Expense Row */}
          <div className="flex gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success-500/15 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-success-400" />
              </div>
              <div>
                <p className="text-surface-500 text-[11px] font-medium uppercase tracking-wider">Income</p>
                <p className="text-surface-100 font-semibold font-amount text-[15px]">
                  {showBalance ? formatCurrency(monthlyIncome) : '••••'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-danger-500/15 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-danger-400" />
              </div>
              <div>
                <p className="text-surface-500 text-[11px] font-medium uppercase tracking-wider">Expenses</p>
                <p className="text-surface-100 font-semibold font-amount text-[15px]">
                  {showBalance ? formatCurrency(monthlyExpenses) : '••••'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Rate - Compact */}
      {monthlyIncome > 0 && (
        <div className="bg-surface-800/50 border border-surface-700/50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-surface-300 text-[13px] font-medium">This month's savings</span>
            <span className={`text-[15px] font-bold font-amount ${savings >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
              {savings >= 0 ? '+' : ''}{formatCurrency(savings)}
            </span>
          </div>
          <ProgressBar 
            value={Math.min(Math.max(savingsRate, 0), 100)} 
            variant={savingsRate >= 20 ? 'success' : savingsRate >= 10 ? 'warning' : 'danger'}
            size="sm"
          />
          <p className="text-surface-500 text-[12px] mt-2.5 tracking-wide">
            {savingsRate >= 0 ? `${savingsRate.toFixed(0)}% of income saved` : 'Spending more than earning'}
          </p>
        </div>
      )}

      {/* Spending by Category */}
      {spendingByCategory.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-surface-100 font-semibold text-[15px] tracking-tight">Top Spending</h2>
            <Link to="/analytics" className="text-primary-400 text-[12px] font-medium flex items-center gap-0.5 hover:text-primary-300 transition-colors">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {spendingByCategory.map((item) => (
              <div
                key={item.categoryId}
                className="bg-surface-800/50 border border-surface-700/50 rounded-xl p-3.5"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: item.color + '20' }}
                  >
                    <CategoryIcon icon={item.icon} color={item.color} size="sm" />
                  </div>
                  <span className="text-surface-400 text-[12px] font-medium truncate">{item.name}</span>
                </div>
                <p className="text-surface-50 font-bold font-amount text-[15px] tracking-tight">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Budgets at Risk */}
      {budgetsAtRisk.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-surface-100 font-semibold text-[15px] tracking-tight">Budgets to Watch</h2>
            <Link to="/budgets" className="text-primary-400 text-[12px] font-medium flex items-center gap-0.5 hover:text-primary-300 transition-colors">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {budgetsAtRisk.map((bp) => {
              const category = categories.find(c => c.id === bp.budget.categoryId);
              return (
                <div
                  key={bp.budget.id}
                  className="bg-surface-800/50 border border-surface-700/50 rounded-xl p-3.5"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: (category?.color || '#6b7280') + '20' }}
                      >
                        <CategoryIcon icon={category?.icon || 'more-horizontal'} color={category?.color} size="sm" />
                      </div>
                      <span className="text-surface-100 text-[13px] font-medium">{category?.name || 'Budget'}</span>
                    </div>
                    <span className={`text-[12px] font-bold ${bp.percentage >= 90 ? 'text-danger-400' : 'text-warning-400'}`}>
                      {bp.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <ProgressBar 
                    value={bp.percentage} 
                    variant={bp.percentage >= 90 ? 'danger' : 'warning'}
                    size="sm"
                  />
                  <p className="text-surface-500 text-[12px] mt-2 tracking-wide">
                    {formatCurrency(bp.remaining)} remaining
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-surface-100 font-semibold text-[15px] tracking-tight">Goals</h2>
            <Link to="/goals" className="text-primary-400 text-[12px] font-medium flex items-center gap-0.5 hover:text-primary-300 transition-colors">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {activeGoals.map((gp) => (
              <div
                key={gp.goal.id}
                className="bg-surface-800/50 border border-surface-700/50 rounded-xl p-3.5"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: gp.goal.color + '20' }}
                  >
                    <Target className="w-5 h-5" style={{ color: gp.goal.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-surface-100 text-[13px] font-semibold truncate">{gp.goal.name}</h3>
                    <p className="text-surface-500 text-[11px] tracking-wide">
                      {gp.daysUntilDeadline !== undefined ? `${gp.daysUntilDeadline} days left` : 'No deadline'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-surface-50 font-bold font-amount text-[15px]">
                      {gp.percentage.toFixed(0)}%
                    </p>
                  </div>
                </div>
                <ProgressBar 
                  value={gp.percentage} 
                  variant={gp.isOnTrack ? 'default' : 'warning'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Accounts */}
      {accounts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-surface-100 font-semibold text-[15px] tracking-tight">Accounts</h2>
            <Link to="/accounts" className="text-primary-400 text-[12px] font-medium flex items-center gap-0.5 hover:text-primary-300 transition-colors">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {accounts.slice(0, 3).map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between bg-surface-800/50 border border-surface-700/50 rounded-xl p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: account.color + '20' }}
                  >
                    <Wallet className="w-5 h-5" style={{ color: account.color }} />
                  </div>
                  <div>
                    <p className="text-surface-100 text-[13px] font-semibold">{account.name}</p>
                    <p className="text-surface-500 text-[11px] capitalize tracking-wide">{account.type}</p>
                  </div>
                </div>
                <p className="text-surface-50 font-bold font-amount text-[15px]">
                  {showBalance ? formatCurrency(account.balance) : '••••••'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Transactions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-surface-100 font-semibold text-[15px] tracking-tight">Recent Transactions</h2>
          <Link to="/transactions" className="text-primary-400 text-[12px] font-medium flex items-center gap-0.5 hover:text-primary-300 transition-colors">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-10 bg-surface-800/30 rounded-xl border border-surface-700/30">
            <div className="w-12 h-12 rounded-full bg-surface-700/50 flex items-center justify-center mx-auto mb-3">
              <ArrowUpRight className="w-6 h-6 text-surface-500" />
            </div>
            <p className="text-surface-400 text-[13px] font-medium">No transactions yet</p>
            <p className="text-surface-600 text-[11px] mt-1 tracking-wide">Tap + to add your first transaction</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((transaction) => {
              const category = categories.find(c => c.id === transaction.categoryId);
              const isExpense = transaction.type === 'expense';
              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 bg-surface-800/50 border border-surface-700/50 rounded-xl p-3.5"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (category?.color || '#6b7280') + '20' }}
                  >
                    <CategoryIcon icon={category?.icon || 'more-horizontal'} color={category?.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface-100 text-[13px] font-semibold truncate">
                      {transaction.description || category?.name || 'Transaction'}
                    </p>
                    <p className="text-surface-500 text-[11px] tracking-wide">
                      {category?.name} • {formatRelativeDate(transaction.date)}
                    </p>
                  </div>
                  <p className={`font-bold font-amount text-[15px] ${isExpense ? 'text-danger-400' : 'text-success-400'}`}>
                    {isExpense ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Empty State for New Users */}
      {accounts.length === 0 && transactions.length === 0 && (
        <div className="bg-surface-800/50 border border-surface-700/50 rounded-xl p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-primary-400" />
          </div>
          <h3 className="text-surface-100 font-semibold text-[15px] mb-1.5">Welcome to Budgeto!</h3>
          <p className="text-surface-500 text-[13px] mb-4">
            Get started by adding your first account
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveModal('add-account')}
            leftIcon={<CreditCard className="w-4 h-4" />}
          >
            Add Account
          </Button>
        </div>
      )}
    </div>
  );
};
