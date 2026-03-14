export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  amount: number;
  spent: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'both';
  icon: string;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food', type: 'expense', icon: '🍔' },
  { id: '2', name: 'Transport', type: 'expense', icon: '🚗' },
  { id: '3', name: 'Rent', type: 'expense', icon: '🏠' },
  { id: '4', name: 'Shopping', type: 'expense', icon: '🛍️' },
  { id: '5', name: 'Entertainment', type: 'expense', icon: '🎬' },
  { id: '6', name: 'Bills', type: 'expense', icon: '📄' },
  { id: '7', name: 'Salary', type: 'income', icon: '💰' },
  { id: '8', name: 'Freelance', type: 'income', icon: '💻' },
  { id: '9', name: 'Investment', type: 'income', icon: '📈' },
  { id: '10', name: 'Other', type: 'both', icon: '📌' },
];
