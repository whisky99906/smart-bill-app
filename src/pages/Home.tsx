import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClayCard, ClayButton } from '@/components';
import { useTransactionStore, useCategoryStore, useBudgetStore } from '@/store/useStore';
import { getIcon } from '@/utils/icons';
import { Settings, PenTool, Mic, Upload, FolderOpen, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const today = new Date();
const getCurrentMonth = () => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

export const Home = () => {
  const navigate = useNavigate();
  const { transactions, getTotalExpense } = useTransactionStore();
  const getCategoryById = useCategoryStore((state) => state.getCategoryById);
  const getBudget = useBudgetStore((state) => state.getBudget);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const [year, month] = selectedMonth.split('-').map(Number);

  const totalExpense = getTotalExpense(selectedMonth);
  const budget = getBudget(selectedMonth).amount;
  const usedPercent = Math.min((totalExpense / budget) * 100, 100);

  const filteredTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedTransactions = sortedTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof sortedTransactions>);

  const availableYears = [...new Set(transactions.map(t => t.date.substring(0, 4)))].sort((a, b) => Number(b) - Number(a));
  if (availableYears.length === 0) {
    availableYears.push(String(today.getFullYear()));
  }

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const handleMonthSelect = (y: number, m: number) => {
    setSelectedMonth(`${y}-${String(m).padStart(2, '0')}`);
    setShowMonthPicker(false);
  };

  const prevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear = year - 1;
    }
    handleMonthSelect(newYear, newMonth);
  };

  const nextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear = year + 1;
    }
    handleMonthSelect(newYear, newMonth);
  };

  return (
    <div className="min-h-screen bg-clay-bg pb-20">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="flex items-center gap-2 text-text-primary"
            >
              <h1 className="text-2xl font-bold">{year}年{month}月</h1>
              {showMonthPicker ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {showMonthPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl z-50 w-64 p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => handleMonthSelect(year - 1, month)}
                    className="text-text-secondary hover:text-clay-primary"
                  >
                    上一年
                  </button>
                  <span className="font-bold text-text-primary">{year}年</span>
                  <button
                    onClick={() => handleMonthSelect(year + 1, month)}
                    className="text-text-secondary hover:text-clay-primary"
                  >
                    下一年
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {months.map(m => (
                    <button
                      key={m}
                      onClick={() => handleMonthSelect(year, m)}
                      className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                        m === month
                          ? 'bg-clay-primary text-white'
                          : 'hover:bg-gray-100 text-text-secondary'
                      }`}
                    >
                      {m}月
                    </button>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedMonth(getCurrentMonth());
                      setShowMonthPicker(false);
                    }}
                    className="w-full py-2 text-clay-primary hover:bg-gray-50 rounded-lg text-sm"
                  >
                    本月
                  </button>
                </div>
              </div>
            )}
          </div>
          <button 
            className="clay-button w-12 h-12 flex items-center justify-center text-text-secondary"
            onClick={() => navigate('/profile')}
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={prevMonth}
            className="clay-button px-3 py-1 text-sm text-text-secondary"
          >
            上月
          </button>
          <span className="text-text-tertiary text-sm">
            {year}年{month}月支出
          </span>
          <button
            onClick={nextMonth}
            className="clay-button px-3 py-1 text-sm text-text-secondary"
          >
            下月
          </button>
        </div>

        <ClayCard className="p-6 mb-6">
          <p className="text-text-secondary text-sm mb-2">{year}年{month}月支出</p>
          <p className="text-4xl font-bold text-text-primary mb-4">¥{totalExpense.toFixed(2)}</p>
          <p className="text-text-tertiary text-sm mb-4">预算 ¥{budget} · 已用 {usedPercent.toFixed(0)}%</p>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-clay-primary rounded-full transition-all duration-500"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </ClayCard>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <ClayCard className="p-4 flex flex-col items-center justify-center" onClick={() => navigate('/add')}>
            <PenTool size={28} className="text-clay-primary mb-2" />
            <span className="text-text-secondary text-sm">手动记账</span>
          </ClayCard>
          <ClayCard className="p-4 flex flex-col items-center justify-center" onClick={() => navigate('/voice')}>
            <Mic size={28} className="text-clay-primary mb-2" />
            <span className="text-text-secondary text-sm">语音记账</span>
          </ClayCard>
          <ClayCard className="p-4 flex flex-col items-center justify-center" onClick={() => navigate('/import')}>
            <Upload size={28} className="text-clay-primary mb-2" />
            <span className="text-text-secondary text-sm">Excel导入</span>
          </ClayCard>
          <ClayCard className="p-4 flex flex-col items-center justify-center" onClick={() => navigate('/categories')}>
            <FolderOpen size={28} className="text-clay-primary mb-2" />
            <span className="text-text-secondary text-sm">分类管理</span>
          </ClayCard>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">{year}年{month}月账单</h2>
          <span className="text-text-tertiary text-sm">{sortedTransactions.length}条记录</span>
        </div>

        {Object.entries(groupedTransactions).map(([date, items]) => (
          <div key={date} className="mb-4">
            <p className="text-text-tertiary text-xs mb-2 ml-2">{date}</p>
            {items.map((transaction) => {
              const category = getCategoryById(transaction.categoryL2);
              const CategoryIcon = getIcon(category?.icon || 'other');
              return (
                <ClayCard 
                  key={transaction.id} 
                  className="p-4 flex items-center justify-between mb-2"
                  onClick={() => navigate(`/add?id=${transaction.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category?.color}20` }}
                    >
                      <CategoryIcon size={22} style={{ color: category?.color }} />
                    </div>
                    <div>
                      <p className="text-text-primary font-medium">{transaction.merchant}</p>
                      <p className="text-text-tertiary text-xs">{category?.name}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${transaction.type === 'expense' ? 'text-red-400' : 'text-green-500'}`}>
                    {transaction.type === 'expense' ? '-' : '+'}¥{transaction.amount.toFixed(2)}
                  </p>
                </ClayCard>
              );
            })}
          </div>
        ))}

        {sortedTransactions.length === 0 && (
          <div className="text-center py-10 text-text-tertiary">
            <FileText size={48} className="mb-2 text-clay-muted" />
            <p>{year}年{month}月还没有账单记录</p>
            <ClayButton className="mt-4 px-6 py-2" onClick={() => navigate('/add')}>
              记一笔
            </ClayButton>
          </div>
        )}
      </div>
    </div>
  );
};
