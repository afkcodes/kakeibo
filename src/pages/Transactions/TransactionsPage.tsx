import { TransactionCard } from '@/components/features/transactions/TransactionCard';
import { Button, Modal } from '@/components/ui';
import { useAccountsWithBalance } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';
import { useGoals } from '@/hooks/useGoals';
import { useTransactionActions, useTransactions } from '@/hooks/useTransactions';
import { useAppStore } from '@/store';
import type { Transaction, TransactionType } from '@/types';
import { Receipt, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type FilterType = 'all' | TransactionType | 'savings';

export const TransactionsPage = () => {
  const { formatCurrency } = useCurrency();
  const { setActiveModal, setEditingTransaction } = useAppStore();
  const transactions = useTransactions();
  const { deleteTransaction } = useTransactionActions();
  const categories = useCategories();
  const goals = useGoals();
  const accounts = useAccountsWithBalance(); // Gets all accounts without userId filter
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const filtered = transactions.filter((t) => {
      const matchesSearch = searchQuery === '' || 
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Handle the 'savings' filter type for goal transactions
      let matchesType = false;
      if (filterType === 'all') {
        matchesType = true;
      } else if (filterType === 'savings') {
        matchesType = t.type === 'goal-contribution' || t.type === 'goal-withdrawal';
      } else {
        matchesType = t.type === filterType;
      }
      
      return matchesSearch && matchesType;
    });

    // Sort by date descending
    const sorted = [...filtered].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Group by date
    const groups: { date: string; transactions: Transaction[] }[] = [];
    let currentDate = '';
    let currentGroup: Transaction[] = [];

    sorted.forEach((t) => {
      const dateStr = new Date(t.date).toDateString();
      if (dateStr !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, transactions: currentGroup });
        }
        currentDate = dateStr;
        currentGroup = [t];
      } else {
        currentGroup.push(t);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, transactions: currentGroup });
    }

    return groups;
  }, [transactions, searchQuery, filterType]);

  const totalCount = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = searchQuery === '' || 
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Handle the 'savings' filter type for goal transactions
      let matchesType = false;
      if (filterType === 'all') {
        matchesType = true;
      } else if (filterType === 'savings') {
        matchesType = t.type === 'goal-contribution' || t.type === 'goal-withdrawal';
      } else {
        matchesType = t.type === filterType;
      }
      
      return matchesSearch && matchesType;
    }).length;
  }, [transactions, searchQuery, filterType]);

  const getCategory = (categoryId?: string) => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId);
  };

  const getGoal = (goalId?: string) => {
    if (!goalId) return null;
    return goals.find(g => g.id === goalId);
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="min-h-full pb-6 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-surface-50 tracking-tight">Transactions</h1>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-surface-500" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-800/60 border border-surface-700/50 rounded-xl squircle pl-11 pr-10 py-3 text-[15px] text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-surface-500 hover:text-surface-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-surface-800/40 rounded-xl squircle mb-5">
        {(['all', 'expense', 'income', 'savings'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type as FilterType)}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              filterType === type
                ? 'bg-surface-700 text-surface-50 shadow-sm'
                : 'text-surface-400 hover:text-surface-300'
            }`}
          >
            {type === 'all' ? 'All' : type === 'expense' ? 'Expenses' : type === 'income' ? 'Income' : 'Savings'}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-5">
        {groupedTransactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-xl squircle bg-surface-800/50 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-7 h-7 text-surface-600" />
            </div>
            <p className="text-surface-300 font-semibold text-[15px]">No transactions</p>
            <p className="text-surface-500 text-[13px] mt-1.5">
              {searchQuery ? 'Try a different search' : 'Add your first transaction'}
            </p>
          </div>
        ) : (
          groupedTransactions.map((group) => (
            <section key={group.date}>
              {/* Date Header */}
              <h2 className="text-surface-500 text-[13px] font-semibold mb-2.5 px-0.5">
                {formatDateHeader(group.date)}
              </h2>

              {/* Transaction Cards */}
              <div className="space-y-2">
                {group.transactions.map((transaction) => {
                  const category = getCategory(transaction.categoryId);
                  const goal = getGoal(transaction.goalId);
                  const isGoalTransaction = transaction.type === 'goal-contribution' || transaction.type === 'goal-withdrawal';
                  const account = accounts.find(a => a.id === transaction.accountId);
                  const toAccount = transaction.toAccountId ? accounts.find(a => a.id === transaction.toAccountId) : undefined;

                  const handleEditTransaction = () => {
                    setEditingTransaction(transaction);
                    setActiveModal('add-transaction');
                  };

                  const handleDeleteTransaction = () => {
                    setTransactionToDelete(transaction);
                  };

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
                      goalName={goal?.name}
                      accountName={account?.name}
                      toAccountName={toAccount?.name}
                      isEssential={transaction.isEssential}
                      formatCurrency={formatCurrency}
                      onEdit={isGoalTransaction ? undefined : handleEditTransaction}
                      onDelete={handleDeleteTransaction}
                    />
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Footer count */}
      {totalCount > 0 && (
        <p className="text-center text-surface-600 text-[12px] mt-8">
          Showing {totalCount} transaction{totalCount !== 1 ? 's' : ''}
        </p>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        title="Delete Transaction"
      >
        <div className="space-y-4">
          <p className="text-surface-300 text-[14px]">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setTransactionToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                if (transactionToDelete) {
                  deleteTransaction(transactionToDelete.id);
                  setTransactionToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
