import { CategoryIcon } from '@/components/ui';
import { useBudgetProgress } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';
import { useAppStore } from '@/store';
import { PieChart, Plus } from 'lucide-react';
import { useMemo } from 'react';

export const BudgetsPage = () => {
  const { currentUserId, setActiveModal } = useAppStore();
  const { formatCurrency } = useCurrency();
  const budgetProgress = useBudgetProgress(currentUserId ?? undefined);
  const categories = useCategories(currentUserId ?? undefined);

  // Create a map of category id to category for quick lookup
  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, typeof categories[0]>);
  }, [categories]);

  // Calculate overview stats
  const stats = useMemo(() => {
    const totalBudget = budgetProgress.reduce((sum, b) => sum + b.budget.amount, 0);
    const totalSpent = budgetProgress.reduce((sum, b) => sum + b.spent, 0);
    const remaining = totalBudget - totalSpent;
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    return { totalBudget, totalSpent, remaining, percentage };
  }, [budgetProgress]);

  // Days remaining in month
  const daysRemaining = useMemo(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.getDate() - now.getDate();
  }, []);

  return (
    <div className="min-h-full pb-6 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-surface-50 tracking-tight">Budgets</h1>
        <p className="text-surface-500 text-[14px] mt-0.5">{daysRemaining} days left this month</p>
      </div>

      {/* Overview Card */}
      {budgetProgress.length > 0 && (
        <div className="bg-surface-800/40 border border-surface-700/30 rounded-xl squircle p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-surface-500 text-[13px] font-medium">Monthly Overview</p>
              <p className="text-surface-50 text-[28px] font-bold font-amount mt-1">
                {formatCurrency(stats.totalSpent)}
              </p>
              <p className="text-surface-500 text-[13px]">
                of {formatCurrency(stats.totalBudget)} budgeted
              </p>
            </div>
            <div className="text-right">
              <div className={`text-[24px] font-bold font-amount ${stats.remaining >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                {stats.remaining >= 0 ? formatCurrency(stats.remaining) : `−${formatCurrency(Math.abs(stats.remaining))}`}
              </div>
              <p className="text-surface-500 text-[13px]">
                {stats.remaining >= 0 ? 'remaining' : 'over budget'}
              </p>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="h-2.5 bg-surface-700/50 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                stats.percentage > 100 ? 'bg-danger-500' : 
                stats.percentage > 80 ? 'bg-warning-500' : 
                'bg-success-500'
              }`}
              style={{ width: `${Math.min(stats.percentage, 100)}%` }}
            />
          </div>
          <p className="text-surface-500 text-[12px] mt-2 text-center">
            {stats.percentage.toFixed(0)}% of total budget used
          </p>
        </div>
      )}

      {/* Budget List */}
      {budgetProgress.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl squircle bg-surface-800/50 flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-7 h-7 text-surface-600" />
          </div>
          <p className="text-surface-300 font-semibold text-[15px]">No budgets yet</p>
          <p className="text-surface-500 text-[13px] mt-1.5 max-w-60 mx-auto mb-5">
            Create budgets to track spending by category
          </p>
          <button
            onClick={() => setActiveModal('add-budget')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-[14px] font-semibold rounded-xl squircle transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Budget
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {budgetProgress.map((bp) => {
            const category = categoryMap[bp.budget.categoryId];
            const categoryName = category?.name || 'Unknown';
            const isOverBudget = bp.isOverBudget;
            const isWarning = !isOverBudget && bp.percentage >= 80;

            return (
              <div 
                key={bp.budget.id} 
                className="bg-surface-800/40 border border-surface-700/30 rounded-xl squircle p-4 active:scale-[0.98] transition-transform"
              >
                {/* Header Row */}
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (category?.color || '#6b7280') + '18' }}
                  >
                    <CategoryIcon 
                      icon={category?.icon || 'more-horizontal'} 
                      color={category?.color} 
                      size="md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface-100 text-[15px] font-semibold truncate">
                      {categoryName}
                    </p>
                    <p className="text-surface-500 text-[12px] capitalize">
                      {bp.budget.period} budget
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold font-amount text-[15px] ${
                      isOverBudget ? 'text-danger-400' : 
                      isWarning ? 'text-warning-400' : 
                      'text-surface-100'
                    }`}>
                      {formatCurrency(bp.spent)}
                    </p>
                    <p className="text-surface-500 text-[12px]">
                      / {formatCurrency(bp.budget.amount)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden mb-2.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOverBudget ? 'bg-danger-500' : 
                      isWarning ? 'bg-warning-500' : 
                      'bg-primary-500'
                    }`}
                    style={{ width: `${Math.min(bp.percentage, 100)}%` }}
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${
                    isOverBudget 
                      ? 'bg-danger-500/15 text-danger-400' 
                      : isWarning 
                        ? 'bg-warning-500/15 text-warning-400' 
                        : 'bg-success-500/15 text-success-400'
                  }`}>
                    {isOverBudget ? 'Over budget' : isWarning ? 'Almost there' : 'On track'}
                  </span>
                  <span className={`text-[13px] font-medium font-amount ${
                    isOverBudget ? 'text-danger-400' : 'text-success-400'
                  }`}>
                    {isOverBudget ? `−${formatCurrency(Math.abs(bp.remaining))}` : `${formatCurrency(bp.remaining)} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
