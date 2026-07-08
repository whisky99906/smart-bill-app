import { useNavigate } from 'react-router-dom';
import { ClayCard } from '@/components';
import { useTransactionStore } from '@/store/useStore';
import { ArrowLeft, FolderOpen, Store, Upload, Wallet, Download, Settings, ChevronRight, User } from 'lucide-react';

const menuItems = [
  { Icon: FolderOpen, label: '分类管理', path: '/categories' },
  { Icon: Store, label: '商户规则库', path: '/merchant-rules' },
  { Icon: Upload, label: 'Excel导入记账', path: '/import' },
  { Icon: Wallet, label: '预算设置', path: '/budget' },
  { Icon: Download, label: '数据导出', path: '/export' },
  { Icon: Settings, label: '设置', path: '/settings' },
];

export const Profile = () => {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();

  const daysCount = new Set(transactions.map(t => t.date.split('-').slice(0, 2).join('-'))).size;

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
          <h1 className="text-xl font-bold text-text-primary">我的</h1>
          <div className="w-6" />
        </div>

        <ClayCard className="p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-clay-primary/20 flex items-center justify-center">
            <User size={32} className="text-clay-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">威士忌</h2>
            <p className="text-text-tertiary text-sm">已记账 {daysCount} 天</p>
          </div>
        </ClayCard>

        <div className="space-y-3">
          {menuItems.map((item) => (
            <ClayCard 
              key={item.label} 
              className="p-4 flex items-center justify-between"
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-center gap-3">
                <item.Icon size={22} className="text-clay-primary" />
                <span className="text-text-primary">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-text-tertiary" />
            </ClayCard>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-text-tertiary text-xs">智能记账 App v1.0</p>
          <p className="text-text-tertiary text-xs mt-1">粘土拟态风格</p>
        </div>
      </div>
    </div>
  );
};
