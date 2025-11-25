import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useAppStore } from '@/store';
import { formatCurrency } from '@/utils/formatters';
import { addDays, endOfMonth, format, isWithinInterval, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export const AnalyticsPage = () => {
  const { currentUserId } = useAppStore();
  const transactions = useTransactions();
  const categories = useCategories(currentUserId ?? undefined);

  // Create category map for quick lookup
  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, typeof categories[0]>);
  }, [categories]);

  // Calculate monthly income vs expenses for the last 6 months
  const spendingTrendData = useMemo(() => {
    const now = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      months.push({
        month: format(monthDate, 'MMM'),
        income,
        expenses,
      });
    }
    
    return months;
  }, [transactions]);

  // Calculate spending by category for current month
  const categoryData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const categorySpending: Record<string, { name: string; value: number; color: string }> = {};
    
    transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= monthStart && tDate <= monthEnd;
      })
      .forEach(t => {
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

  // Calculate weekly spending for current week
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const dayDate = addDays(weekStart, index);
      const nextDay = addDays(weekStart, index + 1);
      
      const amount = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'expense' && 
            isWithinInterval(tDate, { start: dayDate, end: nextDay });
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return { day, amount };
    });
  }, [transactions]);

  // Show placeholder if no data
  const hasData = transactions.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-100">
          Analytics
        </h1>
        <p className="text-surface-400 mt-1">
          Track your financial trends and insights
        </p>
      </div>

      {!hasData ? (
        <Card className="text-center py-12">
          <div className="text-surface-400">
            <p className="text-lg font-medium mb-2">No transaction data yet</p>
            <p>Add some transactions to see your analytics</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expenses Trend */}
            <Card className="lg:col-span-2" padding="none">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle>Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingTrendData}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-surface-700" />
                      <XAxis dataKey="month" className="text-surface-400" />
                      <YAxis tickFormatter={(value) => value >= 1000 ? `$${value / 1000}k` : `$${value}`} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: '#1f1f1f',
                          border: '1px solid #333',
                          borderRadius: '8px',
                          color: '#e5e5e5',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        name="Income"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#colorExpenses)"
                        name="Expenses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Spending by Category */}
            <Card padding="none">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {categoryData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-surface-400">
                    No expense data for this month
                  </div>
                ) : (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {categoryData.slice(0, 6).map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-surface-400 truncate">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Weekly Spending */}
            <Card padding="none">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle>This Week's Spending</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-surface-700" />
                      <XAxis dataKey="day" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="amount" fill="#4a90e2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
