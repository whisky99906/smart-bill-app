import { create } from 'zustand';
import { Transaction, Category, MerchantRule } from '@/types';
import { getAllTransactions, getAllCategories, getAllMerchantRules, generateId, matchCategoryByMerchant } from '@/utils/category';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByMonth: (month: string) => Transaction[];
  getTotalExpense: (month: string) => number;
  getTotalIncome: (month: string) => number;
}

interface CategoryStore {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getMainCategories: () => Category[];
  getSubCategories: (parentId: string) => Category[];
  getCategoryById: (id: string) => Category | undefined;
}

interface MerchantRuleStore {
  rules: MerchantRule[];
  addRule: (rule: Omit<MerchantRule, 'id' | 'useCount'>) => void;
  updateRule: (id: string, rule: Partial<MerchantRule>) => void;
  deleteRule: (id: string) => void;
  matchMerchant: (merchantName: string) => { categoryL1: string; categoryL2: string; merchantShortName?: string; ruleId?: string } | null;
  incrementUseCount: (ruleId: string) => void;
  learnFromUser: (merchantName: string, categoryL1: string, categoryL2: string, merchantShortName?: string) => void;
}

interface BudgetSettings {
  amount: number;
  reminderEnabled: boolean;
  reminderThreshold: number;
}

interface BudgetStore {
  budgets: Record<string, BudgetSettings>;
  getBudget: (month: string) => BudgetSettings;
  setBudget: (month: string, settings: BudgetSettings) => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: getAllTransactions(),

  addTransaction: (transaction) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const rules = getAllMerchantRules();
    const matched = matchCategoryByMerchant(transaction.merchant, rules);
    if (matched && !transaction.categoryL1) {
      newTransaction.categoryL1 = matched.categoryL1;
      newTransaction.categoryL2 = matched.categoryL2;
    }
    set((state) => {
      const updated = [newTransaction, ...state.transactions];
      localStorage.setItem('transactions', JSON.stringify(updated));
      return { transactions: updated };
    });
  },

  updateTransaction: (id, transaction) => {
    set((state) => {
      const updated = state.transactions.map(t =>
        t.id === id ? { ...t, ...transaction } : t
      );
      localStorage.setItem('transactions', JSON.stringify(updated));
      return { transactions: updated };
    });
  },

  deleteTransaction: (id) => {
    set((state) => {
      const updated = state.transactions.filter(t => t.id !== id);
      localStorage.setItem('transactions', JSON.stringify(updated));
      return { transactions: updated };
    });
  },

  getTransactionsByMonth: (month) => {
    return get().transactions.filter(t => t.date.startsWith(month)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getTotalExpense: (month) => {
    return get().transactions
      .filter(t => t.date.startsWith(month) && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalIncome: (month) => {
    return get().transactions
      .filter(t => t.date.startsWith(month) && t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  },
}));

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: getAllCategories(),

  addCategory: (category) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
    };
    set((state) => {
      const updated = [...state.categories, newCategory];
      localStorage.setItem('categories', JSON.stringify(updated));
      return { categories: updated };
    });
  },

  updateCategory: (id, category) => {
    set((state) => {
      const updated = state.categories.map(c =>
        c.id === id ? { ...c, ...category } : c
      );
      localStorage.setItem('categories', JSON.stringify(updated));
      return { categories: updated };
    });
  },

  deleteCategory: (id) => {
    set((state) => {
      const updated = state.categories.filter(c => c.id !== id && c.parentId !== id);
      localStorage.setItem('categories', JSON.stringify(updated));
      return { categories: updated };
    });
  },

  getMainCategories: () => {
    return get().categories.filter(c => c.parentId === 'root').sort((a, b) => a.sortOrder - b.sortOrder);
  },

  getSubCategories: (parentId) => {
    return get().categories.filter(c => c.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  },

  getCategoryById: (id) => {
    return get().categories.find(c => c.id === id);
  },
}));

export const useMerchantRuleStore = create<MerchantRuleStore>((set, get) => ({
  rules: getAllMerchantRules(),

  addRule: (rule) => {
    const newRule: MerchantRule = {
      ...rule,
      id: generateId(),
      useCount: 0,
    };
    set((state) => {
      const updated = [...state.rules, newRule];
      localStorage.setItem('merchantRules', JSON.stringify(updated));
      return { rules: updated };
    });
  },

  updateRule: (id, rule) => {
    set((state) => {
      const updated = state.rules.map(r =>
        r.id === id ? { ...r, ...rule } : r
      );
      localStorage.setItem('merchantRules', JSON.stringify(updated));
      return { rules: updated };
    });
  },

  deleteRule: (id) => {
    set((state) => {
      const updated = state.rules.filter(r => r.id !== id);
      localStorage.setItem('merchantRules', JSON.stringify(updated));
      return { rules: updated };
    });
  },

  matchMerchant: (merchantName) => {
    return matchCategoryByMerchant(merchantName, get().rules);
  },

  incrementUseCount: (ruleId) => {
    set((state) => {
      const updated = state.rules.map(r =>
        r.id === ruleId ? { ...r, useCount: r.useCount + 1 } : r
      );
      localStorage.setItem('merchantRules', JSON.stringify(updated));
      return { rules: updated };
    });
  },

  learnFromUser: (merchantName, categoryL1, categoryL2, merchantShortName) => {
    const existing = get().rules.find(r => merchantName.includes(r.merchantName));
    if (existing) {
      get().updateRule(existing.id, { categoryL1, categoryL2, merchantShortName });
    } else {
      get().addRule({ merchantName, categoryL1, categoryL2, merchantShortName });
    }
  },
}));

const DEFAULT_BUDGET: BudgetSettings = {
  amount: 3000,
  reminderEnabled: false,
  reminderThreshold: 80,
};

const loadBudgets = (): Record<string, BudgetSettings> => {
  try {
    const data = localStorage.getItem('budgets');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  budgets: loadBudgets(),

  getBudget: (month) => {
    return get().budgets[month] || DEFAULT_BUDGET;
  },

  setBudget: (month, settings) => {
    set((state) => {
      const updated = { ...state.budgets, [month]: settings };
      localStorage.setItem('budgets', JSON.stringify(updated));
      return { budgets: updated };
    });
  },
}));
