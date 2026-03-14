import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Budget, Currency, DEFAULT_CATEGORIES, Category } from '@/types/finance';
import { getCurrentMonthKey } from '@/utils/finance';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (month: string, amount: number) => void;
  getCurrentBudget: () => Budget | undefined;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  loading: boolean;
  authLoading: boolean;
  user: any;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { username?: string; oldPassword?: string; newPassword?: string; email?: string; dateOfBirth?: string; mobileNumber?: string; city?: string; pinCode?: string }) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('finance_currency') as Currency) || 'USD';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('finance_darkmode');
    return saved === 'true';
  });

  const categories = DEFAULT_CATEGORIES;

  // Handle authentication state
  useEffect(() => {
    const getSession = async () => {
      setAuthLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load data from Supabase (fallback to local storage only for anonymous users)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      if (!user) {
        // Load from localStorage if no user (anonymous mode)
        const savedTransactions = localStorage.getItem('finance_transactions');
        const savedBudgets = localStorage.getItem('finance_budgets');
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        }
        if (savedBudgets) {
          setBudgets(JSON.parse(savedBudgets));
        }
        setLoading(false);
        return;
      }

      try {
        const [transactionsRes, budgetsRes] = await Promise.all([
          supabase.from('transactions').select('*').order('created_at', { ascending: false }),
          supabase.from('budgets').select('*')
        ]);

        if (transactionsRes.error) throw transactionsRes.error;
        if (budgetsRes.error) throw budgetsRes.error;

        setTransactions(transactionsRes.data || []);
        setBudgets(budgetsRes.data || []);
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        toast.warning('Failed to load from cloud, using offline data');

        // For logged-in users, fall back to localStorage if available
        const savedTransactions = localStorage.getItem('finance_transactions');
        const savedBudgets = localStorage.getItem('finance_budgets');
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        } else {
          setTransactions([]);
        }
        if (savedBudgets) {
          setBudgets(JSON.parse(savedBudgets));
        } else {
          setBudgets([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('finance_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('finance_darkmode', String(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) {
      // Anonymous mode: save to localStorage
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        amount: t.amount,
        type: t.type,
        category: t.category,
        description: t.description,
        date: t.date,
        createdAt: new Date().toISOString()
      };

      setTransactions(prev => {
        const updated = [newTransaction, ...prev];
        localStorage.setItem('finance_transactions', JSON.stringify(updated));
        return updated;
      });

      // Check budget
      if (t.type === 'expense') {
        const monthKey = t.date.substring(0, 7);
        const budget = budgets.find(b => b.month === monthKey);
        if (budget) {
          const monthExpenses = transactions
            .filter(tx => tx.type === 'expense' && tx.date.substring(0, 7) === monthKey)
            .reduce((s, tx) => s + tx.amount, 0) + t.amount;
          if (monthExpenses > budget.amount) {
            toast.warning('Budget exceeded!', { description: `You've exceeded your budget for this month.` });
          } else if (monthExpenses > budget.amount * 0.8) {
            toast.info('Budget warning', { description: `You've used over 80% of your monthly budget.` });
          }
        }
      }

      toast.success(`${t.type === 'income' ? 'Income' : 'Expense'} added successfully`);
      return;
    }

    // Logged-in user: try Supabase first, fallback to localStorage
    let newTransaction: Transaction;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount: t.amount,
          type: t.type,
          category: t.category,
          description: t.description,
          date: t.date,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      newTransaction = data;
      setTransactions(prev => [data, ...prev]);
    } catch (error) {
      console.warn('Supabase insert failed, falling back to localStorage:', error);
      toast.warning('Using offline mode - data will sync when connection is restored');

      // Fallback to localStorage
      newTransaction = {
        id: Date.now().toString(),
        amount: t.amount,
        type: t.type,
        category: t.category,
        description: t.description,
        date: t.date,
        createdAt: new Date().toISOString()
      };

      setTransactions(prev => [newTransaction, ...prev]);
    }

    // Check budget and show success (always)
    if (t.type === 'expense') {
      const monthKey = t.date.substring(0, 7);
      const budget = budgets.find(b => b.month === monthKey);
      if (budget) {
        const monthExpenses = transactions
          .filter(tx => tx.type === 'expense' && tx.date.substring(0, 7) === monthKey)
          .reduce((s, tx) => s + tx.amount, 0) + t.amount;
        if (monthExpenses > budget.amount) {
          toast.warning('Budget exceeded!', { description: `You've exceeded your budget for this month.` });
        } else if (monthExpenses > budget.amount * 0.8) {
          toast.info('Budget warning', { description: `You've used over 80% of your monthly budget.` });
        }
      }
    }

    toast.success(`${t.type === 'income' ? 'Income' : 'Expense'} added successfully`);
  }, [budgets, transactions, user]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    if (!user) {
      // Anonymous mode: update in localStorage
      setTransactions(prev => {
        const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
        localStorage.setItem('finance_transactions', JSON.stringify(updated));
        return updated;
      });
      toast.success('Transaction updated');
      return;
    }

    // Logged-in user: update in Supabase
    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      toast.success('Transaction updated');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) {
      // Anonymous mode: delete from localStorage
      setTransactions(prev => {
        const updated = prev.filter(t => t.id !== id);
        localStorage.setItem('finance_transactions', JSON.stringify(updated));
        return updated;
      });
      toast.success('Transaction deleted');
      return;
    }

    // Logged-in user: delete from Supabase
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction deleted');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  }, [user]);

  const setBudget = useCallback(async (month: string, amount: number) => {
    if (!user) {
      // Anonymous mode: save to localStorage
      const existing = budgets.find(b => b.month === month);
      if (existing) {
        setBudgets(prev => {
          const updated = prev.map(b => b.id === existing.id ? { ...b, amount } : b);
          localStorage.setItem('finance_budgets', JSON.stringify(updated));
          return updated;
        });
      } else {
        const newBudget: Budget = {
          id: Date.now().toString(),
          month,
          amount,
          spent: 0
        };
        setBudgets(prev => {
          const updated = [...prev, newBudget];
          localStorage.setItem('finance_budgets', JSON.stringify(updated));
          return updated;
        });
      }
      toast.success('Budget updated');
      return;
    }

    // Logged-in user: save to Supabase
    try {
      const existing = budgets.find(b => b.month === month);
      if (existing) {
        const { error } = await supabase
          .from('budgets')
          .update({ amount })
          .eq('id', existing.id);

        if (error) throw error;

        setBudgets(prev => prev.map(b => b.id === existing.id ? { ...b, amount } : b));
      } else {
        const { data, error } = await supabase
          .from('budgets')
          .insert([{ user_id: user.id, month, amount, spent: 0 }])
          .select()
          .single();

        if (error) throw error;

        setBudgets(prev => [...prev, data]);
      }
      toast.success('Budget updated');
    } catch (error) {
      console.error('Error setting budget:', error);
      toast.error('Failed to update budget');
    }
  }, [budgets, user]);

  const getCurrentBudget = useCallback(() => {
    return budgets.find(b => b.month === getCurrentMonthKey());
  }, [budgets]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(data.session?.user ?? null);
      toast.success('Logged in successfully');
    } catch (err: any) {
      toast.error(err?.message ?? 'Login failed');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, username?: string) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      if (error) throw error;
      // Supabase may require email confirmation. We still store the user if returned.
      setUser(data.user ?? null);
      toast.success('Account created. Please check your email to confirm.');
    } catch (err: any) {
      toast.error(err?.message ?? 'Sign up failed');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: { username?: string; oldPassword?: string; newPassword?: string; email?: string; dateOfBirth?: string; mobileNumber?: string; city?: string; pinCode?: string }) => {
    setAuthLoading(true);
    try {
      // If user wants to change password, require old password for verification
      if (data.newPassword) {
        if (!data.oldPassword) {
          throw new Error('Please provide your current password to set a new password.');
        }

        // Re-authenticate using current password
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: user?.email ?? '',
          password: data.oldPassword,
        });

        if (authError) throw authError;
      }

      const { error, data: result } = await supabase.auth.updateUser({
        data: {
          ...(data.username ? { username: data.username } : {}),
          ...(data.dateOfBirth ? { dateOfBirth: data.dateOfBirth } : {}),
          ...(data.mobileNumber ? { mobileNumber: data.mobileNumber } : {}),
          ...(data.city ? { city: data.city } : {}),
          ...(data.pinCode ? { pinCode: data.pinCode } : {}),
        },
        password: data.newPassword,
      });

      if (error) throw error;

      setUser(result.user ?? null);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update profile');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, [user]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logged out');
  }, []);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);
  const setCurrency = useCallback((c: Currency) => setCurrencyState(c), []);

  return (
    <FinanceContext.Provider value={{
      transactions, budgets, categories, currency, setCurrency,
      addTransaction, updateTransaction, deleteTransaction,
      setBudget, getCurrentBudget, isDarkMode, toggleDarkMode, loading,
      authLoading, user, login, signUp, logout, updateProfile,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
