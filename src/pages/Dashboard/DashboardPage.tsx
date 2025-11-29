import { TransactionCard } from '@/components/features/transactions/TransactionCard';
import { Button, CategoryIcon, ProgressBar } from '@/components/ui';
import { useAccountsWithBalance } from '@/hooks/useAccounts';
import { useBudgetProgress } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';
import { useGoalProgress } from '@/hooks/useGoals';
import { useTransactionActions, useTransactions } from '@/hooks/useTransactions';
import { useAppStore } from '@/store';
import type { Account, Transaction } from '@/types';
import { formatRelativeDate } from '@/utils/formatters';
import { Link } from '@tanstack/react-router';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  Layers,
  Settings,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export const DashboardPage = () => {
  const { setActiveModal, setEditingTransaction, selectedDashboardAccountId, setSelectedDashboardAccountId } = useAppStore();
  const { formatCurrency, formatCurrencyCompact } = useCurrency();
  const transactions = useTransactions();
  const { deleteTransaction } = useTransactionActions();
  const accounts = useAccountsWithBalance();
  const budgetProgress = useBudgetProgress();
  const goalProgress = useGoalProgress();
  const categories = useCategories();
  const [showBalance, setShowBalance] = useState(true);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const accountPickerRef = useRef<HTMLDivElement>(null);

  // Close account picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountPickerRef.current && !accountPickerRef.current.contains(event.target as Node)) {
        setShowAccountPicker(false);
      }
    };

    if (showAccountPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAccountPicker]);

  // Get selected account or null for all accounts
  const selectedAccount = useMemo(() => {
    if (!selectedDashboardAccountId) return null;
    return accounts.find(a => a.id === selectedDashboardAccountId) || null;
  }, [accounts, selectedDashboardAccountId]);

  // If selected account was deleted, reset to all accounts
  useMemo(() => {
    if (selectedDashboardAccountId && accounts.length > 0 && !selectedAccount) {
      setSelectedDashboardAccountId(null);
    }
  }, [selectedAccount, selectedDashboardAccountId, accounts.length, setSelectedDashboardAccountId]);

  // Calculate balance based on selection
  const displayBalance = useMemo(() => {
    if (selectedAccount) {
      return selectedAccount.balance;
    }
    return accounts.reduce((sum: number, acc: Account) => sum + acc.balance, 0);
  }, [accounts, selectedAccount]);

  // Filter transactions by selected account
  const filteredTransactions = useMemo(() => {
    if (!selectedAccount) return transactions;
    return transactions.filter((t: Transaction) => 
      t.accountId === selectedAccount.id || t.toAccountId === selectedAccount.id
    );
  }, [transactions, selectedAccount]);

  // Get recent transactions (last 5) based on selection
  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredTransactions]);

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setActiveModal('add-transaction');
  };

  // Handle delete transaction
  const handleDeleteTransaction = (transactionId: string) => {
    deleteTransaction(transactionId);
  };

  // Calculate monthly stats based on filtered transactions
  const { monthlyIncome, monthlyExpenses } = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTransactions = filteredTransactions.filter(
      (t: Transaction) => new Date(t.date) >= startOfMonth
    );

    const income = monthlyTransactions
      .filter((t: Transaction) => t.type === 'income')
      .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);

    const expenses = monthlyTransactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);

    return { monthlyIncome: income, monthlyExpenses: expenses };
  }, [filteredTransactions]);

  const savings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  // Get spending by category for this month
  const spendingByCategory = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyExpenseTransactions = filteredTransactions.filter(
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
  }, [filteredTransactions, categories]);

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
          src="https://api.dicebear.com/9.x/notionists/svg?seed=kakeibo&backgroundColor=b6e3f4" 
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

      {/* Hero Balance Card - Credit Card Style (Squircle) */}
      <div 
        className="relative p-5 squircle" 
        style={{ 
          background: 'linear-gradient(135deg, #5B6EF5 0%, #4A5BD9 50%, #3D4FC7 100%)',
          boxShadow: '0 14px 40px -8px rgba(91, 110, 245, 0.5), 0 6px 20px -4px rgba(74, 91, 217, 0.3)',
        }}
      >
        {/* Curved Lines SVG Pattern */}
        <svg 
          className="absolute inset-0 w-full h-full overflow-hidden rounded-[20px]" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 400 250"
        >
          {/* Multiple curved lines */}
          {[...Array(12)].map((_, i) => (
            <path
              key={i}
              d={`M ${-50 + i * 40} 300 Q ${100 + i * 40} ${150 - i * 10}, ${400 + i * 30} ${-50 + i * 20}`}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1.5"
            />
          ))}
        </svg>
        
        <div className="relative z-10">
          {/* Top Row - Account Picker & Eye Toggle */}
          <div className="flex items-center justify-between mb-1">
            <div className="relative" ref={accountPickerRef}>
              <button 
                onClick={() => setShowAccountPicker(!showAccountPicker)}
                className="flex items-center gap-1.5 text-white/80 text-[13px] font-medium tracking-wide hover:text-white transition-colors"
              >
                {selectedAccount ? (
                  <>
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{selectedAccount.name}</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5" />
                    <span>All Accounts</span>
                  </>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAccountPicker ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Account Picker Dropdown */}
              {showAccountPicker && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white/15 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl z-10 overflow-hidden max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedDashboardAccountId(null);
                      setShowAccountPicker(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-[13px] flex items-center gap-2 transition-colors ${
                      !selectedAccount ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    All Accounts
                  </button>
                  {accounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => {
                        setSelectedDashboardAccountId(account.id);
                        setShowAccountPicker(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left text-[13px] flex items-center gap-2 transition-colors ${
                        selectedAccount?.id === account.id ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <div 
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                      >
                        <Wallet className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="truncate">{account.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {showBalance ? (
                <Eye className="w-4 h-4 text-white/80" />
              ) : (
                <EyeOff className="w-4 h-4 text-white/80" />
              )}
            </button>
          </div>
          
          {/* Balance Amount */}
          <div className="mb-5">
            <h1 className="text-[32px] font-bold text-white font-amount tracking-tight leading-none">
              {showBalance ? formatCurrencyCompact(displayBalance) : '••••••'}
            </h1>
            <p className="text-white/60 text-[12px] mt-1">
              {selectedAccount 
                ? `${selectedAccount.type.charAt(0).toUpperCase() + selectedAccount.type.slice(1)} · November 2025`
                : `${accounts.length} account${accounts.length > 1 ? 's' : ''} · November 2025`
              }
            </p>
          </div>

          {/* Income/Expense - Stacked Layout */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
                </div>
                <span className="text-white/70 text-[13px]">Income</span>
              </div>
              <span className="text-emerald-300 font-semibold font-amount text-[15px]">
                {showBalance ? formatCurrencyCompact(monthlyIncome) : '••••'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-rose-300" />
                </div>
                <span className="text-white/70 text-[13px]">Expenses</span>
              </div>
              <span className="text-rose-300 font-semibold font-amount text-[15px]">
                {showBalance ? formatCurrencyCompact(monthlyExpenses) : '••••'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Meter - Container as Gradient Progress */}
      {monthlyIncome > 0 && (
        <div 
          className="relative overflow-hidden rounded-xl squircle h-20 transition-all duration-700 ease-out"
          style={{ 
            background: `linear-gradient(90deg, 
              rgba(244, 63, 94, 0.25) 0%, 
              rgba(244, 63, 94, 0.15) ${Math.min((monthlyExpenses / monthlyIncome) * 100, 100) * 0.8}%, 
              rgba(100, 100, 120, 0.1) ${Math.min((monthlyExpenses / monthlyIncome) * 100, 100)}%, 
              rgba(16, 185, 129, 0.15) ${Math.min((monthlyExpenses / monthlyIncome) * 100, 100) + (savingsRate * 0.2)}%, 
              rgba(16, 185, 129, 0.25) 100%)`
          }}
        >
          
          {/* Content overlay */}
          <div className="relative z-10 h-full px-4 py-3 flex items-center justify-between">
            {/* Spent side */}
            <div className="flex-1">
              <p className="text-danger-400 text-[11px] font-medium uppercase tracking-wider mb-0.5">Spent</p>
              <p className="text-surface-100 text-[18px] font-bold font-amount">
                {showBalance ? formatCurrencyCompact(monthlyExpenses) : '••••'}
              </p>
              <p className="text-danger-400/70 text-[11px]">
                {((monthlyExpenses / monthlyIncome) * 100).toFixed(0)}% of income
              </p>
            </div>
            
            {/* Center badge */}
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
              savings >= 0 
                ? 'bg-success-500/20 text-success-400' 
                : 'bg-danger-500/20 text-danger-400'
            }`}>
              {savings >= 0 ? (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {savingsRate.toFixed(0)}%
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Over
                </span>
              )}
            </div>
            
            {/* Saved side */}
            <div className="flex-1 text-right">
              <p className="text-success-400 text-[11px] font-medium uppercase tracking-wider mb-0.5">Saved</p>
              <p className="text-surface-100 text-[18px] font-bold font-amount">
                {showBalance ? formatCurrencyCompact(Math.max(savings, 0)) : '••••'}
              </p>
              <p className="text-success-400/70 text-[11px]">
                {savingsRate.toFixed(0)}% of income
              </p>
            </div>
          </div>
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
                className="bg-surface-800/50 border border-surface-700/50 rounded-xl squircle p-3.5"
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
                  {formatCurrencyCompact(item.amount)}
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
                  className="bg-surface-800/50 border border-surface-700/50 rounded-xl squircle p-3.5"
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
                    {formatCurrencyCompact(bp.remaining)} remaining
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
                className="bg-surface-800/50 border border-surface-700/50 rounded-xl squircle p-3.5"
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
                className="flex items-center justify-between bg-surface-800/50 border border-surface-700/50 rounded-xl squircle p-3.5"
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
                  {showBalance ? formatCurrencyCompact(account.balance) : '••••••'}
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
          <div className="text-center py-10 bg-surface-800/30 rounded-xl squircle border border-surface-700/30">
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
              return (
                <TransactionCard
                  key={transaction.id}
                  id={transaction.id}
                  description={transaction.description}
                  amount={transaction.amount}
                  type={transaction.type}
                  date={transaction.date.toString()}
                  category={category ? {
                    name: category.name,
                    icon: category.icon,
                    color: category.color,
                  } : undefined}
                  formatCurrency={formatCurrency}
                  formatDate={formatRelativeDate}
                  onEdit={() => handleEditTransaction(transaction)}
                  onDelete={() => handleDeleteTransaction(transaction.id)}
                  variant="compact"
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Empty State for New Users */}
      {accounts.length === 0 && transactions.length === 0 && (
        <div className="bg-surface-800/50 border border-surface-700/50 rounded-xl squircle p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-primary-400" />
          </div>
          <h3 className="text-surface-100 font-semibold text-[15px] mb-1.5">Welcome to Kakeibo!</h3>
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
