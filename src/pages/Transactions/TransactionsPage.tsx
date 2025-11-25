import { Badge, Button, Card, Input } from '@/components/ui';
import { useTransactions } from '@/hooks/useTransactions';
import { useAppStore } from '@/store';
import type { TransactionType } from '@/types';
import { formatCurrency, formatRelativeDate } from '@/utils/formatters';
import { ArrowRightLeft, Filter, Plus, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

export const TransactionsPage = () => {
  const { setActiveModal } = useAppStore();
  const transactions = useTransactions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, filterType]);

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="w-5 h-5 text-success-400" />;
      case 'expense':
        return <TrendingDown className="w-5 h-5 text-danger-400" />;
      case 'transfer':
        return <ArrowRightLeft className="w-5 h-5 text-primary-400" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return 'bg-success-500/20';
      case 'expense':
        return 'bg-danger-500/20';
      case 'transfer':
        return 'bg-primary-500/20';
      default:
        return 'bg-surface-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">
            Transactions
          </h1>
          <p className="text-surface-400 mt-1">
            View and manage all your transactions
          </p>
        </div>
        <Button 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setActiveModal('add-transaction')}
        >
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'income', 'expense', 'transfer'] as const).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
            <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
              More
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      <Card padding="none">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-surface-400 mb-4">No transactions found</p>
            <Button
              variant="outline"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setActiveModal('add-transaction')}
            >
              Add your first transaction
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-surface-800">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-surface-800/50 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-surface-100">
                      {transaction.description || 'Transaction'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge 
                        size="sm" 
                        variant={transaction.type === 'income' ? 'success' : transaction.type === 'expense' ? 'danger' : 'info'}
                      >
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold font-amount ${
                      transaction.type === 'income'
                        ? 'text-success-400'
                        : transaction.type === 'expense'
                          ? 'text-danger-400'
                          : 'text-surface-400'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-sm text-surface-400">
                    {formatRelativeDate(transaction.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
