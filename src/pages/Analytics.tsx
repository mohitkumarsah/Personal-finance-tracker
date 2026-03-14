import { motion } from 'framer-motion';
import { useFinance } from '@/context/FinanceContext';
import { getMonthlyData, getCategoryData, calculateTotals, formatCurrency } from '@/utils/finance';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export default function Analytics() {
  const { transactions, currency } = useFinance();
  const monthlyData = getMonthlyData(transactions);
  const categoryData = getCategoryData(transactions);
  const totals = calculateTotals(transactions);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-heading font-bold">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold mb-4">Monthly Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="expense" fill="hsl(0, 72%, 51%)" radius={[6, 6, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold mb-4">Category Breakdown</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {categoryData.map((c, i) => (
                  <span key={i} className="text-xs flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.fill }} />
                    {c.name}: {formatCurrency(c.value, currency)}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No expense data</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold mb-4">Income vs Expense Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="hsl(152, 69%, 40%)" strokeWidth={3} dot={{ r: 5 }} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="hsl(0, 72%, 51%)" strokeWidth={3} dot={{ r: 5 }} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-muted-foreground text-sm">Total Income</p>
          <p className="text-xl font-heading font-bold text-income mt-1">{formatCurrency(totals.totalIncome, currency)}</p>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-muted-foreground text-sm">Total Expenses</p>
          <p className="text-xl font-heading font-bold text-expense mt-1">{formatCurrency(totals.totalExpense, currency)}</p>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-muted-foreground text-sm">Net Savings</p>
          <p className="text-xl font-heading font-bold text-primary mt-1">{formatCurrency(totals.totalBalance, currency)}</p>
        </div>
      </div>
    </div>
  );
}
