import { Category, MerchantRule, Transaction } from '@/types';

export const defaultCategories: Category[] = [
  { id: 'food', parentId: 'root', name: '三餐', icon: 'food', color: '#F0B86E', sortOrder: 1 },
  { id: 'food-breakfast', parentId: 'food', name: '早餐', icon: 'food-breakfast', color: '#F0B86E', sortOrder: 1 },
  { id: 'food-lunch', parentId: 'food', name: '午餐', icon: 'food-lunch', color: '#F0B86E', sortOrder: 2 },
  { id: 'food-dinner', parentId: 'food', name: '晚餐', icon: 'food-dinner', color: '#F0B86E', sortOrder: 3 },
  { id: 'food-snack', parentId: 'food', name: '零食', icon: 'food-snack', color: '#F0B86E', sortOrder: 4 },
  
  { id: 'shopping', parentId: 'root', name: '购物', icon: 'shopping', color: '#E898B8', sortOrder: 2 },
  { id: 'shopping-clothes', parentId: 'shopping', name: '服装', icon: 'shopping-clothes', color: '#E898B8', sortOrder: 1 },
  { id: 'shopping-daily', parentId: 'shopping', name: '日用品', icon: 'shopping-daily', color: '#E898B8', sortOrder: 2 },
  { id: 'shopping-electronics', parentId: 'shopping', name: '数码', icon: 'shopping-electronics', color: '#E898B8', sortOrder: 3 },
  { id: 'shopping-beauty', parentId: 'shopping', name: '美妆', icon: 'shopping-beauty', color: '#E898B8', sortOrder: 4 },
  
  { id: 'transport', parentId: 'root', name: '交通', icon: 'transport', color: '#7EC8E3', sortOrder: 3 },
  { id: 'transport-bus', parentId: 'transport', name: '公交', icon: 'transport-bus', color: '#7EC8E3', sortOrder: 1 },
  { id: 'transport-subway', parentId: 'transport', name: '地铁', icon: 'transport-subway', color: '#7EC8E3', sortOrder: 2 },
  { id: 'transport-taxi', parentId: 'transport', name: '打车', icon: 'transport-taxi', color: '#7EC8E3', sortOrder: 3 },
  { id: 'transport-fuel', parentId: 'transport', name: '加油', icon: 'transport-fuel', color: '#7EC8E3', sortOrder: 4 },
  
  { id: 'entertainment', parentId: 'root', name: '娱乐', icon: 'entertainment', color: '#9FA8DA', sortOrder: 4 },
  { id: 'entertainment-movie', parentId: 'entertainment', name: '电影', icon: 'entertainment-movie', color: '#9FA8DA', sortOrder: 1 },
  { id: 'entertainment-game', parentId: 'entertainment', name: '游戏', icon: 'entertainment-game', color: '#9FA8DA', sortOrder: 2 },
  { id: 'entertainment-travel', parentId: 'entertainment', name: '旅行', icon: 'entertainment-travel', color: '#9FA8DA', sortOrder: 3 },
  { id: 'entertainment-sport', parentId: 'entertainment', name: '运动', icon: 'entertainment-sport', color: '#9FA8DA', sortOrder: 4 },
  
  { id: 'living', parentId: 'root', name: '居住', icon: 'living', color: '#81C7A8', sortOrder: 5 },
  { id: 'living-rent', parentId: 'living', name: '房租', icon: 'living-rent', color: '#81C7A8', sortOrder: 1 },
  { id: 'living-water', parentId: 'living', name: '水电', icon: 'living-water', color: '#81C7A8', sortOrder: 2 },
  { id: 'living-internet', parentId: 'living', name: '网费', icon: 'living-internet', color: '#81C7A8', sortOrder: 3 },
  
  { id: 'medical', parentId: 'root', name: '医疗', icon: 'medical', color: '#F4A4A4', sortOrder: 6 },
  { id: 'medical-hospital', parentId: 'medical', name: '看病', icon: 'medical-hospital', color: '#F4A4A4', sortOrder: 1 },
  { id: 'medical-drug', parentId: 'medical', name: '买药', icon: 'medical-drug', color: '#F4A4A4', sortOrder: 2 },
  
  { id: 'study', parentId: 'root', name: '学习', icon: 'study', color: '#A8E6CF', sortOrder: 7 },
  { id: 'study-book', parentId: 'study', name: '书籍', icon: 'study-book', color: '#A8E6CF', sortOrder: 1 },
  { id: 'study-course', parentId: 'study', name: '课程', icon: 'study-course', color: '#A8E6CF', sortOrder: 2 },
  
  { id: 'other', parentId: 'root', name: '其他', icon: 'other', color: '#CBD5E0', sortOrder: 8 },
  { id: 'other-gift', parentId: 'other', name: '礼物', icon: 'other-gift', color: '#CBD5E0', sortOrder: 1 },
  { id: 'other-redpacket', parentId: 'other', name: '红包', icon: 'other-redpacket', color: '#CBD5E0', sortOrder: 2 },
];

export const defaultMerchantRules: MerchantRule[] = [
  { id: '1', merchantName: '美团', categoryL1: 'food', categoryL2: 'food-lunch', useCount: 15 },
  { id: '2', merchantName: '饿了么', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 12 },
  { id: '3', merchantName: '滴滴', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 8 },
  { id: '4', merchantName: '淘宝', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 20 },
  { id: '5', merchantName: '京东', categoryL1: 'shopping', categoryL2: 'shopping-electronics', useCount: 10 },
  { id: '6', merchantName: '星巴克', categoryL1: 'food', categoryL2: 'food-snack', useCount: 6 },
];

export const defaultTransactions: Transaction[] = [
  { id: '1', date: '2026-07-08', amount: 35.5, type: 'expense', categoryL1: 'food', categoryL2: 'food-lunch', merchant: '美团外卖', note: '黄焖鸡米饭', source: 'manual', createdAt: '2026-07-08T12:30:00Z' },
  { id: '2', date: '2026-07-08', amount: 15, type: 'expense', categoryL1: 'transport', categoryL2: 'transport-subway', merchant: '地铁', note: '通勤', source: 'manual', createdAt: '2026-07-08T08:00:00Z' },
  { id: '3', date: '2026-07-07', amount: 299, type: 'expense', categoryL1: 'shopping', categoryL2: 'shopping-clothes', merchant: '淘宝', note: '夏季T恤', source: 'manual', createdAt: '2026-07-07T20:15:00Z' },
  { id: '4', date: '2026-07-07', amount: 88, type: 'expense', categoryL1: 'entertainment', categoryL2: 'entertainment-movie', merchant: '万达影城', note: '电影票', source: 'manual', createdAt: '2026-07-07T19:00:00Z' },
  { id: '5', date: '2026-07-06', amount: 2000, type: 'income', categoryL1: 'other', categoryL2: 'other-redpacket', merchant: '工资', note: '七月工资', source: 'manual', createdAt: '2026-07-06T10:00:00Z' },
  { id: '6', date: '2026-07-06', amount: 1500, type: 'expense', categoryL1: 'living', categoryL2: 'living-rent', merchant: '房东', note: '七月房租', source: 'manual', createdAt: '2026-07-06T09:00:00Z' },
  { id: '7', date: '2026-07-05', amount: 45, type: 'expense', categoryL1: 'food', categoryL2: 'food-dinner', merchant: '饿了么', note: '烧烤', source: 'manual', createdAt: '2026-07-05T21:30:00Z' },
  { id: '8', date: '2026-07-05', amount: 28, type: 'expense', categoryL1: 'food', categoryL2: 'food-snack', merchant: '星巴克', note: '拿铁咖啡', source: 'manual', createdAt: '2026-07-05T15:00:00Z' },
];

export const getCategoryById = (categories: Category[], id: string): Category | undefined => {
  return categories.find(c => c.id === id);
};

export const getSubCategories = (categories: Category[], parentId: string): Category[] => {
  return categories.filter(c => c.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getAllCategories = (): Category[] => {
  const stored = localStorage.getItem('categories');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('categories', JSON.stringify(defaultCategories));
  return defaultCategories;
};

export const getAllMerchantRules = (): MerchantRule[] => {
  const stored = localStorage.getItem('merchantRules');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('merchantRules', JSON.stringify(defaultMerchantRules));
  return defaultMerchantRules;
};

export const getAllTransactions = (): Transaction[] => {
  const stored = localStorage.getItem('transactions');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('transactions', JSON.stringify(defaultTransactions));
  return defaultTransactions;
};

export const matchCategoryByMerchant = (merchantName: string, rules: MerchantRule[]): { categoryL1: string; categoryL2: string } | null => {
  for (const rule of rules) {
    if (merchantName.includes(rule.merchantName)) {
      return { categoryL1: rule.categoryL1, categoryL2: rule.categoryL2 };
    }
  }
  return null;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
