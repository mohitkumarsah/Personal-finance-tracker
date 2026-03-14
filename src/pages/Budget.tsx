import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, calculateTotals, getCurrentMonthKey } from '@/utils/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, Target } from 'lucide-react';

export default function Budget() {
  const { currency, setBudget, getCurrentBudget, transactions } = useFinance();
  const budget = getCurrentBudget();
  const totals = calculateTotals(transactions);
  const [newAmount, setNewAmount] = useState(budget?.amount?.toString() || '3000');

  const budgetUsed = budget ? (totals.monthlyExpense / budget.amount) * 100 : 0;
  const remaining = budget ? budget.amount - totals.monthlyExpense : 0;

  const handleSetBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setBudget(getCurrentMonthKey(), parseFloat(newAmount));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-heading font-bold">Budget</h1>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-primary" />
          <h2 className="font-heading font-semibold text-lg">Monthly Budget</h2>
        </div>

        <form onSubmit={handleSetBudget} className="flex gap-3 mb-6">
          <div className="flex-1">
            <Label>Budget Amount</Label>
            <Input type="number" min="1" step="0.01" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
          </div>
          <Button type="submit" className="self-end">Set Budget</Button>
        </form>

        {budget && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Spent: <strong className="text-expense">{formatCurrency(totals.monthlyExpense, currency)}</strong></span>
              <span>Budget: <strong>{formatCurrency(budget.amount, currency)}</strong></span>
            </div>

            <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(budgetUsed, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${budgetUsed > 100 ? 'bg-destructive' : budgetUsed > 80 ? 'bg-warning' : 'bg-primary'}`}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{budgetUsed.toFixed(1)}% used</span>
              <span className={`text-sm font-medium ${remaining >= 0 ? 'text-income' : 'text-expense'}`}>
                {remaining >= 0 ? `${formatCurrency(remaining, currency)} remaining` : `${formatCurrency(Math.abs(remaining), currency)} over budget`}
              </span>
            </div>

            {budgetUsed > 100 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>You've exceeded your monthly budget!</p>
              </div>
            )}
            {budgetUsed > 80 && budgetUsed <= 100 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>You're approaching your budget limit.</p>
              </div>
            )}
            {budgetUsed <= 80 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-income/10 text-income text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <p>You're on track with your budget.</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6">
        <h3 className="font-heading font-semibold mb-4">Monthly Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-lg font-heading font-bold text-income">{formatCurrency(totals.monthlyIncome, currency)}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-lg font-heading font-bold text-expense">{formatCurrency(totals.monthlyExpense, currency)}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Savings</p>
            <p className="text-lg font-heading font-bold text-primary">{formatCurrency(totals.monthlySavings, currency)}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Savings Rate</p>
            <p className="text-lg font-heading font-bold">{totals.monthlyIncome > 0 ? ((totals.monthlySavings / totals.monthlyIncome) * 100).toFixed(0) : 0}%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
