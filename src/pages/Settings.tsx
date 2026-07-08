import { useNavigate } from 'react-router-dom';
import { ClayCard } from '@/components';

const settingsItems = [
  { label: '账户与安全', icon: '🔐' },
  { label: '通知设置', icon: '🔔' },
  { label: '数据管理', icon: '💾' },
  { label: '关于我们', icon: 'ℹ️' },
  { label: '隐私政策', icon: '📜' },
  { label: '用户协议', icon: '📋' },
];

export const Settings = () => {
  const navigate = useNavigate();

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
          <h1 className="text-xl font-bold text-text-primary">设置</h1>
          <div className="w-6" />
        </div>

        <div className="space-y-3">
          {settingsItems.map((item) => (
            <ClayCard 
              key={item.label} 
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-text-primary">{item.label}</span>
              </div>
              <span className="text-text-tertiary">→</span>
            </ClayCard>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-text-tertiary text-xs">智能记账 App v1.0</p>
          <p className="text-text-tertiary text-xs mt-1">Made with ❤️</p>
        </div>
      </div>
    </div>
  );
};
