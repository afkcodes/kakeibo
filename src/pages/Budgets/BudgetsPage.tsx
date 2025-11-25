import { Badge, Button, Card, ProgressBar } from '@/components/ui';
import { useBudgetProgress } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useAppStore } from '@/store';
import { formatCurrency } from '@/utils/formatters';
import { PiggyBank, Plus } from 'lucide-react';
import { useMemo } from 'react';

export const BudgetsPage = () => {
  const { setActiveModal, currentUserId } = useAppStore();
  const budgetProgress = useBudgetProgress(currentUserId ?? undefined);
  const categories = useCategories(currentUserId ?? undefined);

  // Create a map of category id to category for quick lookup
  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, typeof categories[0]>);
  }, [categories]);

  const totalBudget = budgetProgress.reduce((sum, b) => sum + b.budget.amount, 0);
  const totalSpent = budgetProgress.reduce((sum, b) => sum + b.spent, 0);
  const overBudgetCount = budgetProgress.filter((b) => b.isOverBudget).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">
            Budgets
          </h1>
          <p className="text-surface-400 mt-1">
            Manage your monthly spending limits
          </p>
        </div>
        <Button 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setActiveModal('add-budget')}
        >
          Create Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-xl">
              <PiggyBank className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Total Budget</p>
              <p className="text-xl font-bold text-surface-100 font-amount">
                {formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning-500/20 rounded-xl">
              <PiggyBank className="w-6 h-6 text-warning-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Total Spent</p>
              <p className="text-xl font-bold text-surface-100 font-amount">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className={`p-3 ${overBudgetCount > 0 ? 'bg-danger-500/20' : 'bg-success-500/20'} rounded-xl`}>
              <PiggyBank className={`w-6 h-6 ${overBudgetCount > 0 ? 'text-danger-400' : 'text-success-400'}`} />
            </div>
            <div>
              <p className="text-sm text-surface-400">Over Budget</p>
              <p className="text-xl font-bold text-surface-100">
                {overBudgetCount} {overBudgetCount === 1 ? 'category' : 'categories'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Cards */}
      {budgetProgress.length === 0 ? (
        <Card className="text-center py-12">
          <PiggyBank className="w-12 h-12 text-surface-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-100 mb-2">
            No budgets yet
          </h3>
          <p className="text-surface-400 mb-4">
            Create your first budget to start tracking your spending
          </p>
          <Button 
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setActiveModal('add-budget')}
          >
            Create Budget
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetProgress.map((bp) => {
            const category = categoryMap[bp.budget.categoryId];
            const categoryName = category?.name || 'Unknown Category';
            const categoryIcon = category?.icon || '📊';

            return (
              <Card key={bp.budget.id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{categoryIcon}</span>
                    <div>
                      <h3 className="font-semibold text-surface-100">
                        {categoryName}
                      </h3>
                      <p className="text-sm text-surface-400 capitalize">
                        {bp.budget.period} budget
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={bp.isOverBudget ? 'danger' : bp.percentage >= 80 ? 'warning' : 'success'}
                  >
                    {bp.isOverBudget ? 'Over budget' : bp.percentage >= 80 ? 'Almost there' : 'On track'}
                  </Badge>
                </div>

                <ProgressBar
                  value={Math.min(bp.percentage, 100)}
                  showLabel
                  size="md"
                  variant={bp.isOverBudget ? 'danger' : bp.percentage >= 80 ? 'warning' : 'default'}
                />

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-700">
                  <div>
                    <p className="text-sm text-surface-400">Spent</p>
                    <p className="font-semibold text-surface-100 font-amount">
                      {formatCurrency(bp.spent)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-surface-400">
                      {bp.isOverBudget ? 'Over by' : 'Remaining'}
                    </p>
                    <p className={`font-semibold font-amount ${bp.isOverBudget ? 'text-danger-400' : 'text-success-400'}`}>
                      {formatCurrency(Math.abs(bp.remaining))}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
