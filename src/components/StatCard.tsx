import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/utils/finance';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'primary' | 'income' | 'expense' | 'accent';
  delay?: number;
}

const variantStyles = {
  primary: 'gradient-primary',
  income: 'gradient-income',
  expense: 'gradient-expense',
  accent: 'gradient-accent',
};

export function StatCard({ title, value, icon: Icon, variant, delay = 0 }: StatCardProps) {
  const { currency } = useFinance();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${variantStyles[variant]} rounded-xl p-5 text-primary-foreground relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <Icon className="w-full h-full" />
      </div>
      <div className="relative z-10">
        <p className="text-sm opacity-80 font-medium">{title}</p>
        <p className="text-2xl font-heading font-bold mt-1">{formatCurrency(Math.abs(value), currency)}</p>
      </div>
    </motion.div>
  );
}
