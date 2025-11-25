import { Badge, Button, Card, ProgressBar } from '@/components/ui';
import { useCurrency } from '@/hooks/useCurrency';
import { useGoalProgress } from '@/hooks/useGoals';
import { useAppStore } from '@/store';
import { formatDate } from '@/utils/formatters';
import { Calendar, Plus, Target, TrendingUp } from 'lucide-react';

export const GoalsPage = () => {
  const { setActiveModal, currentUserId } = useAppStore();
  const { formatCurrency } = useCurrency();
  const goalProgress = useGoalProgress(currentUserId ?? undefined);

  const activeGoals = goalProgress.filter(gp => gp.goal.status === 'active');
  
  const totalSavingsTarget = activeGoals
    .filter((gp) => gp.goal.type === 'savings')
    .reduce((sum, gp) => sum + gp.goal.targetAmount, 0);
  const totalSaved = activeGoals
    .filter((gp) => gp.goal.type === 'savings')
    .reduce((sum, gp) => sum + gp.goal.currentAmount, 0);

  const upcomingGoals = activeGoals.filter((gp) => {
    if (!gp.goal.deadline) return false;
    const deadline = new Date(gp.goal.deadline);
    const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    return deadline < ninetyDaysFromNow;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">
            Financial Goals
          </h1>
          <p className="text-surface-400 mt-1">
            Track your savings and debt payoff goals
          </p>
        </div>
        <Button 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setActiveModal('add-goal')}
        >
          Add Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-500/20 rounded-xl">
              <Target className="w-6 h-6 text-success-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Active Goals</p>
              <p className="text-xl font-bold text-surface-100">
                {activeGoals.length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Total Saved</p>
              <p className="text-xl font-bold text-surface-100 font-amount">
                {formatCurrency(totalSaved)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning-500/20 rounded-xl">
              <Target className="w-6 h-6 text-warning-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Target Amount</p>
              <p className="text-xl font-bold text-surface-100 font-amount">
                {formatCurrency(totalSavingsTarget)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-danger-500/20 rounded-xl">
              <Calendar className="w-6 h-6 text-danger-400" />
            </div>
            <div>
              <p className="text-sm text-surface-400">Upcoming</p>
              <p className="text-xl font-bold text-surface-100">
                {upcomingGoals.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Goals Grid */}
      {activeGoals.length === 0 ? (
        <Card className="text-center py-12">
          <Target className="w-12 h-12 text-surface-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-100 mb-2">
            No goals yet
          </h3>
          <p className="text-surface-400 mb-4">
            Create your first financial goal to start tracking your progress
          </p>
          <Button 
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setActiveModal('add-goal')}
          >
            Add Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeGoals.map((gp) => {
            const { goal, percentage, remaining, daysUntilDeadline } = gp;

            return (
              <Card key={goal.id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: goal.color + '20' }}
                    >
                      {goal.type === 'savings' ? '💰' : '💳'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-100">
                        {goal.name}
                      </h3>
                      <Badge size="sm" variant={goal.type === 'savings' ? 'success' : 'danger'}>
                        {goal.type === 'savings' ? 'Savings Goal' : 'Debt Payoff'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-400">Progress</span>
                    <span className="font-medium text-surface-100 font-amount">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>

                  <ProgressBar
                    value={Math.min(percentage, 100)}
                    showLabel
                    size="md"
                    variant={goal.type === 'debt' ? 'danger' : 'success'}
                  />

                  <div className="flex items-center justify-between pt-3 border-t border-surface-700">
                    <div>
                      <p className="text-sm text-surface-400">Remaining</p>
                      <p className="font-semibold text-surface-100 font-amount">
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                    {goal.deadline && daysUntilDeadline !== undefined && (
                      <div className="text-right">
                        <p className="text-sm text-surface-400">Deadline</p>
                        <p className={`font-semibold ${daysUntilDeadline < 30 ? 'text-danger-400' : 'text-surface-100'}`}>
                          {formatDate(goal.deadline, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
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
