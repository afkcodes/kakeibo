import { useCurrency } from '@/hooks/useCurrency';
import { useGoalActions, useGoalProgress } from '@/hooks/useGoals';
import { useAppStore } from '@/store';
import type { Goal } from '@/types';
import { formatDate } from '@/utils/formatters';
import { Calendar, CreditCard, MoreVertical, Pencil, PiggyBank, Plus, Target, Trash2, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export const GoalsPage = () => {
  const { setActiveModal, currentUserId, setEditingGoal } = useAppStore();
  const { formatCurrency } = useCurrency();
  const goalProgress = useGoalProgress(currentUserId ?? undefined);
  const { deleteGoal } = useGoalActions();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
        setDeletingGoalId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenuId]);

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setActiveModal('add-goal');
    setOpenMenuId(null);
  };

  const handleDeleteGoal = async (goalId: string) => {
    await deleteGoal(goalId);
    setOpenMenuId(null);
    setDeletingGoalId(null);
  };

  const activeGoals = goalProgress.filter(gp => gp.goal.status === 'active');
  
  const totalSavingsTarget = activeGoals
    .filter((gp) => gp.goal.type === 'savings')
    .reduce((sum, gp) => sum + gp.goal.targetAmount, 0);
  const totalSaved = activeGoals
    .filter((gp) => gp.goal.type === 'savings')
    .reduce((sum, gp) => sum + gp.goal.currentAmount, 0);
  
  const overallPercentage = totalSavingsTarget > 0 ? (totalSaved / totalSavingsTarget) * 100 : 0;

  const upcomingGoals = activeGoals.filter((gp) => {
    if (!gp.goal.deadline) return false;
    const deadline = new Date(gp.goal.deadline);
    const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    return deadline < ninetyDaysFromNow;
  });

  return (
    <div className="min-h-full pb-6 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-surface-50 tracking-tight">Goals</h1>
        <p className="text-surface-500 text-[14px] mt-0.5">
          {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''} • {upcomingGoals.length} upcoming deadline{upcomingGoals.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Overview Card */}
      {activeGoals.length > 0 && (
        <div className="bg-surface-800/40 border border-surface-700/30 rounded-xl squircle p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-surface-500 text-[13px] font-medium">Total Progress</p>
              <p className="text-surface-50 text-[28px] font-bold font-amount mt-1">
                {formatCurrency(totalSaved)}
              </p>
              <p className="text-surface-500 text-[13px]">
                of {formatCurrency(totalSavingsTarget)} target
              </p>
            </div>
            <div className="text-right">
              <div className="text-[24px] font-bold font-amount text-primary-400">
                {overallPercentage.toFixed(0)}%
              </div>
              <p className="text-surface-500 text-[13px]">
                completed
              </p>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="h-2.5 bg-surface-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-primary-500"
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-surface-700/50">
            <div className="text-center">
              <div className="w-8 h-8 rounded-lg bg-success-500/15 flex items-center justify-center mx-auto mb-1.5">
                <Target className="w-4 h-4 text-success-400" />
              </div>
              <p className="text-surface-50 text-[15px] font-bold">{activeGoals.length}</p>
              <p className="text-surface-500 text-[11px]">Active</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center mx-auto mb-1.5">
                <TrendingUp className="w-4 h-4 text-primary-400" />
              </div>
              <p className="text-surface-50 text-[15px] font-bold font-amount">{formatCurrency(totalSaved)}</p>
              <p className="text-surface-500 text-[11px]">Saved</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-lg bg-warning-500/15 flex items-center justify-center mx-auto mb-1.5">
                <Calendar className="w-4 h-4 text-warning-400" />
              </div>
              <p className="text-surface-50 text-[15px] font-bold">{upcomingGoals.length}</p>
              <p className="text-surface-500 text-[11px]">Upcoming</p>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {activeGoals.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl squircle bg-surface-800/50 flex items-center justify-center mx-auto mb-4">
            <Target className="w-7 h-7 text-surface-600" />
          </div>
          <p className="text-surface-300 font-semibold text-[15px]">No goals yet</p>
          <p className="text-surface-500 text-[13px] mt-1.5 max-w-60 mx-auto mb-5">
            Create goals to track your savings and debt payoff progress
          </p>
          <button
            onClick={() => setActiveModal('add-goal')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-[14px] font-semibold rounded-xl squircle transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Goal
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeGoals.map((gp) => {
            const { goal, percentage, remaining, daysUntilDeadline } = gp;
            const isNearDeadline = daysUntilDeadline !== undefined && daysUntilDeadline < 30;
            const isAlmostDone = percentage >= 80;

            return (
              <div 
                key={goal.id} 
                className="relative flex items-center gap-3 bg-surface-800/40 border border-surface-700/30 rounded-xl squircle p-3.5"
              >
                {/* Goal Icon */}
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (goal.color || '#5B6EF5') + '18', color: goal.color || '#5B6EF5' }}
                >
                  {goal.type === 'savings' ? (
                    <PiggyBank className="w-5 h-5" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-surface-100 text-[14px] font-semibold truncate">
                        {goal.name}
                      </p>
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-md shrink-0 ${
                        goal.type === 'savings' 
                          ? 'bg-success-500/15 text-success-400' 
                          : 'bg-danger-500/15 text-danger-400'
                      }`}>
                        {goal.type === 'savings' ? 'Savings' : 'Debt'}
                      </span>
                    </div>
                    <p className={`font-bold font-amount text-[14px] shrink-0 ml-2 ${
                      isAlmostDone ? 'text-success-400' : 'text-surface-100'
                    }`}>
                      {formatCurrency(goal.currentAmount)} <span className="text-surface-500 font-normal">/ {formatCurrency(goal.targetAmount)}</span>
                    </p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-1.5 bg-surface-700/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isAlmostDone ? 'bg-success-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`text-[11px] font-medium ${
                      isAlmostDone ? 'text-success-400' : 'text-surface-400'
                    }`}>
                      {percentage.toFixed(0)}% complete • {formatCurrency(remaining)} to go
                    </span>
                    {goal.deadline && daysUntilDeadline !== undefined && (
                      <span className={`text-[11px] font-medium ${
                        isNearDeadline ? 'text-danger-400' : 'text-surface-400'
                      }`}>
                        {isNearDeadline ? `${daysUntilDeadline}d left` : formatDate(goal.deadline, 'MMM dd')}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3-dot Menu */}
                <div className="relative shrink-0" ref={openMenuId === goal.id ? menuRef : null}>
                  <button
                    className="p-1.5 -mr-1 rounded-lg active:bg-surface-700/50 text-surface-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === goal.id ? null : goal.id);
                      setDeletingGoalId(null);
                    }}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {openMenuId === goal.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-surface-800 border border-surface-700 rounded-xl squircle shadow-xl z-50 py-1 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                      {deletingGoalId === goal.id ? (
                        <div className="px-4 py-3">
                          <p className="text-[13px] text-surface-200 mb-3">Delete this goal?</p>
                          <div className="flex gap-2">
                            <button
                              className="flex-1 px-3 py-1.5 text-[12px] font-medium bg-surface-700 text-surface-300 rounded-lg active:bg-surface-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingGoalId(null);
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="flex-1 px-3 py-1.5 text-[12px] font-medium bg-danger-500 text-white rounded-lg active:bg-danger-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGoal(goal.id);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            className="w-full px-4 py-2.5 text-left text-sm text-surface-200 active:bg-surface-700/50 flex items-center gap-3 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditGoal(goal);
                            }}
                          >
                            <Pencil className="w-4 h-4 text-surface-400" />
                            Edit Goal
                          </button>
                          <div className="h-px bg-surface-700 my-1" />
                          <button
                            className="w-full px-4 py-2.5 text-left text-sm text-danger-400 active:bg-danger-500/10 flex items-center gap-3 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingGoalId(goal.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
