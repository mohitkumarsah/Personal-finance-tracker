import { Transaction, Currency, CURRENCY_SYMBOLS } from '@/types/finance';

export function formatCurrency(amount: number, currency: Currency): string {
  return `${CURRENCY_SYMBOLS[currency]}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getMonthKey(date: string): string {
  return date.substring(0, 7);
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function calculateTotals(transactions: Transaction[]) {
  const currentMonth = getCurrentMonthKey();
  const monthTx = transactions.filter(t => getMonthKey(t.date) === currentMonth);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const monthlyIncome = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return {
    totalBalance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    monthlyIncome,
    monthlyExpense,
    monthlySavings: monthlyIncome - monthlyExpense,
  };
}

export function getMonthlyData(transactions: Transaction[]) {
  const monthMap = new Map<string, { income: number; expense: number }>();
  transactions.forEach(t => {
    const key = getMonthKey(t.date);
    const existing = monthMap.get(key) || { income: 0, expense: 0 };
    if (t.type === 'income') existing.income += t.amount;
    else existing.expense += t.amount;
    monthMap.set(key, existing);
  });

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      income: data.income,
      expense: data.expense,
    }));
}

export function getCategoryData(transactions: Transaction[]) {
  const currentMonth = getCurrentMonthKey();
  const expenses = transactions.filter(t => t.type === 'expense' && getMonthKey(t.date) === currentMonth);
  const catMap = new Map<string, number>();
  expenses.forEach(t => {
    catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
  });
  const COLORS = ['#0d9488', '#7c3aed', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#8b5cf6'];
  return Array.from(catMap.entries()).map(([name, value], i) => ({
    name,
    value,
    fill: COLORS[i % COLORS.length],
  }));
}

export function exportToCSV(transactions: Transaction[], currency: Currency): string {
  const header = 'Date,Type,Category,Description,Amount\n';
  const rows = transactions
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(t => `${t.date},${t.type},${t.category},"${t.description}",${CURRENCY_SYMBOLS[currency]}${t.amount.toFixed(2)}`)
    .join('\n');
  return header + rows;
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
