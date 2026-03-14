import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { calculateTotals, formatCurrency, getMonthlyData, getCategoryData } from '@/utils/finance';
import { StatCard } from '@/components/StatCard';
import { TransactionForm } from '@/components/TransactionForm';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { transactions, currency, getCurrentBudget } = useFinance();
  const totals = calculateTotals(transactions);
  const monthlyData = getMonthlyData(transactions);
  const categoryData = getCategoryData(transactions);
  const budget = getCurrentBudget();

  const budgetUsed = budget ? (totals.monthlyExpense / budget.amount) * 100 : 0;

  const recentTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Your financial overview</p>
        </div>
        <TransactionForm />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={totals.totalBalance} icon={DollarSign} variant="primary" delay={0} />
        <StatCard title="Monthly Income" value={totals.monthlyIncome} icon={TrendingUp} variant="income" delay={0.1} />
        <StatCard title="Monthly Expenses" value={totals.monthlyExpense} icon={TrendingDown} variant="expense" delay={0.2} />
        <StatCard title="Monthly Savings" value={totals.monthlySavings} icon={PiggyBank} variant="accent" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="income" fill="hsl(152, 69%, 40%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="hsl(0, 72%, 51%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No expenses this month</div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.map((c, i) => (
              <span key={i} className="text-xs flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.fill }} />
                {c.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Progress */}
        {budget && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card rounded-xl p-5">
            <h3 className="font-heading font-semibold mb-3">Budget Progress</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Spent: {formatCurrency(totals.monthlyExpense, currency)}</span>
              <span className="text-muted-foreground">Budget: {formatCurrency(budget.amount, currency)}</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${budgetUsed > 100 ? 'bg-destructive' : budgetUsed > 80 ? 'bg-warning' : 'bg-primary'}`}
                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{budgetUsed.toFixed(0)}% used</p>
          </motion.div>
        )}

        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold mb-3">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.category} · {tx.date}</p>
                </div>
                <span className={`font-heading font-semibold text-sm ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
