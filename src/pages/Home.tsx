import { useNavigate } from 'react-router-dom';
import { ClayCard, ClayButton } from '@/components';
import { useTransactionStore, useCategoryStore } from '@/store/useStore';

const today = new Date();
const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

export const Home = () => {
  const navigate = useNavigate();
  const { transactions, getTotalExpense } = useTransactionStore();
  const getCategoryById = useCategoryStore((state) => state.getCategoryById);

  const totalExpense = getTotalExpense(currentMonth);
  const budget = 3000;
  const usedPercent = Math.min((totalExpense / budget) * 100, 100);

  const recentTransactions = transactions.slice(0, 8);

  const groupedTransactions = recentTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof recentTransactions>);

  return (
    <div className="min-h-screen bg-clay-bg pb-20">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">你好，威士忌 👋</h1>
            <p className="text-text-tertiary text-sm mt-1">
              {today.getFullYear()}年{today.getMonth() + 1}月
            </p>
          </div>
          <button 
            className="clay-button w-10 h-10 flex items-center justify-center text-text-secondary"
            onClick={() => navigate('/profile')}
          >
            ⚙️
          </button>
        </div>

        <ClayCard className="p-6 mb-6">
          <p className="text-text-secondary text-sm mb-2">本月支出</p>
          <p className="text-4xl font-bold text-text-primary mb-4">¥{totalExpense.toFixed(2)}</p>
          <p className="text-text-tertiary text-sm mb-4">预算 ¥{budget} · 已用 {usedPercent.toFixed(0)}%</p>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-clay-yellow rounded-full transition-all duration-500"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </ClayCard>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <ClayCard className="p-4 flex flex-col items-center justify-center" onClick={() => navigate('/add')}>
            <span className="text-3xl mb-2">✏️</span>
            <span className="text-text-secondary text-sm">手动记账</span>
          </ClayCard>
          <ClayCard className="p-4 flex flex-col items-center justify-center" onClick={() => navigate('/add')}>
            <span className="text-3xl mb-2">🎤</span>
            <span className="text-text-secondary text-sm">语音记账</span>
          </ClayCard>
          <ClayCard className="p-4 flex flex-col items-center justify-center" onClick={() => navigate('/import')}>
            <span className="text-3xl mb-2">📊</span>
            <span className="text-text-secondary text-sm">Excel导入</span>
          </ClayCard>
          <ClayCard className="p-4 flex flex-col items-center justify-center" onClick={() => navigate('/categories')}>
            <span className="text-3xl mb-2">📁</span>
            <span className="text-text-secondary text-sm">分类管理</span>
          </ClayCard>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">最近账单</h2>
          <button className="text-clay-purple text-sm">查看全部 &gt;</button>
        </div>

        {Object.entries(groupedTransactions).map(([date, items]) => (
          <div key={date} className="mb-4">
            <p className="text-text-tertiary text-xs mb-2 ml-2">{date}</p>
            {items.map((transaction) => {
              const category = getCategoryById(transaction.categoryL2);
              return (
                <ClayCard 
                  key={transaction.id} 
                  className="p-4 flex items-center justify-between mb-2"
                  onClick={() => navigate(`/add?id=${transaction.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: category?.color }}
                    >
                      {category?.icon}
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

        {recentTransactions.length === 0 && (
          <div className="text-center py-10 text-text-tertiary">
            <p className="text-4xl mb-2">📝</p>
            <p>还没有账单记录</p>
            <ClayButton className="mt-4 px-6 py-2" onClick={() => navigate('/add')}>
              记一笔
            </ClayButton>
          </div>
        )}
      </div>
    </div>
  );
};
