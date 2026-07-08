import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClayCard, ClayButton } from '@/components';
import { useTransactionStore } from '@/store/useStore';
import { ArrowLeft } from 'lucide-react';

const today = new Date();
const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

export const Budget = () => {
  const navigate = useNavigate();
  const [budgetAmount, setBudgetAmount] = useState('3000');
  const { getTotalExpense } = useTransactionStore();
  
  const totalExpense = getTotalExpense(currentMonth);
  const budget = parseFloat(budgetAmount) || 0;
  const usedPercent = Math.min((totalExpense / budget) * 100, 100);

  return (
    <div className="min-h-screen bg-clay-bg pb-20">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            className="text-text-secondary text-lg"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-text-primary">预算设置</h1>
          <div className="w-6" />
        </div>

        <ClayCard className="p-6 mb-6">
          <p className="text-text-secondary text-sm mb-4">本月预算</p>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl text-text-primary">¥</span>
            <input
              type="number"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              className="text-4xl font-bold text-text-primary bg-transparent outline-none"
            />
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-clay-primary rounded-full transition-all duration-500"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <p className="text-text-tertiary text-sm">
            已用 {usedPercent.toFixed(0)}% · ¥{totalExpense.toFixed(2)} / ¥{budget.toFixed(2)}
          </p>
        </ClayCard>

        <ClayCard className="p-4 mb-4">
          <p className="text-text-tertiary text-xs mb-2">预算提醒</p>
          <div className="flex items-center justify-between">
            <span className="text-text-primary">当支出超过预算时提醒我</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-clay-primary"></div>
            </label>
          </div>
        </ClayCard>

        <ClayCard className="p-4 mb-4">
          <p className="text-text-tertiary text-xs mb-2">提醒阈值</p>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="50"
              max="100"
              defaultValue="80"
              className="flex-1"
            />
            <span className="text-text-primary font-bold">80%</span>
          </div>
        </ClayCard>

        <ClayButton className="w-full py-4 text-lg font-bold mt-6">
          保存设置
        </ClayButton>
      </div>
    </div>
  );
};
