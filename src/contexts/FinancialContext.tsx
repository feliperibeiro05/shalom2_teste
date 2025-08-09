import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { format } from 'date-fns';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string;
  created_at?: string;
  is_recurring?: boolean;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  type: 'income' | 'expense';
  isCustom?: boolean;
}

interface FinancialContextType {
  transactions: Transaction[];
  goals: FinancialGoal[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchTransactions: () => void;
  fetchGoals: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'currentAmount'>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  getBalance: () => number;
  getIncomeTotal: (period?: 'month' | 'week' | 'day') => number;
  getExpenseTotal: (period?: 'month' | 'week' | 'day') => number;
  getTransactionsByCategory: (period?: 'month' | 'week' | 'day') => { category: string; total: number }[];
  getCashFlow: (period?: 'week' | 'month' | 'year') => { date: string; income: number; expenses: number; balance: number }[]; // Adicionada a função getCashFlow
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
    { name: 'Salário', icon: '💼', color: 'green', type: 'income' },
    { name: 'Freelance', icon: '💻', color: 'blue', type: 'income' },
    { name: 'Investimentos', icon: '📈', color: 'purple', type: 'income' },
    { name: 'Outros', icon: '💰', color: 'gray', type: 'income' },
    { name: 'Moradia', icon: '🏠', color: 'blue', type: 'expense' },
    { name: 'Transporte', icon: '🚗', color: 'green', type: 'expense' },
    { name: 'Alimentação', icon: '🍽️', color: 'orange', type: 'expense' },
    { name: 'Assinaturas e Serviços', icon: '📱', color: 'purple', type: 'expense' },
    { name: 'Compras Pessoais', icon: '🛍️', color: 'pink', type: 'expense' },
    { name: 'Cuidado Pessoal', icon: '💆‍♂️', color: 'teal', type: 'expense' },
    { name: 'Educação e Desenvolvimento', icon: '📚', color: 'indigo', type: 'expense' },
    { name: 'Doações e Ajuda', icon: '🤝', color: 'yellow', type: 'expense' },
    { name: 'Saúde e Bem-estar', icon: '⚕️', color: 'red', type: 'expense' },
    { name: 'Lazer e Viagens', icon: '✈️', color: 'cyan', type: 'expense' },
    { name: 'Investimentos', icon: '📈', color: 'emerald', type: 'expense' },
    { name: 'Gastos Imprevistos', icon: '⚡', color: 'amber', type: 'expense' },
    { name: 'Impostos e Burocracias', icon: '📄', color: 'gray', type: 'expense' },
    { name: 'Cartão de Crédito', icon: '💳', color: 'rose', type: 'expense' }
  ];

  const fetchCategories = useCallback(() => {
    // Para simplificar, as categorias são hardcoded, mas você pode
    // buscar de uma tabela do Supabase se desejar
    const defaultCats: Category[] = DEFAULT_CATEGORIES.map(cat => ({ ...cat, id: uuidv4() }));
    setCategories(defaultCats);
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data as Transaction[]);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Erro ao carregar transações.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setGoals(data as FinancialGoal[]);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Erro ao carregar metas.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
    fetchGoals();
  }, [fetchTransactions, fetchGoals, fetchCategories]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({ ...transaction, user_id: user.id });
      
      if (error) throw error;
      fetchTransactions();
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Erro ao adicionar transação.');
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchTransactions();
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError('Erro ao atualizar transação.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Erro ao excluir transação.');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goal: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'currentAmount'>) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('financial_goals')
        .insert({ ...goal, user_id: user.id, current_amount: 0 });
      
      if (error) throw error;
      fetchGoals();
    } catch (err) {
      console.error('Error adding goal:', err);
      setError('Erro ao adicionar meta.');
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Erro ao excluir meta.');
    } finally {
      setLoading(false);
    }
  };

  const getBalance = useCallback(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return income - expenses;
  }, [transactions]);

  const getIncomeTotal = useCallback((period: 'month' | 'week' | 'day' = 'month') => {
    const periodStart = new Date();
    if (period === 'month') {
      periodStart.setDate(1);
    } else if (period === 'week') {
      periodStart.setDate(periodStart.getDate() - periodStart.getDay());
    }
    const filteredTransactions = transactions.filter(t => 
      new Date(t.date) >= periodStart && t.type === 'income'
    );
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getExpenseTotal = useCallback((period: 'month' | 'week' | 'day' = 'month') => {
    const periodStart = new Date();
    if (period === 'month') {
      periodStart.setDate(1);
    } else if (period === 'week') {
      periodStart.setDate(periodStart.getDate() - periodStart.getDay());
    }
    const filteredTransactions = transactions.filter(t => 
      new Date(t.date) >= periodStart && t.type === 'expense'
    );
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTransactionsByCategory = useCallback((period: 'month' | 'week' | 'day' = 'month') => {
    const periodStart = new Date();
    if (period === 'month') {
      periodStart.setDate(1);
    } else if (period === 'week') {
      periodStart.setDate(periodStart.getDate() - periodStart.getDay());
    }
    const filteredTransactions = transactions.filter(t => 
      new Date(t.date) >= periodStart
    );
    const categoriesMap = new Map<string, number>();
    filteredTransactions.forEach(t => {
      categoriesMap.set(t.category, (categoriesMap.get(t.category) || 0) + t.amount);
    });
    return Array.from(categoriesMap.entries()).map(([category, total]) => ({ category, total }));
  }, [transactions]);

  const getCashFlow = useCallback((period: 'week' | 'month' | 'year' = 'month') => {
    const data: { date: string; income: number; expenses: number; balance: number }[] = [];
    const sortedTransactions = [...transactions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const periodStart = new Date();
    if (period === 'week') {
      periodStart.setDate(periodStart.getDate() - 7);
    } else if (period === 'month') {
      periodStart.setMonth(periodStart.getMonth() - 1);
    } else if (period === 'year') {
      periodStart.setFullYear(periodStart.getFullYear() - 1);
    }

    const filteredTransactions = sortedTransactions.filter(t => new Date(t.date) >= periodStart);

    let runningBalance = getBalance();
    
    // Apenas para o gráfico, vamos calcular o saldo cumulativo
    const balanceMap = new Map<string, { income: number; expenses: number; balance: number }>();

    filteredTransactions.forEach(t => {
      const date = t.date;
      if (!balanceMap.has(date)) {
        balanceMap.set(date, { income: 0, expenses: 0, balance: 0 });
      }
      const dayData = balanceMap.get(date)!;
      if (t.type === 'income') {
        dayData.income += t.amount;
      } else {
        dayData.expenses += t.amount;
      }
    });

    let cumulativeBalance = getBalance();

    const dates = Array.from(balanceMap.keys()).sort();

    dates.forEach(date => {
      const dayData = balanceMap.get(date)!;
      cumulativeBalance = cumulativeBalance - dayData.expenses + dayData.income;
      data.push({
        date: date,
        income: dayData.income,
        expenses: dayData.expenses,
        balance: cumulativeBalance
      });
    });

    return data;
  }, [transactions, getBalance]);

  const exportData = async () => {
    if (!user) { setError('Usuário não autenticado.'); return ''; }
    setLoading(true);
    try {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);
      if (transactionsError) throw transactionsError;

      const { data: goalsData, error: goalsError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id);
      if (goalsError) throw goalsError;

      const exportContent = {
        transactions: transactionsData,
        goals: goalsData,
        exportDate: new Date().toISOString(),
        userId: user.id
      };
      return JSON.stringify(exportContent, null, 2);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Erro ao exportar dados.');
      return '';
    } finally {
      setLoading(false);
    }
  };

  const importData = async (data: string) => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    setLoading(true);
    try {
      const parsed = JSON.parse(data);
      if (!parsed.transactions || !parsed.goals) throw new Error('Formato de importação inválido.');

      await clearAllData();

      const { error: transactionsError } = await supabase.from('transactions').insert(parsed.transactions);
      if (transactionsError) throw transactionsError;

      const { error: goalsError } = await supabase.from('financial_goals').insert(parsed.goals);
      if (goalsError) throw goalsError;

      fetchTransactions();
      fetchGoals();
    } catch (err) {
      console.error('Error importing data:', err);
      setError('Erro ao importar dados. Verifique o formato do arquivo.');
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!user) { setError('Usuário não autenticado.'); return; }
    if (!window.confirm('Tem certeza que deseja limpar TODOS os dados financeiros? Esta ação não pode ser desfeita.')) {
      return;
    }
    setLoading(true);
    try {
      await supabase.from('transactions').delete().neq('id', '0');
      await supabase.from('financial_goals').delete().neq('id', '0');
      fetchTransactions();
      fetchGoals();
    } catch (err) {
      console.error('Error clearing data:', err);
      setError('Erro ao limpar dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FinancialContext.Provider value={{
      transactions,
      goals,
      categories,
      loading,
      error,
      fetchTransactions,
      fetchGoals,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      deleteGoal,
      getBalance,
      getIncomeTotal,
      getExpenseTotal,
      getTransactionsByCategory,
      getCashFlow,
      exportData,
      importData,
      clearAllData,
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};