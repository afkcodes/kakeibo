import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';
import { useTransactions } from '@/hooks/useTransactions';
import { useAppStore } from '@/store';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type TimeRange = 'week' | 'month' | '3months' | '6months';

export function AnalyticsPage() {
  const { currentUserId } = useAppStore();
  const transactions = useTransactions();
  const categories = useCategories(currentUserId ?? undefined);
  const { formatCurrency } = useCurrency();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // Create category map for quick lookup
  const categoryMap = useMemo(() => {
    return categories.reduce(
      (acc, cat) => {
        acc[cat.id] = cat;
        return acc;
      },
      {} as Record<string, (typeof categories)[0]>
    );
  }, [categories]);

  // Calculate spending by category for current month
  const categoryData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const categorySpending: Record<
      string,
      { name: string; value: number; color: string }
    > = {};

    transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= monthStart && tDate <= monthEnd;
      })
      .forEach((t) => {
        const category = categoryMap[t.categoryId];
        const categoryName = category?.name || 'Other';
        const categoryColor = category?.color || '#64748b';

        if (!categorySpending[t.categoryId]) {
          categorySpending[t.categoryId] = {
            name: categoryName,
            value: 0,
            color: categoryColor,
          };
        }
        categorySpending[t.categoryId].value += Math.abs(t.amount);
      });

    return Object.values(categorySpending).sort((a, b) => b.value - a.value);
  }, [transactions, categoryMap]);

  // Calculate spending trend based on time range
  const spendingTrendData = useMemo(() => {
    const now = new Date();
    const data: { label: string; amount: number }[] = [];

    if (timeRange === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayTotal = transactions
          .filter((t) => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && tDate >= dayStart && tDate <= dayEnd;
          })
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        data.push({
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          amount: dayTotal,
        });
      }
    } else if (timeRange === 'month') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const weekTotal = transactions
          .filter((t) => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && tDate >= weekStart && tDate <= weekEnd;
          })
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        data.push({ label: `Week ${4 - i}`, amount: weekTotal });
      }
    } else {
      // 3 or 6 months
      const monthCount = timeRange === '3months' ? 3 : 6;
      for (let i = monthCount - 1; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        const monthTotal = transactions
          .filter((t) => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && tDate >= monthStart && tDate <= monthEnd;
          })
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        data.push({
          label: format(monthDate, 'MMM'),
          amount: monthTotal,
        });
      }
    }

    return data;
  }, [transactions, timeRange]);

  // Monthly comparison
  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTotal = transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= thisMonthStart && tDate <= thisMonthEnd;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const lastMonthTotal = transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= lastMonthStart && tDate <= lastMonthEnd;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const percentChange =
      lastMonthTotal === 0
        ? thisMonthTotal > 0
          ? 100
          : 0
        : ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

    return { thisMonth: thisMonthTotal, lastMonth: lastMonthTotal, percentChange };
  }, [transactions]);

  // Total stats
  const totalStats = useMemo(() => {
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');
    const total = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const average =
      expenseTransactions.length > 0 ? total / expenseTransactions.length : 0;
    return { total, average, count: expenseTransactions.length };
  }, [transactions]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs text-text-secondary">{label}</p>
          <p className="text-sm font-semibold text-white">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'week', label: '7D' },
    { value: 'month', label: '1M' },
    { value: '3months', label: '3M' },
    { value: '6months', label: '6M' },
  ];

  return (
    <div className="min-h-full pb-6 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-surface-50 tracking-tight">Analytics</h1>
        <p className="text-sm text-surface-400 mt-1">
          Track your spending patterns
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-surface-800/60 border border-surface-700/50 rounded-xl squircle p-4">
          <p className="text-xs text-surface-400 mb-1">Total Spent</p>
          <p className="text-lg font-semibold text-surface-50">
            {formatCurrency(totalStats.total)}
          </p>
        </div>
        <div className="bg-surface-800/60 border border-surface-700/50 rounded-xl squircle p-4">
          <p className="text-xs text-surface-400 mb-1">Avg Transaction</p>
          <p className="text-lg font-semibold text-surface-50">
            {formatCurrency(totalStats.average)}
          </p>
        </div>
      </div>

      {/* Spending Trend */}
      <div className="bg-surface-800/60 border border-surface-700/50 rounded-xl squircle p-4 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-surface-50">Spending Trend</h2>
          <div className="flex gap-1 bg-surface-900/50 rounded-lg p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timeRange === option.value
                    ? 'bg-primary-500 text-white'
                    : 'text-surface-400 hover:text-surface-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-52 select-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendingTrendData} style={{ outline: 'none' }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4a90e2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4a90e2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
                }
                width={35}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#4a90e2"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Category Breakdown */}
      <div className="bg-surface-800/60 border border-surface-700/50 rounded-xl squircle p-4 mb-5">
        <h2 className="text-base font-semibold text-surface-50 mb-4">By Category</h2>
        {categoryData.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-surface-400 text-sm">
            No expense data this month
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-36 h-36 select-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ outline: 'none' }}>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 shadow-lg">
                            <p className="text-xs text-surface-400">
                              {data.name}
                            </p>
                            <p className="text-sm font-semibold text-surface-50">
                              {formatCurrency(data.value)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-2">
              {categoryData.slice(0, 5).map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[13px] text-surface-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[13px] font-medium text-surface-50">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Comparison */}
      <div className="bg-surface-800/60 border border-surface-700/50 rounded-xl squircle p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-surface-50">Monthly Comparison</h2>
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              monthlyComparison.percentChange > 0
                ? 'text-red-400'
                : monthlyComparison.percentChange < 0
                  ? 'text-green-400'
                  : 'text-surface-400'
            }`}
          >
            {monthlyComparison.percentChange > 0
              ? '↑'
              : monthlyComparison.percentChange < 0
                ? '↓'
                : ''}
            {Math.abs(monthlyComparison.percentChange).toFixed(1)}%
          </div>
        </div>
        <div className="h-36 select-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { label: 'Last Month', amount: monthlyComparison.lastMonth },
                { label: 'This Month', amount: monthlyComparison.thisMonth },
              ]}
              barCategoryGap="30%"
              style={{ outline: 'none' }}
            >
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
                }
                width={35}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                <Cell fill="#4a5568" style={{ outline: 'none' }} />
                <Cell fill="#4a90e2" style={{ outline: 'none' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
