import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClayCard, PieChart } from '@/components';
import { useTransactionStore, useCategoryStore } from '@/store/useStore';

const today = new Date();
const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

export const Stats = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const { getTransactionsByMonth, getTotalExpense, getTotalIncome } = useTransactionStore();
  const getCategoryById = useCategoryStore((state) => state.getCategoryById);

  const totalExpense = getTotalExpense(selectedMonth);
  const totalIncome = getTotalIncome(selectedMonth);
  const balance = totalIncome - totalExpense;

  const transactions = getTransactionsByMonth(selectedMonth);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { amount: number; count: number }> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!stats[t.categoryL1]) {
          stats[t.categoryL1] = { amount: 0, count: 0 };
        }
        stats[t.categoryL1].amount += t.amount;
        stats[t.categoryL1].count += 1;
      });
    return stats;
  }, [transactions]);

  const pieChartData = useMemo(() => {
    return Object.entries(categoryStats).map(([catId, data]) => {
      const category = getCategoryById(catId);
      return {
        name: category?.name || catId,
        value: data.amount,
        color: category?.color || '#D5D8DC',
      };
    }).filter(d => d.value > 0);
  }, [categoryStats, getCategoryById]);

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth === 0) {
      newMonth = 12;
      newYear -= 1;
    }
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth === 13) {
      newMonth = 1;
      newYear += 1;
    }
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  return (
    <div className="min-h-screen bg-clay-bg pb-20">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            className="text-text-secondary text-lg"
            onClick={() => navigate('/')}
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-text-primary">统计分析</h1>
          <div className="w-6" />
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <button 
            className="clay-button w-10 h-10 flex items-center justify-center"
            onClick={handlePrevMonth}
          >
            ←
          </button>
          <span className="text-xl font-bold text-text-primary">
            {selectedMonth.replace('-', '年')}月
          </span>
          <button 
            className="clay-button w-10 h-10 flex items-center justify-center"
            onClick={handleNextMonth}
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <ClayCard className="p-4 flex flex-col items-center">
            <p className="text-text-tertiary text-xs mb-2">总收入</p>
            <p className="text-lg font-bold text-green-500">¥{totalIncome.toFixed(2)}</p>
          </ClayCard>
          <ClayCard className="p-4 flex flex-col items-center">
            <p className="text-text-tertiary text-xs mb-2">总支出</p>
            <p className="text-lg font-bold text-red-400">¥{totalExpense.toFixed(2)}</p>
          </ClayCard>
          <ClayCard className="p-4 flex flex-col items-center">
            <p className="text-text-tertiary text-xs mb-2">结余</p>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-400'}`}>
              ¥{balance.toFixed(2)}
            </p>
          </ClayCard>
        </div>

        <ClayCard className="p-6 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">分类支出</h2>
          {pieChartData.length > 0 ? (
            <PieChart data={pieChartData} />
          ) : (
            <div className="text-center py-10 text-text-tertiary">
              <p>暂无数据</p>
            </div>
          )}
        </ClayCard>

        <h2 className="text-lg font-bold text-text-primary mb-4">分类明细</h2>
        {Object.entries(categoryStats).map(([catId, data]) => {
          const category = getCategoryById(catId);
          const percent = totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0;
          return (
            <ClayCard key={catId} className="p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category?.color }}
                  >
                    {category?.icon}
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">{category?.name}</p>
                    <p className="text-text-tertiary text-xs">{data.count}笔</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-text-primary font-bold">¥{data.amount.toFixed(2)}</p>
                  <p className="text-text-tertiary text-xs">{percent.toFixed(1)}%</p>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%`, backgroundColor: category?.color }}
                />
              </div>
            </ClayCard>
          );
        })}

        {Object.keys(categoryStats).length === 0 && (
          <div className="text-center py-10 text-text-tertiary">
            <p>本月暂无支出记录</p>
          </div>
        )}
      </div>
    </div>
  );
};
